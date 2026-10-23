import React from 'react';
import { SessionStatus } from '../../types/interview';
import { Mic, MicOff, Sparkles, MessageSquare, ChevronUp, AlertCircle, Loader2 } from 'lucide-react';

interface WidgetLauncherProps {
  status: SessionStatus;
  detectedCount: number;
  audioLevel: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onStartListening: () => void;
}

export const WidgetLauncher: React.FC<WidgetLauncherProps> = ({
  status,
  detectedCount,
  audioLevel,
  isExpanded,
  onToggleExpand,
  onStartListening,
}) => {
  const isListening = status === 'listening';
  const isProcessing = status === 'processing';
  const isAnswerReady = status === 'answer_ready';
  const isError = status === 'error';

  // Compute status badge text and color
  const getStatusBadge = () => {
    switch (status) {
      case 'listening':
        return { text: 'Listening', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' };
      case 'processing':
        return { text: 'Analyzing...', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30', dot: 'bg-purple-400' };
      case 'answer_ready':
        return { text: 'Answer Ready', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30', dot: 'bg-blue-400' };
      case 'requesting_permission':
        return { text: 'Requesting Mic', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' };
      case 'paused':
        return { text: 'Paused', bg: 'bg-zinc-800 text-zinc-400 border-zinc-700', dot: 'bg-zinc-500' };
      case 'error':
        return { text: 'Attention', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30', dot: 'bg-rose-400' };
      default:
        return { text: 'Ready', bg: 'bg-zinc-800 text-zinc-400 border-zinc-700', dot: 'bg-zinc-500' };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="relative group">
      {/* Tooltip on hover & focus */}
      <div
        id="widget-launcher-tooltip"
        role="tooltip"
        className="absolute bottom-full mb-2 right-0 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-zinc-200 bg-zinc-900 border border-zinc-700 rounded shadow-lg whitespace-nowrap pointer-events-none transition-opacity duration-150 z-50"
      >
        <span>Applebee Live Interview Copilot</span>
        <kbd className="px-1 py-0.2 bg-zinc-800 border border-zinc-700 rounded text-[9px] font-mono text-zinc-400">
          ⌥ + Space
        </kbd>
      </div>

      <div
        className={`flex items-center gap-2 p-1.5 pl-3 rounded-full border shadow-2xl transition-all duration-200 select-none ${
          isListening
            ? 'bg-zinc-950/95 border-emerald-500/50 shadow-emerald-950/40 ring-1 ring-emerald-500/20'
            : isProcessing
            ? 'bg-zinc-950/95 border-purple-500/50 shadow-purple-950/40 ring-1 ring-purple-500/20'
            : isAnswerReady
            ? 'bg-zinc-950/95 border-blue-500/50 shadow-blue-950/40 ring-1 ring-blue-500/20'
            : 'bg-zinc-900/95 border-zinc-700 hover:border-zinc-500 text-zinc-200'
        }`}
      >
        {/* Applebee Logo Icon */}
        <button
          onClick={onToggleExpand}
          className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full"
          aria-expanded={isExpanded}
          aria-controls="applebee-interview-panel"
          aria-label="Expand Applebee Live Interview Widget"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-inner font-bold text-xs tracking-tighter">
            AB
          </div>
          <span className="text-xs font-semibold tracking-tight text-zinc-100 hidden sm:inline">
            Applebee
          </span>
        </button>

        {/* Status pill */}
        <button
          onClick={onToggleExpand}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border font-medium ${badge.bg}`}
          aria-label={`Status: ${badge.text}`}
        >
          {isProcessing ? (
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
          ) : (
            <span
              className={`w-1.5 h-1.5 rounded-full ${badge.dot} ${
                isListening ? 'animate-ping' : ''
              }`}
            />
          )}
          <span>{badge.text}</span>
        </button>

        {/* Audio capture active wave indicator (strictly only when microphone is capturing) */}
        {isListening && (
          <div
            className="flex items-center gap-0.5 px-1 h-4"
            title={`Mic active (Volume: ${audioLevel}%)`}
            aria-label="Microphone active indicator"
          >
            <span
              className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
              style={{ height: `${Math.max(4, (audioLevel / 100) * 16)}px` }}
            />
            <span
              className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
              style={{ height: `${Math.max(4, ((audioLevel * 1.3) % 100) / 100 * 16)}px` }}
            />
            <span
              className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
              style={{ height: `${Math.max(4, ((audioLevel * 0.7) % 100) / 100 * 16)}px` }}
            />
          </div>
        )}

        {/* Detected Question Count Badge */}
        {detectedCount > 0 && (
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-950/70 border border-purple-800/50 text-[10px] font-mono text-purple-300 font-semibold"
            title={`${detectedCount} questions detected`}
            aria-label={`${detectedCount} questions detected`}
          >
            <MessageSquare className="w-2.5 h-2.5" />
            <span>{detectedCount}</span>
          </button>
        )}

        {/* Expand / Action Button */}
        <button
          onClick={onToggleExpand}
          className="w-6 h-6 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          aria-label={isExpanded ? 'Collapse widget' : 'Expand widget'}
        >
          <ChevronUp
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>
    </div>
  );
};
