import React from 'react';
import { ArrowRight, CornerDownRight } from 'lucide-react';

interface FollowUpListProps {
  followUps: string[];
  onSelectFollowUp: (question: string) => void;
}

export const FollowUpList: React.FC<FollowUpListProps> = ({ followUps, onSelectFollowUp }) => {
  if (!followUps || followUps.length === 0) return null;

  return (
    <div className="pt-2 border-t border-zinc-800 text-xs">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-400 block mb-1.5">
        Likely Follow-up Inquiries:
      </span>
      <div className="space-y-1">
        {followUps.map((item, i) => (
          <button
            key={i}
            onClick={() => onSelectFollowUp(item)}
            className="w-full text-left p-1.5 px-2 rounded bg-zinc-900/40 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-purple-500/40 text-[11px] text-zinc-300 hover:text-purple-200 flex items-center justify-between group transition-all"
            aria-label={`Ask follow-up: ${item}`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <CornerDownRight className="w-3 h-3 text-purple-400 shrink-0" />
              <span className="truncate">{item}</span>
            </div>
            <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
          </button>
        ))}
      </div>
    </div>
  );
};
