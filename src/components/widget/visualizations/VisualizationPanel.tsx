import React from 'react';
import { VisualizationModel } from '../../../types/interview';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import { ComparisonView } from './ComparisonView';
import { CodeComplexityView } from './CodeComplexityView';
import { StarAnswerView } from './StarAnswerView';
import { FlowchartView } from './FlowchartView';
import { SecurityThreatView } from './SecurityThreatView';

export const VisualizationPanel: React.FC<{ visualization: VisualizationModel | null }> = ({
  visualization,
}) => {
  if (!visualization || !visualization.data) {
    return null;
  }

  const { type, title, data } = visualization;

  switch (type) {
    case 'architecture':
      return <ArchitectureDiagram data={data} title={title} />;
    case 'comparison':
      return <ComparisonView data={data} title={title} />;
    case 'coding':
      return <CodeComplexityView data={data} title={title} />;
    case 'star':
      return <StarAnswerView data={data} title={title} />;
    case 'flowchart':
    case 'decision_tree':
      return <FlowchartView data={data} title={title} />;
    case 'security_threat':
      return <SecurityThreatView data={data} title={title} />;
    default:
      // Structured generic card fallback
      return (
        <div className="rounded-lg border border-purple-500/20 bg-zinc-950/80 p-3 text-xs text-zinc-300">
          <div className="font-semibold text-purple-300 mb-1">{title || 'Visual Model'}</div>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            {visualization.description || JSON.stringify(data)}
          </p>
        </div>
      );
  }
};
