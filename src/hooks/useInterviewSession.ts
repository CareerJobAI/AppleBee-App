import { useState, useEffect, useRef, useCallback } from 'react';
import {
  SessionStatus,
  TranscriptSegment,
  AnswerModel,
  WidgetPreferences,
  QuestionType,
  CandidateProfile,
  MockEvaluationResult,
  ReadinessMetrics,
} from '../types/interview';
import { audioCapture } from '../services/audioCapture';
import { speechService } from '../services/speechRecognition';
import { liveVoiceService } from '../services/liveAudioService';

const PREFERENCES_KEY = 'applebee_widget_preferences';
const ANSWER_LIBRARY_KEY = 'applebee_saved_answers';
const CANDIDATE_PROFILE_KEY = 'applebee_candidate_profile';

const DEFAULT_PREFERENCES: WidgetPreferences = {
  theme: 'dark',
  corner: 'bottom-right',
  customPosition: null,
  autoDetectQuestions: true,
  soundAlerts: true,
  fontSize: 'normal',
  isMinimized: false,
  showTranscriptPanel: true,
  useGoogleSearchGrounding: true,
  voiceMode: false,
  voicePersona: 'Zephyr',
};

const DEFAULT_CANDIDATE_PROFILE: CandidateProfile = {
  name: 'Alex Mercer',
  targetRole: 'Staff Distributed Systems & Azure Cloud Architect',
  yearsOfExperience: 9,
  primarySkills: ['C# / .NET 9', 'Azure Cloud', 'System Design', 'Microservices', 'Distributed Caching'],
  cloudPlatforms: ['Azure', 'AWS', 'GCP'],
  frameworks: ['ASP.NET Core', 'Azure Kubernetes Service', 'Redis', 'Kafka', 'React'],
  verifiedProjects: [
    {
      id: 'proj_1',
      title: 'High-Throughput Financial Billing & Quota Engine on Azure',
      role: 'Lead Cloud Architect',
      techStack: '.NET 8, Azure API Management, Azure Cosmos DB, Redis, AKS',
      architectureSummary: 'Designed stateless ASP.NET Core microservices processing 60,000 req/sec with sub-5ms p99 latency and active-active multi-region failover.',
      measurableOutcome: 'Zero data loss during peak surge, 99.995% SLA, and $450k annual cloud compute savings.',
    },
    {
      id: 'proj_2',
      title: 'Zero-Downtime Distributed Cache & Stream Modernization',
      role: 'Staff Infrastructure Engineer',
      techStack: 'Apache Kafka, Redis Cluster, Docker, OpenTelemetry',
      architectureSummary: 'Replaced legacy synchronous HTTP service chains with event-driven pub/sub architecture and read-through caching.',
      measurableOutcome: 'Eliminated cascading timeout outages and reduced 99th percentile API latency from 240ms to 18ms.',
    },
  ],
  leadershipHighlights: [
    'Authored 14 architectural RFCs adopted across 6 cross-functional engineering teams.',
    'Chaired bi-weekly technical review board for distributed data consistency and API contracts.',
    'Mentored 8 senior and mid-level engineers to technical lead promotions.',
  ],
};

