import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useInterviewSession } from '../../hooks/useInterviewSession';
import {
  Smartphone,
  QrCode,
  Download,
  Copy,
  Check,
  Radio,
  Sparkles,
  Layers,
  Mic,
  Maximize2,
  Minimize2,
  GripHorizontal,
  Volume2,
} from 'lucide-react';

interface ExpoGoMobileCompanionProps {
  session: ReturnType<typeof useInterviewSession>;
}

export const ExpoGoMobileCompanion: React.FC<ExpoGoMobileCompanionProps> = ({ session }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [mobileTab, setMobileTab] = useState<'copilot' | 'transcript' | 'diagram' | 'profile'>('copilot');
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Floating mobile widget state within the simulator
  const [isWidgetExpanded, setIsWidgetExpanded] = useState(true);
  const [widgetPos, setWidgetPos] = useState({ x: 14, y: 220 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const phoneFrameRef = useRef<HTMLDivElement>(null);

  const {
    status,
    currentAnswer,
    transcript,
    candidateProfile,
    startSession,
    stopSession,
    simulateInterviewQuestion,
    activeVoiceEntities,
    isModelSpeaking,
    liveVoiceHighlightSummary,
    simulateVoiceResponseAndVisualize,
  } = session;

  const expoStartCommand = 'npx expo start';

  // Generate QR code for Expo Go connection URL
  useEffect(() => {
    const expUrl = `exp://${window.location.host}`;
    QRCode.toDataURL(expUrl, {
      margin: 1,
      color: {
        dark: '#7c3aed',
        light: '#09090b',
      },
      width: 180,
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.warn('QR code generation error:', err));
  }, []);

  const copyCommand = () => {
    navigator.clipboard.writeText(expoStartCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const downloadExpoProjectManifest = () => {
    const readmeContent = `# Applebee Live Interview Intelligence — Expo Go Mobile App

## How to Run in Expo Go:

1. Install dependencies:
\`\`\`bash
cd expo
npm install
\`\`\`

2. Start the Expo development server:
\`\`\`bash
npx expo start
\`\`\`

3. Open on your mobile device:
- **iOS**: Scan the terminal QR code with your Camera app, which will open in **Expo Go**.
- **Android**: Scan the terminal QR code with the **Expo Go** app directly.

## Features Included in Expo Go:
- Persistent draggable floating widget hovering over all tabs without navigating away
- Live microphone audio capture with \`expo-av\`
- Real-time question detection and 5-second quick answers
- Live voice-to-visual response mapping with synchronized topology nodes
- Gemini 3.8 Live Voice bidirectional conversations
`;

    const blob = new Blob([readmeContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'README-EXPO-GO.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Dragging support for mobile floating widget inside phone frame
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    if (!phoneFrameRef.current) return;

    const frameRect = phoneFrameRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - frameRect.left - widgetPos.x,
      y: e.clientY - frameRect.top - widgetPos.y,
    });
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !phoneFrameRef.current) return;
    const frameRect = phoneFrameRef.current.getBoundingClientRect();

    const widgetW = isWidgetExpanded ? 330 : 64;
    const widgetH = isWidgetExpanded ? 380 : 64;

    const rawX = e.clientX - frameRect.left - dragOffset.x;
    const rawY = e.clientY - frameRect.top - dragOffset.y;

    const boundedX = Math.max(8, Math.min(frameRect.width - widgetW - 8, rawX));
    const boundedY = Math.max(45, Math.min(frameRect.height - widgetH - 55, rawY));

    setWidgetPos({ x: boundedX, y: boundedY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Simplified mobile topology nodes for floating widget
  const mobileNodes = [
    { id: '1', label: 'Client Ingress', role: 'HTTPS / TLS 1.3' },
    { id: '2', label: 'Azure API Mgmt', role: 'Rate Limiter & Gateway' },
    { id: '3', label: 'ASP.NET Core API', role: 'Stateless Autoscaled Cluster' },
    { id: '4', label: 'Azure Redis Cache', role: 'In-Memory Read Store (<2ms)' },
    { id: '5', label: 'Azure SQL / Cosmos', role: 'Managed Cloud Persistence' },
  ];

  return (
    <div className="space-y-4 font-sans text-xs max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Expo Go Mobile Companion with Persistent Floating Widget</h2>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-200 border border-purple-700/50">
              React Native SDK 52
            </span>
          </div>
          <p className="text-zinc-400 text-[11px] mt-0.5">
            The mobile app features a <strong>persistent floating widget</strong> that can be dragged across screens, transcribes spoken voice responses in real time, and synchronizes live visual architecture cards without leaving the page.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyCommand}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-200 font-medium text-xs transition-colors"
          >
            {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="font-mono">{copiedCmd ? 'Copied' : 'npx expo start'}</span>
          </button>

          <button
            onClick={downloadExpoProjectManifest}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Instructions</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Device Simulator on Left, Expo Go Details & QR Code on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================== */}
        {/* 1. Phone Frame Simulator (Left / 7 cols) */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 flex justify-center">
          {/* Authentic iPhone 16 Bezel Mockup */}
          <div
            ref={phoneFrameRef}
            className="w-[360px] sm:w-[380px] h-[720px] bg-zinc-950 rounded-[48px] border-[10px] border-zinc-800 shadow-2xl overflow-hidden flex flex-col relative ring-1 ring-zinc-700/50 select-none"
          >
            {/* Dynamic Island / Speaker Notch */}
            <div className="w-full h-8 bg-zinc-950 flex items-center justify-between px-6 pt-2 z-20 shrink-0 select-none">
              <span className="text-[11px] font-semibold text-zinc-300 font-mono">9:41</span>
              {/* Dynamic Island Pill */}
              <div className="w-24 h-4 bg-zinc-900 rounded-full flex items-center justify-center gap-1.5 border border-zinc-800/80">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span className="text-[8px] font-mono text-zinc-400">Applebee</span>
              </div>
              <div className="flex items-center gap-1 text-zinc-300">
                <span className="text-[10px] font-mono">5G</span>
                <span className="w-4 h-2 rounded-sm border border-zinc-400 flex items-center p-0.5">
                  <span className="w-2.5 h-full bg-emerald-400 rounded-xs" />
                </span>
              </div>
            </div>

            {/* Expo Go Header Bar inside App */}
            <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-purple-600 flex items-center justify-center font-bold text-white text-[10px]">
                  AB
                </div>
                <div>
                  <div className="font-semibold text-xs text-zinc-100">Applebee Mobile</div>
                  <div className="text-[9px] text-zinc-500 font-mono">Expo Go • SDK 52</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsWidgetExpanded(!isWidgetExpanded)}
                  className="px-2 py-0.5 rounded bg-purple-950 border border-purple-700/50 text-[10px] font-mono text-purple-300"
                  title="Toggle mobile floating widget"
                >
                  {isWidgetExpanded ? 'Collapse Widget' : 'Show Widget'}
                </button>

                <button
                  onClick={status === 'listening' ? stopSession : startSession}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    status === 'listening'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${status === 'listening' ? 'bg-emerald-400 animate-ping' : 'bg-zinc-500'}`} />
                  <span>{status === 'listening' ? 'Listening' : 'Listen'}</span>
                </button>
              </div>
            </div>

            {/* Simulated Phone Scrollable Viewport (Host Application Screens) */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-zinc-950 text-xs relative">
              {mobileTab === 'copilot' && (
                <>
                  {currentAnswer ? (
                    <div className="space-y-3 pb-24">
                      {/* Question Card */}
                      <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40 font-bold">
                            {currentAnswer.questionType}
                          </span>
                          <span className="text-[9px] text-zinc-500 font-mono">Live Detected</span>
                        </div>
                        <h3 className="font-semibold text-zinc-100 text-xs leading-snug">
                          "{currentAnswer.question}"
                        </h3>
                      </div>

                      {/* 5-Second Quick Answer */}
                      <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1">
                        <div className="flex items-center gap-1 text-purple-400 text-[10px] font-mono font-semibold">
                          <Sparkles className="w-3 h-3" />
                          <span>5-SECOND DIRECT ANSWER</span>
                        </div>
                        <p className="text-xs text-zinc-100 font-medium leading-relaxed">
                          {currentAnswer.quickAnswer}
                        </p>
                      </div>

                      {/* Talking Points */}
                      <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                        <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold block">
                          Talking Points
                        </span>
                        {currentAnswer.talkingPoints?.map((pt, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-300">
                            <span className="text-emerald-400 font-bold shrink-0">•</span>
                            <span className="leading-snug">{pt}</span>
                          </div>
                        ))}
                      </div>

                      {/* Trade-offs */}
                      {currentAnswer.tradeoffs?.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-900/30 text-[11px] text-amber-200/90 space-y-1">
                          <span className="font-semibold text-amber-300 text-[10px] block font-mono">
                            Engineering Trade-offs
                          </span>
                          {currentAnswer.tradeoffs.map((item, i) => (
                            <p key={i} className="text-amber-100/80 leading-snug">• {item}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-16 text-center text-zinc-500 space-y-2">
                      <Sparkles className="w-8 h-8 mx-auto text-purple-400" />
                      <p className="font-semibold text-zinc-300">Awaiting Interviewer Audio</p>
                      <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                        Tap "Listen" above or trigger a live simulation question below.
                      </p>
                    </div>
                  )}
                </>
              )}

              {mobileTab === 'transcript' && (
                <div className="space-y-2 pb-24">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold block">
                    Spoken Transcript Feed ({transcript.length} turns)
                  </span>
                  {transcript.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500 text-[11px]">
                      No audio transcript segments captured yet.
                    </div>
                  ) : (
                    transcript.map((seg) => (
                      <div key={seg.id} className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-zinc-500">
                          <span className="font-semibold text-purple-400">{seg.speaker === 'candidate' ? 'Candidate' : 'Interviewer'}</span>
                          <span className="font-mono">{new Date(seg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-zinc-200 text-xs leading-relaxed">{seg.text}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {mobileTab === 'diagram' && (
                <div className="space-y-2 pb-24">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold block">
                    Scalable Architecture Flow
                  </span>
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      <div className="text-[9px] font-mono text-zinc-500">INGRESS TIER</div>
                      <div className="font-semibold text-zinc-200 text-xs">Client (Web & Mobile Apps)</div>
                    </div>
                    <div className="text-center text-zinc-500 font-mono text-[10px]">▼ HTTPS / TLS 1.3</div>
                    <div className="p-2 rounded bg-zinc-950 border border-blue-900/40">
                      <div className="text-[9px] font-mono text-blue-400">MANAGED GATEWAY</div>
                      <div className="font-semibold text-blue-200 text-xs">Azure API Management</div>
                    </div>
                    <div className="text-center text-zinc-500 font-mono text-[10px]">▼ Mutual TLS</div>
                    <div className="p-2 rounded bg-purple-950/40 border border-purple-800/50">
                      <div className="text-[9px] font-mono text-purple-400">COMPUTE TIER</div>
                      <div className="font-semibold text-purple-200 text-xs">ASP.NET Core API on AKS</div>
                    </div>
                    <div className="text-center text-zinc-500 font-mono text-[10px]">▼ Cache / DB</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded bg-zinc-950 border border-emerald-900/40">
                        <div className="text-[9px] font-mono text-emerald-400">CACHE</div>
                        <div className="font-semibold text-zinc-200 text-[11px]">Azure Redis</div>
                      </div>
                      <div className="p-2 rounded bg-zinc-950 border border-cyan-900/40">
                        <div className="text-[9px] font-mono text-cyan-400">DATABASE</div>
                        <div className="font-semibold text-zinc-200 text-[11px]">Cosmos / SQL</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {mobileTab === 'profile' && (
                <div className="space-y-2 pb-24">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold block">
                    Candidate Profile
                  </span>
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                    <div className="font-bold text-zinc-100 text-sm">{candidateProfile.name}</div>
                    <div className="text-purple-400 text-xs font-medium">{candidateProfile.targetRole}</div>
                    <div className="text-zinc-400 text-[11px]">{candidateProfile.yearsOfExperience} Years Experience</div>
                    <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-300">
                      Primary: {candidateProfile.primarySkills.join(', ')}
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* PERSISTENT FLOATING WIDGET (HOVERS OVER THE MOBILE SCREEN)     */}
              {/* ============================================================== */}
              <div
                style={{
                  position: 'absolute',
                  left: `${widgetPos.x}px`,
                  top: `${widgetPos.y}px`,
                  zIndex: 40,
                }}
                className="select-none"
              >
                {!isWidgetExpanded ? (
                  // Collapsed floating launcher pill
                  <div
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onClick={() => setIsWidgetExpanded(true)}
                    className="w-14 h-14 rounded-full bg-zinc-900/95 border-2 border-purple-500 shadow-2xl flex flex-col items-center justify-center cursor-move hover:scale-105 transition-transform"
                    title="Drag widget or tap to expand"
                  >
                    <div className="w-6 h-6 rounded-md bg-purple-600 flex items-center justify-center font-bold text-white text-[10px]">
                      AB
                    </div>
                    <span className="text-[8px] font-mono text-purple-200 font-semibold mt-0.5">
                      {isModelSpeaking ? 'Voice' : 'Copilot'}
                    </span>
                    {isModelSpeaking && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    )}
                  </div>
                ) : (
                  // Expanded floating card
                  <div
                    className="w-[330px] max-h-[380px] bg-zinc-900/95 backdrop-blur-md rounded-2xl border-2 border-purple-500/80 shadow-2xl overflow-hidden flex flex-col"
                  >
                    {/* Draggable Drag Handle & Header */}
                    <div
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      className="px-3 py-2 bg-zinc-950 border-b border-zinc-800 cursor-move flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5">
                        <GripHorizontal className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="font-bold text-xs text-zinc-100">Live Floating Copilot</span>
                        {isModelSpeaking && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono animate-pulse">
                            Voice Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setIsWidgetExpanded(false)}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                          title="Minimize to corner"
                        >
                          <Minimize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Floating Content Body */}
                    <div className="p-3 space-y-2.5 overflow-y-auto max-h-[320px] text-xs">
                      {/* Live Voice Response Transcription Stream */}
                      <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[10px] font-mono text-purple-400 font-semibold">
                            <Volume2 className="w-3 h-3" />
                            <span>VOICE TRANSCRIPTION</span>
                          </div>
                          <button
                            onClick={() => simulateVoiceResponseAndVisualize()}
                            className="text-[9px] font-mono text-emerald-400 hover:underline font-bold"
                          >
                            ⚡ Test Voice Sync
                          </button>
                        </div>
                        <p className="text-[11px] text-zinc-200 leading-relaxed italic">
                          {liveVoiceHighlightSummary
                            ? `"${liveVoiceHighlightSummary}"`
                            : '"Client requests pass through Azure API Management to ASP.NET Core API with Redis cache."'}
                        </p>
                      </div>

                      {/* Live Voice-to-Visual Synchronized Diagram */}
                      <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono uppercase text-zinc-400 font-semibold">
                            Synchronized System Topology
                          </span>
                          {activeVoiceEntities.length > 0 && (
                            <span className="text-[8px] font-mono text-emerald-300 font-bold">
                              {activeVoiceEntities.length} Spoken Active
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          {mobileNodes.map((node) => {
                            const isSpoken = activeVoiceEntities.some(
                              (entity) =>
                                node.label.toLowerCase().includes(entity.toLowerCase()) ||
                                entity.toLowerCase().includes(node.label.toLowerCase())
                            );

                            return (
                              <div
                                key={node.id}
                                className={`px-2 py-1 rounded border text-[10px] flex items-center justify-between transition-all ${
                                  isSpoken
                                    ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400/80'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                                }`}
                              >
                                <span className="font-semibold">{node.label}</span>
                                <span className={`text-[9px] font-mono ${isSpoken ? 'text-emerald-300 font-bold' : 'text-zinc-500'}`}>
                                  {isSpoken ? 'SPOKEN' : node.role}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Quick Answer */}
                      <div className="p-2 rounded bg-purple-950/30 border border-purple-800/40">
                        <span className="text-[9px] font-mono uppercase text-purple-300 font-bold block mb-0.5">
                          5-Second Answer
                        </span>
                        <p className="text-[11px] text-zinc-200 leading-snug">
                          {currentAnswer?.quickAnswer || 'Stateless ASP.NET Core API with Redis cache and Azure SQL persistence.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Bottom Tab Navigation */}
            <div className="h-12 bg-zinc-900 border-t border-zinc-800 flex items-center justify-around px-2 shrink-0 z-10 select-none">
              <button
                onClick={() => setMobileTab('copilot')}
                className={`flex flex-col items-center gap-0.5 ${mobileTab === 'copilot' ? 'text-purple-400 font-bold' : 'text-zinc-500'}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[9px]">Copilot</span>
              </button>

              <button
                onClick={() => setMobileTab('transcript')}
                className={`flex flex-col items-center gap-0.5 ${mobileTab === 'transcript' ? 'text-purple-400 font-bold' : 'text-zinc-500'}`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span className="text-[9px]">Audio</span>
              </button>

              <button
                onClick={() => setMobileTab('diagram')}
                className={`flex flex-col items-center gap-0.5 ${mobileTab === 'diagram' ? 'text-purple-400 font-bold' : 'text-zinc-500'}`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="text-[9px]">Diagram</span>
              </button>

              <button
                onClick={() => setMobileTab('profile')}
                className={`flex flex-col items-center gap-0.5 ${mobileTab === 'profile' ? 'text-purple-400 font-bold' : 'text-zinc-500'}`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[9px]">Profile</span>
              </button>
            </div>

            {/* Home Indicator Bar */}
            <div className="w-full h-4 bg-zinc-950 flex items-center justify-center shrink-0">
              <div className="w-32 h-1 bg-zinc-700 rounded-full" />
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. Expo Go Setup, QR Code & Mobile Instructions (Right / 5 cols) */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 space-y-4">
          {/* Live Voice-to-Visual Synchronizer Trigger */}
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-700/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-100 flex items-center gap-1.5 text-xs">
                <Volume2 className="w-4 h-4 text-purple-400" />
                Voice-to-Visual Live Demonstration
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-500/30">
                P0 Feature
              </span>
            </div>

            <p className="text-zinc-300 text-[11px] leading-relaxed">
              Test how live spoken voice responses transcribe speech in real time and automatically synchronize directly into dynamic architecture diagrams and visual models.
            </p>

            <button
              onClick={() => simulateVoiceResponseAndVisualize()}
              className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40"
            >
              <Mic className="w-3.5 h-3.5 animate-pulse" />
              <span>Transcribe Voice Response to Visual Now</span>
            </button>
          </div>

          {/* QR Code Card */}
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-semibold text-zinc-100 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-purple-400" />
                Scan to Open in Expo Go
              </span>
              <span className="text-[10px] font-mono text-zinc-400">iOS & Android</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* QR Code Image */}
              <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="Expo Go QR Code"
                    className="w-36 h-36 rounded-lg shadow"
                  />
                ) : (
                  <div className="w-36 h-36 flex items-center justify-center text-zinc-500 text-[10px]">
                    Generating QR...
                  </div>
                )}
              </div>

              <div className="space-y-2 text-zinc-300">
                <div className="text-[11px] leading-relaxed">
                  <strong className="text-zinc-100 block mb-0.5">Step 1: Get the App</strong>
                  Download <strong>Expo Go</strong> free from the App Store (iOS) or Google Play Store (Android).
                </div>
                <div className="text-[11px] leading-relaxed">
                  <strong className="text-zinc-100 block mb-0.5">Step 2: Scan QR</strong>
                  Scan this code using your Camera app (iPhone) or the Expo Go scanner (Android).
                </div>
              </div>
            </div>
          </div>

          {/* Quick Simulation Trigger on Mobile */}
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
            <span className="font-semibold text-zinc-200 block text-xs">
              Inject Test Prompt into Mobile Simulator
            </span>
            <div className="space-y-1.5">
              <button
                onClick={() =>
                  simulateInterviewQuestion('How would you design a scalable .NET API on Azure?')
                }
                className="w-full text-left p-2 rounded bg-zinc-950/70 hover:bg-zinc-800 border border-zinc-800/80 text-[11px] text-zinc-300 hover:text-purple-300 transition-colors"
              >
                .NET API on Azure (Stateless API, Redis, Cosmos DB)
              </button>

              <button
                onClick={() =>
                  simulateInterviewQuestion(
                    'How do you prevent cache stampedes and handle stale reads in a write-heavy microservices architecture?'
                  )
                }
                className="w-full text-left p-2 rounded bg-zinc-950/70 hover:bg-zinc-800 border border-zinc-800/80 text-[11px] text-zinc-300 hover:text-purple-300 transition-colors"
              >
                Cache Stampedes (Mutex Locking, Probabilistic Expiry)
              </button>
            </div>
          </div>

          {/* Technical Expo Manifest Details */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-[11px] text-zinc-400">
            <span className="font-semibold text-zinc-200 block text-xs">
              Expo Project Architecture Files
            </span>
            <ul className="space-y-1 font-mono text-[10px] text-zinc-400">
              <li>• <span className="text-purple-300">/app.json</span>: Official Expo SDK 52 manifest with audio permissions</li>
              <li>• <span className="text-purple-300">/expo/package.json</span>: React Native 0.76 & expo-av dependencies</li>
              <li>• <span className="text-purple-300">/expo/App.tsx</span>: Full native mobile app with draggable floating widget</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
