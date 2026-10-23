import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SessionStatus, WidgetCorner, WidgetPosition } from '../../types/interview';
import { useInterviewSession } from '../../hooks/useInterviewSession';
import { WidgetLauncher } from './WidgetLauncher';
import { WidgetHeader } from './WidgetHeader';
import { QuickAnswerCard } from './QuickAnswerCard';
import { TranscriptPanel } from './TranscriptPanel';
import { WidgetControls } from './WidgetControls';
import { MessageSquare, Sparkles, History, Radio, Bookmark } from 'lucide-react';

interface LiveInterviewWidgetProps {
  session: ReturnType<typeof useInterviewSession>;
}

export const LiveInterviewWidget: React.FC<LiveInterviewWidgetProps> = ({ session }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'answer' | 'transcript' | 'history'>('answer');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [position, setPosition] = useState<WidgetPosition | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  const {
    status,
    errorMessage,
    audioLevel,
    sessionDuration,
    transcript,
    currentAnswer,
    answerHistory,
    savedAnswers,
    detectedQuestionCount,
    preferences,
    updatePreferences,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    clearTranscript,
    requestAnswer,
    saveCurrentAnswer,
    simulateInterviewQuestion,
    setCurrentAnswer,
    activeVoiceEntities,
    isModelSpeaking,
    liveVoiceHighlightSummary,
  } = session;

  // Auto-switch to answer tab when an answer arrives
  useEffect(() => {
    if (status === 'answer_ready') {
      setActiveTab('answer');
    }
  }, [status]);

  // Global keyboard shortcuts (Option + Space or Ctrl + Shift + L)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle widget with Option/Alt + Space or Ctrl+Shift+L
      if ((e.altKey && e.code === 'Space') || (e.ctrlKey && e.shiftKey && e.code === 'KeyL')) {
        e.preventDefault();
        setIsExpanded((prev) => !prev);
      }
      // Escape closes the expanded panel without ending the recording session
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  // Handle Corner placement styles
  const getCornerStyles = () => {
    if (position && preferences.corner === 'custom') {
      return {
        left: `${position.x}px`,
        top: `${position.y}px`,
        bottom: 'auto',
        right: 'auto',
      };
    }

    switch (preferences.corner) {
      case 'bottom-left':
        return { bottom: '24px', left: '24px' };
      case 'top-right':
        return { top: '24px', right: '24px' };
      case 'top-left':
        return { top: '24px', left: '24px' };
      case 'bottom-right':
      default:
        return { bottom: '24px', right: '24px' };
    }
  };

  // Dragging support
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only allow drag on header or launcher
    if ((e.target as HTMLElement).closest('button, input, select, textarea, pre, a')) {
      return;
    }

    if (widgetRef.current) {
      const rect = widgetRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const widgetWidth = widgetRef.current?.offsetWidth || 380;
    const widgetHeight = widgetRef.current?.offsetHeight || 500;
    const maxX = window.innerWidth - widgetWidth - 12;
    const maxY = window.innerHeight - widgetHeight - 12;

    const newX = Math.max(12, Math.min(maxX, e.clientX - dragOffset.x));
    const newY = Math.max(12, Math.min(maxY, e.clientY - dragOffset.y));

    setPosition({ x: newX, y: newY });
    updatePreferences({ corner: 'custom', customPosition: { x: newX, y: newY } });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  return (
    <>
      {/* Screen reader live announcement region for non-disruptive accessibility updates */}
      <div className="sr-only" role="status" aria-live="polite">
        {status === 'listening' && 'Applebee microphone listening active'}
        {status === 'processing' && 'Analyzing interview question'}
        {status === 'answer_ready' && currentAnswer && `New answer ready for: ${currentAnswer.question}`}
      </div>

      <div
        ref={widgetRef}
        style={getCornerStyles()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`fixed z-50 transition-shadow ${
          isDragging ? 'cursor-grabbing opacity-95' : ''
        }`}
      >
        {!isExpanded ? (
          /* Collapsed Floating Launcher */
          <WidgetLauncher
            status={status}
            detectedCount={detectedQuestionCount}
            audioLevel={audioLevel}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded(true)}
            onStartListening={startSession}
          />
        ) : (
          /* Expanded Floating Panel */
          <div
            id="applebee-interview-panel"
            role="dialog"
            aria-label="Applebee Live Interview Copilot"
            className={`w-[92vw] sm:w-[440px] max-h-[88vh] flex flex-col rounded-xl shadow-2xl border backdrop-blur-xl overflow-hidden transition-all duration-200 ${
              preferences.theme === 'dark'
                ? 'bg-zinc-950/95 border-zinc-800 text-zinc-100 shadow-purple-950/20'
                : 'bg-zinc-900/95 border-zinc-700 text-zinc-100 shadow-xl'
            }`}
          >
            {/* 1. Header & Session Status */}
            <WidgetHeader
              status={status}
              sessionDuration={sessionDuration}
              theme={preferences.theme}
              corner={preferences.corner}
              isMinimized={preferences.isMinimized}
              onToggleMinimize={() =>
                updatePreferences({ isMinimized: !preferences.isMinimized })
              }
              onToggleTheme={() =>
                updatePreferences({
                  theme: preferences.theme === 'dark' ? 'light' : 'dark',
                })
              }
              onChangeCorner={(c) => {
                setPosition(null);
                updatePreferences({ corner: c, customPosition: null });
              }}
              onClose={() => setIsExpanded(false)}
              onEndSession={stopSession}
            />

            {!preferences.isMinimized && (
              <>
                {/* Navigation Sub-Tabs */}
                <div className="flex items-center border-b border-zinc-800/80 bg-zinc-900/40 text-[11px] px-2">
                  <button
                    onClick={() => setActiveTab('answer')}
                    className={`flex items-center gap-1.5 py-2 px-3 border-b-2 font-medium transition-colors ${
                      activeTab === 'answer'
                        ? 'border-purple-500 text-purple-300'
                        : 'border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Answer Intelligence</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('transcript')}
                    className={`flex items-center gap-1.5 py-2 px-3 border-b-2 font-medium transition-colors ${
                      activeTab === 'transcript'
                        ? 'border-purple-500 text-purple-300'
                        : 'border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Radio className="w-3 h-3" />
                    <span>Live Transcript</span>
                    {transcript.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-1.5 py-2 px-3 border-b-2 font-medium transition-colors ${
                      activeTab === 'history'
                        ? 'border-purple-500 text-purple-300'
                        : 'border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <History className="w-3 h-3" />
                    <span>History ({answerHistory.length})</span>
                  </button>
                </div>

                {/* Main Scrollable Content Body */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 min-h-[160px] max-h-[56vh]">
                  {activeTab === 'answer' && (
                    <>
                      {currentAnswer ? (
                        <QuickAnswerCard
                          answer={currentAnswer}
                          onFollowUp={(q) => requestAnswer(q)}
                          onSave={saveCurrentAnswer}
                          onRegenerate={() => requestAnswer(currentAnswer.question)}
                          isSaved={savedAnswers.some(
                            (a) => a.id === currentAnswer.id || a.question === currentAnswer.question
                          )}
                          activeVoiceEntities={activeVoiceEntities}
                          isLiveVoiceActive={isModelSpeaking}
                          liveVoiceHighlightSummary={liveVoiceHighlightSummary}
                        />
                      ) : (
                        <div className="py-8 text-center text-zinc-500 text-xs space-y-2">
                          <div className="w-10 h-10 rounded-full bg-purple-950/40 border border-purple-800/40 flex items-center justify-center mx-auto text-purple-400">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <p className="font-medium text-zinc-300">Awaiting Interview Question</p>
                          <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                            Start listening or select a test question below. When the interviewer
                            speaks, Applebee detects the prompt and surfaces structured answers.
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === 'transcript' && (
                    <TranscriptPanel
                      transcript={transcript}
                      onManualQuestionSubmit={(q) => {
                        setActiveTab('answer');
                        requestAnswer(q);
                      }}
                      onClearTranscript={clearTranscript}
                      onSelectSegment={(text) => {
                        setActiveTab('answer');
                        requestAnswer(text);
                      }}
                    />
                  )}

                  {activeTab === 'history' && (
                    <div className="space-y-2 text-xs">
                      {answerHistory.length === 0 ? (
                        <p className="text-zinc-500 text-center py-6 text-[11px]">
                          No previous answers recorded in this session.
                        </p>
                      ) : (
                        answerHistory.map((ans) => (
                          <div
                            key={ans.id}
                            onClick={() => {
                              setCurrentAnswer(ans);
                              setActiveTab('answer');
                            }}
                            className="p-2.5 rounded bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 cursor-pointer transition-all"
                          >
                            <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                              <span className="font-mono uppercase text-purple-300">
                                {ans.questionType}
                              </span>
                              <span>
                                {new Date(ans.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <div className="font-semibold text-zinc-200 line-clamp-1 text-[11px]">
                              {ans.question}
                            </div>
                            <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5">
                              {ans.quickAnswer}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Session Audio & Simulation Controls */}
                <WidgetControls
                  status={status}
                  audioLevel={audioLevel}
                  liveVoiceAudioLevel={session.liveVoiceAudioLevel}
                  liveVoiceStatus={session.liveVoiceStatus}
                  isLiveVoiceActive={preferences.voiceMode}
                  useSearchGrounding={preferences.useGoogleSearchGrounding}
                  voicePersona={preferences.voicePersona}
                  errorMessage={errorMessage}
                  onStart={startSession}
                  onPause={pauseSession}
                  onResume={resumeSession}
                  onStop={stopSession}
                  onSimulateQuestion={(q) => {
                    setActiveTab('answer');
                    simulateInterviewQuestion(q);
                  }}
                  onToggleLiveVoice={() => session.toggleLiveVoiceMode()}
                  onToggleSearchGrounding={() =>
                    updatePreferences({
                      useGoogleSearchGrounding: !preferences.useGoogleSearchGrounding,
                    })
                  }
                  onChangeVoicePersona={(persona) =>
                    updatePreferences({ voicePersona: persona })
                  }
                />
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};
