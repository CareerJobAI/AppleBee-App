import React from 'react';
import { SessionStatus, WidgetCorner } from '../../types/interview';
import {
  X,
  Minimize2,
  Maximize2,
  Moon,
  Sun,
  Move,
  Square,
  Radio,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface WidgetHeaderProps {
  status: SessionStatus;
  sessionDuration: number;
  theme: 'dark' | 'light';
  corner: WidgetCorner;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onToggleTheme: () => void;
  onChangeCorner: (corner: WidgetCorner) => void;
  onClose: () => void;
  onEndSession: () => void;
}

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({
  status,
  sessionDuration,
  theme,
  corner,
  isMinimized,
  onToggleMinimize,
  onToggleTheme,
  onChangeCorner,
  onClose,
  onEndSession,
}) => {
  // Format seconds to mm:ss or hh:mm:ss
  const formatDuration = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening':
        return 'Live Audio Active';
      case 'processing':
        return 'Synthesizing Answer';
      case 'answer_ready':
        return 'Intelligence Ready';
      case 'paused':
        return 'Session Paused';
      case 'error':
        return 'Service Notice';
      default:
        return 'Idle';
    }
  };

  return (
    <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-800 bg-zinc-950/90 select-none cursor-move">
      {/* Brand & Status */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold tracking-tight">
          AB
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-zinc-100 tracking-tight">Applebee</span>
            <span className="text-[10px] text-zinc-400 font-mono">v2.4</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                status === 'listening'
                  ? 'bg-emerald-400 animate-pulse'
                  : status === 'processing'
                  ? 'bg-purple-400 animate-ping'
                  : status === 'answer_ready'
                  ? 'bg-blue-400'
                  : 'bg-zinc-600'
              }`}
            />
          </div>
          <div className="text-[10px] text-zinc-400 flex items-center gap-1">
            <span>{getStatusText()}</span>
            {sessionDuration > 0 && (
              <>
                <span>•</span>
                <span className="font-mono text-zinc-300">{formatDuration(sessionDuration)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1">
        {/* Corner Docking Selector */}
        <select
          value={corner}
          onChange={(e) => onChangeCorner(e.target.value as WidgetCorner)}
          className="bg-zinc-900 border border-zinc-700/80 rounded px-1.5 py-0.5 text-[10px] font-mono text-zinc-300 focus:outline-none focus:ring-1 focus:ring-purple-400"
          aria-label="Dock widget corner"
          title="Reposition widget corner"
        >
          <option value="bottom-right">Bottom-Right</option>
          <option value="bottom-left">Bottom-Left</option>
          <option value="top-right">Top-Right</option>
          <option value="top-left">Top-Left</option>
        </select>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title="Toggle dark/light theme"
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Minimize / Expand */}
        <button
          onClick={onToggleMinimize}
          className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
          aria-label={isMinimized ? 'Expand panel' : 'Minimize panel'}
          title={isMinimized ? 'Expand panel' : 'Minimize panel'}
        >
          {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
        </button>

        {/* Close panel (preserves session) */}
        <button
          onClick={onClose}
          className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
          aria-label="Dismiss panel (session continues in background)"
          title="Dismiss panel (keeps session active)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
