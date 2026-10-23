import React, { useState } from 'react';

interface ComparisonOption {
  name: string;
  pros: string[];
  cons: string[];
}

interface ComparisonData {
  optionA: ComparisonOption;
  optionB: ComparisonOption;
}

export const ComparisonView: React.FC<{ data: ComparisonData; title?: string }> = ({
  data,
  title,
}) => {
  const [showTextFallback, setShowTextFallback] = useState(false);
  const { optionA, optionB } = data || {};

  if (!optionA || !optionB) {
    return null;
  }

  return (
    <div className="rounded-lg border border-amber-500/20 bg-zinc-950/80 p-3 font-sans">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-xs font-semibold text-amber-300 tracking-wide uppercase">
            {title || 'Tradeoff Comparison Matrix'}
          </span>
        </div>
        <button
          onClick={() => setShowTextFallback(!showTextFallback)}
          className="text-[11px] text-zinc-400 hover:text-zinc-200 underline focus:outline-none"
          aria-label="Toggle comparison text alternative"
        >
          {showTextFallback ? 'Side-by-side' : 'Plain Text'}
        </button>
      </div>

      {showTextFallback ? (
        <div className="text-xs space-y-2 text-zinc-300 p-2 bg-zinc-900/60 rounded border border-zinc-800">
          <p className="font-semibold text-zinc-100">{optionA.name}:</p>
          <p className="text-emerald-300">Pros: {optionA.pros.join('; ')}</p>
          <p className="text-rose-300">Cons: {optionA.cons.join('; ')}</p>

          <p className="font-semibold text-zinc-100 mt-2">{optionB.name}:</p>
          <p className="text-emerald-300">Pros: {optionB.pros.join('; ')}</p>
          <p className="text-rose-300">Cons: {optionB.cons.join('; ')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* Option A */}
          <div className="rounded border border-zinc-800 bg-zinc-900/60 p-2.5 flex flex-col justify-between">
            <div>
              <div className="font-semibold text-zinc-100 mb-1.5 flex items-center gap-1">
                <span className="text-blue-400 text-[10px] font-mono px-1 py-0.5 rounded bg-blue-950/60 border border-blue-800/40">
                  Option A
                </span>
                <span className="truncate">{optionA.name}</span>
              </div>
              <div className="space-y-1">
                {optionA.pros?.map((pro, i) => (
                  <div key={i} className="flex items-start gap-1 text-[11px] text-emerald-300">
                    <span className="text-emerald-400 font-bold shrink-0">+</span>
                    <span>{pro}</span>
                  </div>
                ))}
              </div>
            </div>
            {optionA.cons?.length > 0 && (
              <div className="mt-2 pt-2 border-t border-zinc-800 space-y-1">
                {optionA.cons?.map((con, i) => (
                  <div key={i} className="flex items-start gap-1 text-[11px] text-rose-300">
                    <span className="text-rose-400 font-bold shrink-0">-</span>
                    <span>{con}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Option B */}
          <div className="rounded border border-zinc-800 bg-zinc-900/60 p-2.5 flex flex-col justify-between">
            <div>
              <div className="font-semibold text-zinc-100 mb-1.5 flex items-center gap-1">
                <span className="text-purple-400 text-[10px] font-mono px-1 py-0.5 rounded bg-purple-950/60 border border-purple-800/40">
                  Option B
                </span>
                <span className="truncate">{optionB.name}</span>
              </div>
              <div className="space-y-1">
                {optionB.pros?.map((pro, i) => (
                  <div key={i} className="flex items-start gap-1 text-[11px] text-emerald-300">
                    <span className="text-emerald-400 font-bold shrink-0">+</span>
                    <span>{pro}</span>
                  </div>
                ))}
              </div>
            </div>
            {optionB.cons?.length > 0 && (
              <div className="mt-2 pt-2 border-t border-zinc-800 space-y-1">
                {optionB.cons?.map((con, i) => (
                  <div key={i} className="flex items-start gap-1 text-[11px] text-rose-300">
                    <span className="text-rose-400 font-bold shrink-0">-</span>
                    <span>{con}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
