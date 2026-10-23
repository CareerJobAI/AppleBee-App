import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Audio } from 'expo-av';

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [activeTab, setActiveTab] = useState<'copilot' | 'transcript' | 'visual' | 'profile'>('copilot');
  const [questionText, setQuestionText] = useState('How would you design a scalable .NET API on Azure?');
  const [isProcessing, setIsProcessing] = useState(false);

  // Active answer model
  const [currentAnswer, setCurrentAnswer] = useState({
    question: 'How would you design a scalable .NET API on Azure?',
    questionType: 'architecture',
    quickAnswer: 'Use a stateless ASP.NET Core API, secure authentication, managed data storage, appropriate scaling, caching where beneficial, and end-to-end observability.',
    talkingPoints: [
      'Security: authentication, authorisation (Azure AD / Entra ID), secret management via Azure Key Vault.',
      'Scalability: stateless services on Azure App Service / AKS and horizontal scaling where appropriate.',
      'Reliability: timeouts, retries with exponential backoff using Polly, and resilience circuit breaker patterns.',
      'Performance: Azure Cache for Redis and database query optimisation.',
      'Observability: structured logs, metrics, distributed tracing via Azure Monitor & Application Insights.',
    ],
    explanation: 'A resilient Azure cloud API decouples client ingress via Azure API Management, directing requests to autoscaling ASP.NET Core container instances. Downstream state operations leverage connection-pooled Azure SQL / Cosmos DB with Redis read-through caching to hit sub-5ms p99 latency SLAs.',
    tradeoffs: [
      'Managed cloud PaaS services reduce operational toil but increase vendor coupling.',
      'Multi-region active-active databases require conflict resolution strategies (e.g. Cosmos DB multi-master).',
    ],
    followUp: 'How would you handle database bottlenecks when traffic spikes 10x?',
    sources: [
      'Microsoft Azure Architecture Center: Highly Scalable Web Apps',
      '.NET Official Documentation: Resilience and Transient Fault Handling with Polly',
    ],
  });

  const [transcript, setTranscript] = useState([
    { id: '1', speaker: 'Interviewer', text: 'Welcome Alex. Let us start with a distributed cloud architecture scenario.', time: '10:02 AM' },
    { id: '2', speaker: 'Candidate', text: 'Sounds great. Ready when you are.', time: '10:02 AM' },
    { id: '3', speaker: 'Interviewer', text: 'How would you design a scalable .NET API on Azure to handle high burst throughput?', time: '10:03 AM' },
  ]);

  // Request microphone permission via Expo AV
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        alert('Microphone permission is required to listen to live interview questions.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.warn('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch {}
      setRecording(null);
    }
  };

  const shareAnswer = async () => {
    try {
      await Share.share({
        message: `Applebee Live Interview Response:\n\nQ: ${currentAnswer.question}\n\nQuick Answer: ${currentAnswer.quickAnswer}\n\nTalking Points:\n${currentAnswer.talkingPoints.map((tp) => `• ${tp}`).join('\n')}`,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090b" />

      {/* Mobile Top Bar */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>AB</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>Applebee Mobile</Text>
            <Text style={styles.brandSubtitle}>Expo Go Live Interview Copilot</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={isRecording ? stopRecording : startRecording}
          style={[styles.recordButton, isRecording ? styles.recordButtonActive : styles.recordButtonInactive]}
        >
          <View style={[styles.statusDot, isRecording ? styles.statusDotActive : styles.statusDotInactive]} />
          <Text style={styles.recordButtonText}>{isRecording ? 'Listening...' : 'Listen'}</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content View by Tab */}
      <View style={styles.content}>
        {activeTab === 'copilot' && (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* Detected Question Banner */}
            <View style={styles.questionCard}>
              <View style={styles.tagRow}>
                <Text style={styles.typeTag}>AZURE & .NET CLOUD</Text>
                <TouchableOpacity onPress={shareAnswer}>
                  <Text style={styles.actionLink}>Share</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.questionHeading}>"{currentAnswer.question}"</Text>
            </View>

            {/* Quick Answer */}
            <View style={styles.quickAnswerCard}>
              <Text style={styles.quickAnswerLabel}>⚡ 5-SECOND ESSENTIAL ANSWER</Text>
              <Text style={styles.quickAnswerText}>{currentAnswer.quickAnswer}</Text>
            </View>

            {/* Talking Points */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>KEY TALKING POINTS</Text>
              {currentAnswer.talkingPoints.map((tp, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{tp}</Text>
                </View>
              ))}
            </View>

            {/* Trade-offs */}
            <View style={styles.warningCard}>
              <Text style={styles.warningLabel}>ENGINEERING TRADE-OFFS & CAVEATS</Text>
              {currentAnswer.tradeoffs.map((item, i) => (
                <Text key={i} style={styles.warningText}>• {item}</Text>
              ))}
            </View>

            {/* Follow-up question */}
            <View style={styles.card}>
              <Text style={styles.followUpLabel}>LIKELY INTERVIEWER FOLLOW-UP:</Text>
              <Text style={styles.followUpText}>"{currentAnswer.followUp}"</Text>
            </View>

            {/* In-depth explanation */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>TECHNICAL DEEP DIVE</Text>
              <Text style={styles.bodyText}>{currentAnswer.explanation}</Text>
            </View>
          </ScrollView>
        )}

        {activeTab === 'transcript' && (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionHeader}>Live Spoken Audio Feed</Text>
            {transcript.map((seg) => (
              <View key={seg.id} style={styles.transcriptCard}>
                <View style={styles.transcriptMeta}>
                  <Text style={styles.speakerText}>{seg.speaker}</Text>
                  <Text style={styles.timeText}>{seg.time}</Text>
                </View>
                <Text style={styles.transcriptBody}>{seg.text}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {activeTab === 'visual' && (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionHeader}>Visual Architecture Model</Text>
            <View style={styles.diagramContainer}>
              <View style={styles.diagramNode}>
                <Text style={styles.nodeType}>INGRESS</Text>
                <Text style={styles.nodeLabel}>Client (Web / Mobile Apps)</Text>
              </View>
              <Text style={styles.diagramArrow}>▼ HTTPS / TLS 1.3</Text>
              <View style={styles.diagramNode}>
                <Text style={styles.nodeType}>GATEWAY</Text>
                <Text style={styles.nodeLabel}>Azure API Management (Rate Limiter & Auth)</Text>
              </View>
              <Text style={styles.diagramArrow}>▼ Mutual TLS / JWT</Text>
              <View style={[styles.diagramNode, styles.diagramNodeHighlight]}>
                <Text style={styles.nodeType}>COMPUTE</Text>
                <Text style={styles.nodeLabel}>ASP.NET Core API Cluster (AKS / App Service)</Text>
              </View>
              <Text style={styles.diagramArrow}>▼ Low-Latency Cache & Persistence</Text>
              <View style={styles.diagramRow}>
                <View style={[styles.diagramNodeHalf]}>
                  <Text style={styles.nodeType}>CACHE</Text>
                  <Text style={styles.nodeLabel}>Azure Redis</Text>
                </View>
                <View style={[styles.diagramNodeHalf]}>
                  <Text style={styles.nodeType}>DATABASE</Text>
                  <Text style={styles.nodeLabel}>Azure SQL / Cosmos</Text>
                </View>
              </View>
              <Text style={styles.diagramArrow}>▼ OpenTelemetry Telemetry</Text>
              <View style={styles.diagramNode}>
                <Text style={styles.nodeType}>OBSERVABILITY</Text>
                <Text style={styles.nodeLabel}>Azure Application Insights & Monitor</Text>
              </View>
            </View>
          </ScrollView>
        )}

        {activeTab === 'profile' && (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionHeader}>Verified Candidate Profile</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>CANDIDATE DETAILS</Text>
              <Text style={styles.profileName}>Alex Mercer</Text>
              <Text style={styles.profileRole}>Senior .NET & Azure Cloud Architect</Text>
              <Text style={styles.profileExp}>9 Years Professional Experience</Text>
              <Text style={styles.profileSkills}>Tech Stack: C# .NET 9, Azure, AKS, Redis, Cosmos DB, Kafka</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>VERIFIED PROJECT REFERENCE</Text>
              <Text style={styles.projectTitle}>High-Throughput Financial Billing on Azure</Text>
              <Text style={styles.bodyText}>Stateless ASP.NET Core microservices processing 60,000 req/sec with sub-5ms p99 latency.</Text>
              <Text style={styles.outcomeText}>Result: 99.995% SLA and $450k annual cloud savings.</Text>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Bottom Navigation Tabs */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('copilot')}>
          <Text style={[styles.navText, activeTab === 'copilot' && styles.navTextActive]}>Copilot</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('transcript')}>
          <Text style={[styles.navText, activeTab === 'transcript' && styles.navTextActive]}>Transcript</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('visual')}>
          <Text style={[styles.navText, activeTab === 'visual' && styles.navTextActive]}>Diagrams</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('profile')}>
          <Text style={[styles.navText, activeTab === 'profile' && styles.navTextActive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    backgroundColor: '#18181b',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  brandTitle: {
    color: '#f4f4f5',
    fontWeight: 'bold',
    fontSize: 14,
  },
  brandSubtitle: {
    color: '#a1a1aa',
    fontSize: 10,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  recordButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10b981',
    borderWidth: 1,
  },
  recordButtonInactive: {
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
    borderWidth: 1,
  },
  recordButtonText: {
    color: '#f4f4f5',
    fontSize: 12,
    fontWeight: '600',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotActive: {
    backgroundColor: '#10b981',
  },
  statusDotInactive: {
    backgroundColor: '#71717a',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  questionCard: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeTag: {
    color: '#a855f7',
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actionLink: {
    color: '#a1a1aa',
    fontSize: 11,
    textDecorationLine: 'underline',
  },
  questionHeading: {
    color: '#f4f4f5',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  quickAnswerCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    borderColor: 'rgba(124, 58, 237, 0.35)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  quickAnswerLabel: {
    color: '#c084fc',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  quickAnswerText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  cardTitle: {
    color: '#a1a1aa',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8,
  },
  bulletDot: {
    color: '#10b981',
    fontSize: 14,
    lineHeight: 18,
  },
  bulletText: {
    color: '#e4e4e7',
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  warningCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  warningLabel: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  warningText: {
    color: '#fef3c7',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 2,
  },
  followUpLabel: {
    color: '#a855f7',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  followUpText: {
    color: '#f4f4f5',
    fontSize: 12,
    fontStyle: 'italic',
  },
  bodyText: {
    color: '#d4d4d8',
    fontSize: 12,
    lineHeight: 18,
  },
  sectionHeader: {
    color: '#f4f4f5',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  transcriptCard: {
    backgroundColor: '#18181b',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 8,
  },
  transcriptMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  speakerText: {
    color: '#c084fc',
    fontSize: 11,
    fontWeight: '700',
  },
  timeText: {
    color: '#71717a',
    fontSize: 10,
  },
  transcriptBody: {
    color: '#e4e4e7',
    fontSize: 12,
    lineHeight: 16,
  },
  diagramContainer: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#27272a',
    alignItems: 'center',
    gap: 6,
  },
  diagramNode: {
    width: '100%',
    backgroundColor: '#27272a',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  diagramNodeHighlight: {
    borderColor: '#7c3aed',
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
  },
  diagramRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
  },
  diagramNodeHalf: {
    flex: 1,
    backgroundColor: '#27272a',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  nodeType: {
    color: '#a1a1aa',
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 2,
  },
  nodeLabel: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  diagramArrow: {
    color: '#71717a',
    fontSize: 10,
    fontWeight: '600',
  },
  profileName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  profileRole: {
    color: '#c084fc',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileExp: {
    color: '#a1a1aa',
    fontSize: 11,
    marginBottom: 4,
  },
  profileSkills: {
    color: '#d4d4d8',
    fontSize: 11,
  },
  projectTitle: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  outcomeText: {
    color: '#34d399',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#18181b',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navText: {
    color: '#71717a',
    fontSize: 11,
    fontWeight: '600',
  },
  navTextActive: {
    color: '#a855f7',
    fontWeight: '700',
  },
});
