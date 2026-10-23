import React from 'react';

interface FlowStep {
  id?: string;
  title: string;
  action: string;
  outcome?: string;
}

interface FlowchartData {
  steps: FlowStep[];
}

export const FlowchartView: React.FC<{ data: FlowchartData; title?: string }> = ({
  data,
  title,
}) => {
  const steps = data?.steps || [];
  if (steps.length === 0) return null;

  return (
    <div className="rounded-lg border border-blue-500/20 bg-zinc-950/80 p-3 font-sans">
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="w-2 h-2 rounded-full bg-blue-400" />
        <span className="text-xs font-semibold text-blue-300 tracking-wide uppercase">
          {title || 'Triage & Resolution Workflow'}
        </span>
      </div>

      <div className="space-y-1.5">
        {steps.map((step, idx) => (
          <div key={idx} className="relative flex items-start gap-2 text-xs">
            {/* Step badge */}
            <div className="flex flex-col items-center">
              <span className="w-5 h-5 rounded-full bg-blue-900/60 border border-blue-700/50 text-blue-300 text-[10px] font-mono flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              {idx < steps.length - 1 && <span className="w-0.5 h-4 bg-zinc-800 my-0.5" />}
            </div>

            {/* Step content */}
            <div className="flex-1 bg-zinc-900/50 p-2 rounded border border-zinc-800">
              <div className="font-semibold text-zinc-100 text-[11px]">{step.title}</div>
              <div className="text-zinc-300 text-[11px] mt-0.5">{step.action}</div>
              {step.outcome && (
                <div className="text-[10px] font-mono text-emerald-400 mt-1">
                  Outcome: {step.outcome}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
