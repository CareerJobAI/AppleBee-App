import React from 'react';

interface StarData {
  situation: string;
  task: string;
  action: string;
  result: string;
}

interface StarAnswerViewProps {
  data: StarData;
  title?: string;
  activeVoiceEntities?: string[];
}

export const StarAnswerView: React.FC<StarAnswerViewProps> = ({
  data,
  title,
  activeVoiceEntities = [],
}) => {
  if (!data) return null;

  const isSituationActive = activeVoiceEntities.includes('Situation');
  const isTaskActive = activeVoiceEntities.includes('Task');
  const isActionActive = activeVoiceEntities.includes('Action');
  const isResultActive = activeVoiceEntities.includes('Result');

  return (
    <div className="rounded-lg border border-emerald-500/20 bg-zinc-950/80 p-3 font-sans">
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-xs font-semibold text-emerald-300 tracking-wide uppercase">
          {title || 'STAR Behavioral Narrative Blueprint'}
        </span>
      </div>

      <div className="space-y-2 text-xs">
        {/* Situation */}
        <div className={`p-2 rounded border transition-all ${isSituationActive ? 'bg-blue-950/60 border-blue-400 ring-2 ring-blue-500/40' : 'bg-zinc-900/60 border-zinc-800'}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-950/80 text-blue-300 border border-blue-800/40 font-bold">
              SITUATION
            </span>
            <span className="text-zinc-400 text-[11px]">Context & Business Stakes</span>
            {isSituationActive && <span className="ml-auto text-[9px] font-mono text-blue-300 animate-pulse">Voice Synced</span>}
          </div>
          <p className="text-zinc-200 leading-relaxed text-[11px]">{data.situation}</p>
        </div>

        {/* Task */}
        <div className={`p-2 rounded border transition-all ${isTaskActive ? 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-500/40' : 'bg-zinc-900/60 border-zinc-800'}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/40 font-bold">
              TASK
            </span>
            <span className="text-zinc-400 text-[11px]">Your Personal Ownership & Constraints</span>
            {isTaskActive && <span className="ml-auto text-[9px] font-mono text-amber-300 animate-pulse">Voice Synced</span>}
          </div>
          <p className="text-zinc-200 leading-relaxed text-[11px]">{data.task}</p>
        </div>

        {/* Action */}
        <div className={`p-2 rounded border transition-all ${isActionActive ? 'bg-purple-950/60 border-purple-400 ring-2 ring-purple-500/40' : 'bg-zinc-900/60 border-zinc-800'}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-800/40 font-bold">
              ACTION
            </span>
            <span className="text-zinc-400 text-[11px]">Technical Leadership & Collaborative Execution</span>
            {isActionActive && <span className="ml-auto text-[9px] font-mono text-purple-300 animate-pulse">Voice Synced</span>}
          </div>
          <p className="text-zinc-200 leading-relaxed text-[11px]">{data.action}</p>
        </div>

        {/* Result */}
        <div className={`p-2 rounded border transition-all ${isResultActive ? 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-500/40' : 'bg-zinc-900/60 border-emerald-900/40 bg-emerald-950/20'}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 font-bold">
              RESULT
            </span>
            <span className="text-zinc-400 text-[11px]">Quantifiable Business & Architecture Impact</span>
            {isResultActive && <span className="ml-auto text-[9px] font-mono text-emerald-300 animate-pulse">Voice Synced</span>}
          </div>
          <p className="text-emerald-200/90 leading-relaxed text-[11px] font-medium">{data.result}</p>
        </div>
      </div>
    </div>
  );
};
