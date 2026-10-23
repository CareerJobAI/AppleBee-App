import React from 'react';

interface ThreatItem {
  threat: string;
  attackVector: string;
  mitigation: string;
}

interface SecurityThreatData {
  threats: ThreatItem[];
}

export const SecurityThreatView: React.FC<{ data: SecurityThreatData; title?: string }> = ({
  data,
  title,
}) => {
  const threats = data?.threats || [];
  if (threats.length === 0) return null;

  return (
    <div className="rounded-lg border border-rose-500/20 bg-zinc-950/80 p-3 font-sans">
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="w-2 h-2 rounded-full bg-rose-400" />
        <span className="text-xs font-semibold text-rose-300 tracking-wide uppercase">
          {title || 'Threat Model & Mitigation Map'}
        </span>
      </div>

      <div className="space-y-2 text-xs">
        {threats.map((item, idx) => (
          <div key={idx} className="p-2 rounded bg-zinc-900/60 border border-zinc-800 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-rose-400 font-semibold text-[11px]">{item.threat}</span>
            </div>
            <div className="text-[11px] text-zinc-400">
              <strong className="text-zinc-300 font-normal">Vector: </strong>
              {item.attackVector}
            </div>
            <div className="text-[11px] text-emerald-300 bg-emerald-950/30 p-1 rounded border border-emerald-900/40">
              <strong className="text-emerald-400 font-normal">Mitigation: </strong>
              {item.mitigation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
