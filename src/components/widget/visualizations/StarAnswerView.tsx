import React from 'react';

interface StarData {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export const StarAnswerView: React.FC<{ data: StarData; title?: string }> = ({ data, title }) => {
  if (!data) return null;

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
        <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-950/80 text-blue-300 border border-blue-800/40 font-bold">
              SITUATION
            </span>
            <span className="text-zinc-400 text-[11px]">Context & Business Stakes</span>
          </div>
          <p className="text-zinc-200 leading-relaxed text-[11px]">{data.situation}</p>
        </div>

        {/* Task */}
        <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/40 font-bold">
              TASK
            </span>
            <span className="text-zinc-400 text-[11px]">Your Personal Ownership & Constraints</span>
          </div>
          <p className="text-zinc-200 leading-relaxed text-[11px]">{data.task}</p>
        </div>

        {/* Action */}
        <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-800/40 font-bold">
              ACTION
            </span>
            <span className="text-zinc-400 text-[11px]">Technical Leadership & Collaborative Execution</span>
          </div>
          <p className="text-zinc-200 leading-relaxed text-[11px]">{data.action}</p>
        </div>

        {/* Result */}
        <div className="p-2 rounded bg-zinc-900/60 border border-emerald-900/40 bg-emerald-950/20">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 font-bold">
              RESULT
            </span>
            <span className="text-emerald-400 text-[11px]">Quantifiable Business & System Impact</span>
          </div>
          <p className="text-emerald-100 font-medium leading-relaxed text-[11px]">{data.result}</p>
        </div>
      </div>
    </div>
  );
};
