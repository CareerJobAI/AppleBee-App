import React from 'react';
import { SourceReference } from '../../types/interview';
import { ExternalLink, CheckCircle, ShieldAlert, BookOpen, Globe, Search } from 'lucide-react';

interface SourceListProps {
  sources: SourceReference[];
  verificationStatus: 'verified_doc' | 'consensus' | 'unverified';
  searchGrounded?: boolean;
  webSearchQueries?: string[];
}

export const SourceList: React.FC<SourceListProps> = ({
  sources,
  verificationStatus,
  searchGrounded,
  webSearchQueries,
}) => {
  if (!sources || sources.length === 0) return null;

  const getVerificationBadge = (status: string) => {
    if (searchGrounded) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-medium text-blue-400 bg-blue-950/70 border border-blue-800/50 px-2 py-0.5 rounded font-mono">
          <Globe className="w-2.5 h-2.5 text-blue-400" />
          Google Search Grounded
        </span>
      );
    }

    switch (status) {
      case 'verified_doc':
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded">
            <CheckCircle className="w-2.5 h-2.5" />
            Verified Documentation
          </span>
        );
      case 'consensus':
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium text-blue-400 bg-blue-950/60 border border-blue-800/40 px-1.5 py-0.5 rounded">
            <BookOpen className="w-2.5 h-2.5" />
            Industry Consensus
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.5 rounded">
            <ShieldAlert className="w-2.5 h-2.5" />
            Heuristic / Unverified
          </span>
        );
    }
  };

  return (
    <div className="pt-2 border-t border-zinc-800 text-xs">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Grounded References & Standards
        </span>
        {getVerificationBadge(verificationStatus)}
      </div>

      {/* Web Search Queries Performed if Grounded */}
      {webSearchQueries && webSearchQueries.length > 0 && (
        <div className="mb-2 p-1.5 rounded bg-blue-950/30 border border-blue-900/40 text-[10px] text-blue-300 flex items-center gap-1.5">
          <Search className="w-3 h-3 text-blue-400 shrink-0" />
          <span className="text-zinc-400">Searched:</span>
          <span className="font-mono truncate">{webSearchQueries.join(', ')}</span>
        </div>
      )}

      <div className="space-y-1.5">
        {sources.map((src, i) => (
          <a
            key={i}
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-2 rounded bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition-all text-[11px]"
          >
            <div className="flex items-center justify-between text-zinc-200 group-hover:text-purple-300 font-medium">
              <span className="truncate pr-2">{src.title}</span>
              <ExternalLink className="w-3 h-3 shrink-0 text-zinc-500 group-hover:text-purple-400" />
            </div>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{src.domain}</div>
            {src.excerpt && (
              <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                "{src.excerpt}"
              </p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
};