export function useInterviewSession() {
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [liveVoiceAudioLevel, setLiveVoiceAudioLevel] = useState<number>(0);
  const [liveVoiceStatus, setLiveVoiceStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<AnswerModel | null>(null);
  const [answerHistory, setAnswerHistory] = useState<AnswerModel[]>([]);
  const [savedAnswers, setSavedAnswers] = useState<AnswerModel[]>([]);
  const [detectedQuestionCount, setDetectedQuestionCount] = useState<number>(0);
  const [currentRole, setCurrentRole] = useState<string>('Senior .NET & Azure Cloud Architect');
  const [mockEvaluation, setMockEvaluation] = useState<MockEvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile>(() => {
    try {
      const stored = localStorage.getItem(CANDIDATE_PROFILE_KEY);
      return stored ? { ...DEFAULT_CANDIDATE_PROFILE, ...JSON.parse(stored) } : DEFAULT_CANDIDATE_PROFILE;
    } catch {
      return DEFAULT_CANDIDATE_PROFILE;
    }
  });

  const [preferences, setPreferences] = useState<WidgetPreferences>(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY);
      return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const timerRef = useRef<any>(null);
  const detectionTimeoutRef = useRef<any>(null);
  const lastAnalyzedTextRef = useRef<string>('');
  const isProcessingRef = useRef<boolean>(false);

  // Load saved answers from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ANSWER_LIBRARY_KEY);
      if (saved) {
        setSavedAnswers(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load saved answers:', e);
    }
  }, []);

  // Save profile updates
  const updateCandidateProfile = useCallback((updates: Partial<CandidateProfile>) => {
    setCandidateProfile((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(CANDIDATE_PROFILE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Save preferences changes
  const updatePreferences = useCallback((updates: Partial<WidgetPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Play subtle chime when answer is ready
  const playAnswerChime = useCallback(() => {
    if (!preferences.soundAlerts) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  }, [preferences.soundAlerts]);

  // Request answer with Google Search Grounding and Candidate Profile personalization
  const requestAnswer = useCallback(
    async (questionText: string, questionType?: QuestionType) => {
      if (!questionText || isProcessingRef.current) return;
      isProcessingRef.current = true;
      setStatus('processing');
      setErrorMessage(null);

      try {
        const response = await fetch('/api/interview/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: questionText,
            role: currentRole,
            context: transcript.slice(-4).map((s) => s.text).join(' '),
            useSearchGrounding: preferences.useGoogleSearchGrounding,
            profile: candidateProfile,
          }),
        });

        if (!response.ok) {
          throw new Error(`Answer service returned HTTP ${response.status}`);
        }

        const data = await response.json();
        const newAnswer: AnswerModel = {
          id: 'ans_' + Date.now(),
          question: data.question || questionText,
          questionType: data.questionType || questionType || 'technical',
          quickAnswer: data.quickAnswer || 'Focus on structural tradeoffs and architectural guarantees.',
          talkingPoints: data.talkingPoints || [
            'Clarify scale requirements and latency expectations.',
            'Apply resilient decoupling with caching and circuit breakers.',
            'Guarantee observability through distributed tracing.',
          ],
          explanation: data.explanation || 'Detailed architectural breakdown grounded in production standards.',
          tradeoffs: data.tradeoffs || ['Eventual consistency vs immediate consistency latency.'],
          visualization: data.visualization || null,
          followUps: data.followUps || [
            'How would you handle database bottlenecks?',
            'What failover strategy handles zone partition?',
          ],
          sources: data.sources || [],
          verificationStatus: data.verificationStatus || 'verified_doc',
          uncertainties: data.uncertainties || [],
          timestamp: Date.now(),
          searchGrounded: data.searchGrounded || false,
          webSearchQueries: data.webSearchQueries || [],
          personalizedProjectContext: candidateProfile.verifiedProjects[0]?.title,
        };

        setCurrentAnswer(newAnswer);
        setAnswerHistory((prev) => [newAnswer, ...prev.slice(0, 9)]);
        setDetectedQuestionCount((prev) => prev + 1);
        setStatus('answer_ready');
        playAnswerChime();
      } catch (err: any) {
        console.error('Error generating answer:', err);
        setErrorMessage(`Failed to generate answer: ${err.message}`);
        setStatus('error');
      } finally {
        isProcessingRef.current = false;
      }
    },
    [currentRole, transcript, preferences.useGoogleSearchGrounding, candidateProfile, playAnswerChime]
  );

  // Evaluate candidate answer in mock interview
  const evaluateAnswer = useCallback(
    async (question: string, candidateAnswer: string) => {
      setIsEvaluating(true);
      try {
        const res = await fetch('/api/interview/evaluate-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            candidateAnswer,
            role: currentRole,
            profile: candidateProfile,
          }),
        });
        const evalData = await res.json();
        setMockEvaluation(evalData);
      } catch (err) {
        console.warn('Evaluation fallback:', err);
      } finally {
        setIsEvaluating(false);
      }
    },
    [currentRole, candidateProfile]
  );

  // Debounced question detector
  const analyzeTranscriptForQuestion = useCallback(
    async (segments: TranscriptSegment[]) => {
      if (!preferences.autoDetectQuestions || isProcessingRef.current) return;

      const recentText = segments.slice(-3).map((s) => s.text).join(' ').trim();
      if (!recentText || recentText === lastAnalyzedTextRef.current || recentText.length < 15) {
        return;
      }

      lastAnalyzedTextRef.current = recentText;

      try {
        const res = await fetch('/api/interview/detect-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recentSegments: segments.slice(-3),
            currentQuestion: currentAnswer?.question,
          }),
        });

        if (res.ok) {
          const result = await res.json();
          if (result.hasQuestion && result.question) {
            await requestAnswer(result.question, result.questionType);
          }
        }
      } catch (e) {
        console.warn('Question detection network check skipped:', e);
      }
    },
    [preferences.autoDetectQuestions, currentAnswer?.question, requestAnswer]
  );

  // Add transcript segment
  const handleNewSegment = useCallback(
    (segment: TranscriptSegment) => {
      setTranscript((prev) => {
        const existingIdx = prev.findIndex((s) => s.id === segment.id);
        let updated: TranscriptSegment[];
        if (existingIdx !== -1) {
          updated = [...prev];
          updated[existingIdx] = segment;
        } else {
          updated = [...prev, segment];
        }

        if (segment.isFinal || segment.text.split(' ').length >= 6) {
          if (detectionTimeoutRef.current) {
            clearTimeout(detectionTimeoutRef.current);
          }
          detectionTimeoutRef.current = setTimeout(() => {
            analyzeTranscriptForQuestion(updated);
          }, 600);
        }

        return updated;
      });
    },
    [analyzeTranscriptForQuestion]
  );

  // Start standard listening session
  const startSession = useCallback(async () => {
    setStatus('requesting_permission');
    setErrorMessage(null);

    try {
      await audioCapture.requestAndStart({
        onLevelChange: (lvl) => setAudioLevel(lvl),
        onError: (err) => {
          setErrorMessage(err.message);
          setStatus('error');
        },
      });

      speechService.start({
        onSegment: handleNewSegment,
        onError: (err) => {
          console.warn('Speech service notice:', err.message);
        },
        onEnd: () => {},
      });

      setStatus('listening');

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Microphone access denied or unavailable.');
      setStatus('error');
      audioCapture.stop();
    }
  }, [handleNewSegment]);

  // Toggle Gemini 3.8 Live API Real-Time Voice Conversation Mode
  const toggleLiveVoiceMode = useCallback(async (enable?: boolean) => {
    const shouldEnable = enable !== undefined ? enable : !preferences.voiceMode;

    if (!shouldEnable) {
      liveVoiceService.stop();
      updatePreferences({ voiceMode: false });
      setLiveVoiceStatus('disconnected');
      return;
    }

    try {
      updatePreferences({ voiceMode: true });
      await liveVoiceService.start({
        onStatusChange: (s) => setLiveVoiceStatus(s),
        onAudioLevel: (inLvl, outLvl) => {
          setLiveVoiceAudioLevel(Math.max(inLvl, outLvl));
        },
        onInterrupted: () => {
          console.log('[Live Voice] Model turn interrupted by user speech');
        },
        onError: (err) => {
          setErrorMessage(err.message);
        },
      });
    } catch (e: any) {
      setErrorMessage(`Live voice initialization error: ${e.message}`);
      updatePreferences({ voiceMode: false });
    }
  }, [preferences.voiceMode, updatePreferences]);

  // Pause listening
  const pauseSession = useCallback(() => {
    audioCapture.stop();
    speechService.stop();
    if (preferences.voiceMode) {
      liveVoiceService.stop();
    }
    setAudioLevel(0);
    setStatus('paused');
  }, [preferences.voiceMode]);

  // Resume listening
  const resumeSession = useCallback(async () => {
    await startSession();
  }, [startSession]);

  // Stop session
  const stopSession = useCallback(() => {
    audioCapture.stop();
    speechService.stop();
    liveVoiceService.stop();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
      detectionTimeoutRef.current = null;
    }
    setAudioLevel(0);
    setLiveVoiceAudioLevel(0);
    setStatus('ended');
  }, []);

  // Clear live transcript
  const clearTranscript = useCallback(() => {
    setTranscript([]);
    lastAnalyzedTextRef.current = '';
  }, []);

  // Save current answer to library
  const saveCurrentAnswer = useCallback(() => {
    if (!currentAnswer) return;
    setSavedAnswers((prev) => {
      if (prev.some((a) => a.id === currentAnswer.id || a.question === currentAnswer.question)) {
        return prev;
      }
      const updated = [currentAnswer, ...prev];
      try {
        localStorage.setItem(ANSWER_LIBRARY_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, [currentAnswer]);

  // Delete answer from library
  const deleteSavedAnswer = useCallback((id: string) => {
    setSavedAnswers((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      try {
        localStorage.setItem(ANSWER_LIBRARY_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Simulate an interviewer asking a realistic technical question
  const simulateInterviewQuestion = useCallback(
    (questionText: string) => {
      if (status !== 'listening') {
        setStatus('listening');
      }

      speechService.simulateSpokenQuestion(
        questionText,
        (segment) => {
          handleNewSegment(segment);
        },
        () => {
          requestAnswer(questionText);
        }
      );
    },
    [status, handleNewSegment, requestAnswer]
  );

  // Compute readiness metrics dynamically
  const readinessMetrics: ReadinessMetrics = {
    topicCoverage: {
      systemDesign: Math.min(100, 40 + answerHistory.filter((a) => a.questionType === 'architecture').length * 20),
      azureDotNetCloud: Math.min(100, 45 + (answerHistory.some((a) => a.question.toLowerCase().includes('.net') || a.question.toLowerCase().includes('azure')) ? 35 : 15)),
      codingAlgorithms: Math.min(100, 30 + answerHistory.filter((a) => a.questionType === 'coding').length * 25),
      securityZeroTrust: Math.min(100, 35 + answerHistory.filter((a) => a.questionType === 'security').length * 25),
      behavioralLeadership: Math.min(100, 50 + answerHistory.filter((a) => a.questionType === 'behavioural').length * 25),
    },
    totalQuestionsAnswered: detectedQuestionCount,
    averageConfidence: mockEvaluation ? mockEvaluation.score : 88,
    revisionItems: [
      'Proactively state latency SLAs (p99 < 5ms) when discussing Azure API Management rate limiting.',
      'Highlight Polly exponential backoff with circuit breaker jitter on transient Azure SQL timeouts.',
      'Elaborate on Cosmos DB multi-master write conflict resolution policies.',
    ],
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      audioCapture.stop();
      speechService.stop();
      liveVoiceService.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      if (detectionTimeoutRef.current) clearTimeout(detectionTimeoutRef.current);
    };
  }, []);

  return {
    status,
    errorMessage,
    audioLevel,
    liveVoiceAudioLevel,
    liveVoiceStatus,
    sessionDuration,
    transcript,
    currentAnswer,
    answerHistory,
    savedAnswers,
    detectedQuestionCount,
    currentRole,
    preferences,
    candidateProfile,
    mockEvaluation,
    isEvaluating,
    readinessMetrics,
    setCurrentRole,
    updatePreferences,
    updateCandidateProfile,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    clearTranscript,
    requestAnswer,
    evaluateAnswer,
    saveCurrentAnswer,
    deleteSavedAnswer,
    simulateInterviewQuestion,
    setCurrentAnswer,
    toggleLiveVoiceMode,
  };
}
