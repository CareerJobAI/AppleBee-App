import React, { useState } from 'react';

interface ArchitectureNode {
  id: string;
  label: string;
  role: string;
  type: 'ingress' | 'compute' | 'database' | 'cache' | 'queue';
}

interface ArchitectureEdge {
  from: string;
  to: string;
  label: string;
}

interface ArchitectureData {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
}

export const ArchitectureDiagram: React.FC<{ data: ArchitectureData; title?: string }> = ({
  data,
  title,
}) => {
  const [showTextFallback, setShowTextFallback] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const nodes = data?.nodes || [];
  const edges = data?.edges || [];

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'ingress':
        return { border: 'border-blue-500/50', bg: 'bg-blue-950/40', text: 'text-blue-300', dot: 'bg-blue-400' };
      case 'compute':
        return { border: 'border-purple-500/50', bg: 'bg-purple-950/40', text: 'text-purple-300', dot: 'bg-purple-400' };
      case 'cache':
        return { border: 'border-emerald-500/50', bg: 'bg-emerald-950/40', text: 'text-emerald-300', dot: 'bg-emerald-400' };
      case 'queue':
        return { border: 'border-amber-500/50', bg: 'bg-amber-950/40', text: 'text-amber-300', dot: 'bg-amber-400' };
      case 'database':
        return { border: 'border-cyan-500/50', bg: 'bg-cyan-950/40', text: 'text-cyan-300', dot: 'bg-cyan-400' };
      default:
        return { border: 'border-zinc-500/50', bg: 'bg-zinc-900/40', text: 'text-zinc-300', dot: 'bg-zinc-400' };
    }
  };

  return (
    <div className="rounded-lg border border-purple-500/20 bg-zinc-950/80 p-3 font-sans">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs font-semibold text-purple-300 tracking-wide uppercase">
            {title || 'System Topology Diagram'}
          </span>
        </div>
        <button
          onClick={() => setShowTextFallback(!showTextFallback)}
          className="text-[11px] text-zinc-400 hover:text-zinc-200 underline focus:outline-none"
          aria-label="Toggle diagram text alternative"
        >
          {showTextFallback ? 'View Diagram' : 'Text Summary'}
        </button>
      </div>

      {showTextFallback ? (
        <div className="text-xs space-y-2 text-zinc-300 p-2 bg-zinc-900/60 rounded border border-zinc-800">
          <p className="font-medium text-zinc-200">Architecture Components & Flows:</p>
          <ul className="list-disc pl-4 space-y-1">
            {nodes.map((n) => (
              <li key={n.id}>
                <strong className="text-zinc-100">{n.label}</strong> ({n.role}) — Category: {n.type}
              </li>
            ))}
          </ul>
          <p className="font-medium text-zinc-200 mt-2">Inter-Service Connections:</p>
          <ul className="list-disc pl-4 space-y-0.5 text-zinc-400">
            {edges.map((e, idx) => {
              const fromNode = nodes.find((n) => n.id === e.from)?.label || e.from;
              const toNode = nodes.find((n) => n.id === e.to)?.label || e.to;
              return (
                <li key={idx}>
                  {fromNode} → {toNode} <span className="text-zinc-500">[{e.label}]</span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Node Visual Cards Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {nodes.map((node) => {
              const colors = getNodeColor(node.type);
              const isSelected = activeNodeId === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setActiveNodeId(isSelected ? null : node.id)}
                  className={`relative p-2.5 rounded border transition-all cursor-pointer ${colors.bg} ${colors.border} ${
                    isSelected ? 'ring-1 ring-purple-400 shadow-md shadow-purple-950/50' : 'hover:border-zinc-600'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setActiveNodeId(isSelected ? null : node.id);
                    }
                  }}
                  aria-label={`${node.label}, ${node.role}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                      {node.type}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                  </div>
                  <div className={`text-xs font-semibold ${colors.text}`}>{node.label}</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{node.role}</div>
                </div>
              );
            })}
          </div>

          {/* Connection flow lines */}
          {edges.length > 0 && (
            <div className="pt-2 border-t border-zinc-800/80">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                Data & Network Pathways:
              </span>
              <div className="space-y-1">
                {edges.map((edge, idx) => {
                  const fromNode = nodes.find((n) => n.id === edge.from)?.label || edge.from;
                  const toNode = nodes.find((n) => n.id === edge.to)?.label || edge.to;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 text-[11px] text-zinc-300 bg-zinc-900/40 px-2 py-1 rounded border border-zinc-800/60"
                    >
                      <span className="font-medium text-purple-300">{fromNode}</span>
                      <span className="text-zinc-500 font-mono">──▶</span>
                      <span className="font-medium text-blue-300">{toNode}</span>
                      <span className="text-[10px] font-mono text-zinc-400 ml-auto bg-zinc-800/60 px-1.5 py-0.5 rounded">
                        {edge.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
