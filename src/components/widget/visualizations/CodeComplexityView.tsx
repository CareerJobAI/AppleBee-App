import React, { useState } from 'react';

interface CodeComplexityData {
  timeComplexity: string;
  spaceComplexity: string;
  keyDataStructure: string;
  edgeCases: string[];
  codeSnippet: string;
}

export const CodeComplexityView: React.FC<{ data: CodeComplexityData; title?: string }> = ({
  data,
  title,
}) => {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const copySnippet = () => {
    if (data.codeSnippet) {
      navigator.clipboard.writeText(data.codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-lg border border-cyan-500/20 bg-zinc-950/80 p-3 font-sans">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-xs font-semibold text-cyan-300 tracking-wide uppercase">
            {title || 'Algorithm Complexity & Strategy'}
          </span>
        </div>
        <button
          onClick={copySnippet}
          className="text-[11px] text-zinc-400 hover:text-cyan-300 font-mono transition-colors"
          aria-label="Copy algorithm code snippet"
        >
          {copied ? '✓ Copied' : 'Copy Code'}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 mb-2 text-center">
        <div className="bg-zinc-900/60 p-1.5 rounded border border-zinc-800">
          <div className="text-[10px] text-zinc-400 font-mono">TIME</div>
          <div className="text-xs font-semibold text-cyan-300 font-mono">{data.timeComplexity || 'O(N)'}</div>
        </div>
        <div className="bg-zinc-900/60 p-1.5 rounded border border-zinc-800">
          <div className="text-[10px] text-zinc-400 font-mono">SPACE</div>
          <div className="text-xs font-semibold text-purple-300 font-mono">{data.spaceComplexity || 'O(1)'}</div>
        </div>
        <div className="bg-zinc-900/60 p-1.5 rounded border border-zinc-800">
          <div className="text-[10px] text-zinc-400 font-mono">CORE DS</div>
          <div className="text-xs font-semibold text-emerald-300 truncate font-mono">
            {data.keyDataStructure || 'Array / Hash'}
          </div>
        </div>
      </div>

      {/* Edge Cases checklist */}
      {data.edgeCases?.length > 0 && (
        <div className="mb-2 p-2 bg-zinc-900/40 rounded border border-zinc-800/80 text-[11px] text-zinc-300">
          <span className="font-medium text-amber-300 block mb-1">Key Edge Cases to Articulate:</span>
          <div className="flex flex-wrap gap-1">
            {data.edgeCases.map((ec, i) => (
              <span key={i} className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 text-[10px]">
                • {ec}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Code snippet block */}
      {data.codeSnippet && (
        <div className="relative rounded bg-zinc-900/90 p-2 font-mono text-[11px] text-zinc-200 border border-zinc-800 overflow-x-auto max-h-40">
          <pre>{data.codeSnippet}</pre>
        </div>
      )}
    </div>
  );
};
