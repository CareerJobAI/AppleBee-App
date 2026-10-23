import React from 'react';
import { VisualizationModel } from '../../../types/interview';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import { ComparisonView } from './ComparisonView';
import { CodeComplexityView } from './CodeComplexityView';
import { StarAnswerView } from './StarAnswerView';
import { FlowchartView } from './FlowchartView';
import { SecurityThreatView } from './SecurityThreatView';
import { Radio } from 'lucide-react';

interface VisualizationPanelProps {
  visualization: VisualizationModel | null;
  activeVoiceEntities?: string[];
  isLiveVoiceActive?: boolean;
  liveVoiceHighlightSummary?: string;
}

export const VisualizationPanel: React.FC<VisualizationPanelProps> = ({
  visualization,
  activeVoiceEntities = [],
  isLiveVoiceActive = false,
  liveVoiceHighlightSummary,
}) => {
  if (!visualization || !visualization.data) {
    return null;
  }

  const { type, title, data } = visualization;

  return (
    <div className="space-y-1.5">
      {/* Live Voice Synchronized Status Pill */}
      {(isLiveVoiceActive || activeVoiceEntities.length > 0) && (
        <div className="flex items-center justify-between px-2.5 py-1 rounded-md bg-purple-950/40 border border-purple-700/40 text-[10px] text-purple-200">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-purple-400 animate-pulse" />
            <span className="font-mono font-medium">
              {liveVoiceHighlightSummary || 'Live Voice Response Synchronized to Diagram'}
            </span>
          </div>
          {activeVoiceEntities.length > 0 && (
            <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 border border-purple-600/30">
              {activeVoiceEntities.length} active node{activeVoiceEntities.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {(() => {
        switch (type) {
          case 'architecture':
            return (
              <ArchitectureDiagram
                data={data}
                title={title}
                activeVoiceEntities={activeVoiceEntities}
                isLiveVoiceActive={isLiveVoiceActive}
              />
            );
          case 'comparison':
            return <ComparisonView data={data} title={title} />;
          case 'coding':
            return <CodeComplexityView data={data} title={title} />;
          case 'star':
            return (
              <StarAnswerView
                data={data}
                title={title}
                activeVoiceEntities={activeVoiceEntities}
              />
            );
          case 'flowchart':
          case 'decision_tree':
            return (
              <FlowchartView
                data={data}
                title={title}
                activeVoiceEntities={activeVoiceEntities}
              />
            );
          case 'security_threat':
            return <SecurityThreatView data={data} title={title} />;
          default:
            return (
              <div className="rounded-lg border border-purple-500/20 bg-zinc-950/80 p-3 text-xs text-zinc-300">
                <div className="font-semibold text-purple-300 mb-1">{title || 'Visual Model'}</div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  {visualization.description || JSON.stringify(data)}
                </p>
              </div>
            );
        }
      })()}
    </div>
  );
};
