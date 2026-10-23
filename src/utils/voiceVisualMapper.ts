import { VisualizationModel, QuestionType } from '../types/interview';

// Comprehensive technical keywords mapped to system topology categories
const TOPOLOGY_KEYWORDS: Record<string, { label: string; role: string; type: 'ingress' | 'compute' | 'cache' | 'queue' | 'database' }> = {
  // Ingress & Gateways
  'api management': { label: 'Azure API Management', role: 'Rate Limiting, JWT Auth & Policy Gateway', type: 'ingress' },
  'apim': { label: 'Azure API Management', role: 'Rate Limiting & Gateway Ingress', type: 'ingress' },
  'gateway': { label: 'Cloud API Gateway', role: 'Ingress & TLS Termination', type: 'ingress' },
  'cloudflare': { label: 'Cloudflare Edge / WAF', role: 'DDoS Protection & CDN Ingress', type: 'ingress' },
  'reverse proxy': { label: 'Reverse Proxy / Envoy', role: 'Service Mesh Ingress Routing', type: 'ingress' },
  'ingress': { label: 'K8s Ingress Controller', role: 'Cluster Traffic Router', type: 'ingress' },

  // Compute Services
  'asp.net core': { label: 'ASP.NET Core API', role: 'Stateless Autoscaling Microservice Cluster', type: 'compute' },
  'asp.net': { label: 'ASP.NET Core API', role: 'Stateless Autoscaling Microservice Cluster', type: 'compute' },
  'c#': { label: 'C# / .NET Runtime', role: 'High-Performance Compiled Compute Layer', type: 'compute' },
  '.net': { label: 'ASP.NET Core API', role: 'Stateless Autoscaling Microservice Cluster', type: 'compute' },
  'microservices': { label: 'Containerized Microservices', role: 'Decoupled Domain Service Pods', type: 'compute' },
  'aks': { label: 'Azure Kubernetes Service (AKS)', role: 'Orchestrated Container Nodes', type: 'compute' },
  'azure app service': { label: 'Azure App Service', role: 'Managed Multi-Instance Container Compute', type: 'compute' },
  'azure functions': { label: 'Azure Functions', role: 'Event-Driven Serverless Compute Workers', type: 'compute' },
  'worker': { label: 'Background Worker Service', role: 'Asynchronous Queue Consumer Worker', type: 'compute' },

  // Caching
  'redis': { label: 'Azure Cache for Redis', role: 'In-Memory Read Model & Session Store (<2ms)', type: 'cache' },
  'cache': { label: 'Distributed Cache Tier', role: 'Read-Through Cache with TTL & Jitter', type: 'cache' },
  'in-memory': { label: 'In-Memory Cache', role: 'High-Speed L1/L2 Cache Layer', type: 'cache' },

  // Queues & Event Streaming
  'service bus': { label: 'Azure Service Bus', role: 'Enterprise Message Broker with FIFO & Dead-Lettering', type: 'queue' },
  'kafka': { label: 'Apache Kafka / Event Hubs', role: 'High-Throughput Partitioned Event Stream Log', type: 'queue' },
  'event hubs': { label: 'Azure Event Hubs', role: 'Streaming Ingestion Engine (Millions EPS)', type: 'queue' },
  'queue': { label: 'Distributed Queue Buffer', role: 'Asynchronous Buffering & Backpressure Leveling', type: 'queue' },
  'rabbitmq': { label: 'RabbitMQ Broker', role: 'AMQP Task Distribution Broker', type: 'queue' },

  // Databases & Storage
  'azure sql': { label: 'Azure SQL Database', role: 'Managed Relational Persistence (Hyperscale)', type: 'database' },
  'cosmos db': { label: 'Azure Cosmos DB', role: 'Globally Distributed Multi-Model NoSQL Store', type: 'database' },
  'postgresql': { label: 'Azure PostgreSQL / Postgres', role: 'ACID Relational Storage with Read Replicas', type: 'database' },
  'sql': { label: 'Relational Database', role: 'Primary OLTP Storage Engine', type: 'database' },
  'blob storage': { label: 'Azure Blob Storage', role: 'Unstructured Object & Asset Storage', type: 'database' },

  // Observability & Security
  'application insights': { label: 'Azure Application Insights', role: 'Distributed Tracing & APM Telemetry', type: 'compute' },
  'azure monitor': { label: 'Azure Monitor', role: 'Centralized Metrics, Alerts & Log Analytics', type: 'compute' },
  'key vault': { label: 'Azure Key Vault', role: 'Hardware-Backed Secrets & Certificate Vault', type: 'ingress' },
  'polly': { label: 'Polly Resilience Engine', role: 'Circuit Breaker & Exponential Backoff Retry', type: 'compute' },
};

export interface VoiceVisualMappingResult {
  visualization: VisualizationModel;
  activeEntities: string[];
  activeStepIdx?: number;
  highlightSummary: string;
}

/**
 * Maps transcribed spoken voice stream or final turn directly into dynamic visual explanation data.
 */
export function mapSpokenTranscriptToVisual(
  spokenText: string,
  currentVisualization: VisualizationModel | null,
  questionType: QuestionType = 'architecture'
): VoiceVisualMappingResult {
  const lower = spokenText.toLowerCase();
  const matchedKeys: string[] = [];
  const activeEntities: string[] = [];

  // 1. Identify all architectural entities mentioned in speech
  for (const [key, item] of Object.entries(TOPOLOGY_KEYWORDS)) {
    if (lower.includes(key)) {
      matchedKeys.push(key);
      if (!activeEntities.includes(item.label)) {
        activeEntities.push(item.label);
      }
    }
  }

  // 2. If current visualization is an architecture diagram, update/augment it with voice findings
  if (currentVisualization?.type === 'architecture' && currentVisualization.data?.nodes) {
    const existingNodes: any[] = [...currentVisualization.data.nodes];
    const existingEdges: any[] = [...(currentVisualization.data.edges || [])];

    // Check if spoken text mentions new nodes not currently in diagram
    matchedKeys.forEach((key) => {
      const template = TOPOLOGY_KEYWORDS[key];
      const alreadyExists = existingNodes.some(
        (n) => n.label.toLowerCase().includes(key) || template.label.toLowerCase().includes(n.label.toLowerCase())
      );

      if (!alreadyExists) {
        const newId = String(existingNodes.length + 1);
        existingNodes.push({
          id: newId,
          label: template.label,
          role: template.role,
          type: template.type,
          isVoiceAdded: true,
        });

        // Add logical edge from compute or gateway to this new node
        const computeNode = existingNodes.find((n) => n.type === 'compute');
        if (computeNode && computeNode.id !== newId) {
          existingEdges.push({
            from: computeNode.id,
            to: newId,
            label: template.type === 'queue' ? 'Publish Async' : template.type === 'cache' ? 'Read/Write' : 'Integration',
          });
        }
      }
    });

    const highlightSummary = activeEntities.length > 0
      ? `Voice Synchronized: Explaining ${activeEntities.slice(0, 3).join(', ')}`
      : 'Live Voice Connected';

    return {
      visualization: {
        ...currentVisualization,
        data: {
          nodes: existingNodes,
          edges: existingEdges,
        },
      },
      activeEntities,
      highlightSummary,
    };
  }

  // 3. If behavioural/STAR is active or mentioned
  if (
    questionType === 'behavioural' ||
    lower.includes('situation') ||
    lower.includes('task') ||
    lower.includes('action') ||
    lower.includes('result')
  ) {
    let activeStarSection = 'Situation';
    if (lower.includes('result') || lower.includes('outcome') || lower.includes('metric') || lower.includes('sla')) {
      activeStarSection = 'Result';
    } else if (lower.includes('action') || lower.includes('implemented') || lower.includes('engineered') || lower.includes('built')) {
      activeStarSection = 'Action';
    } else if (lower.includes('task') || lower.includes('responsibility') || lower.includes('objective')) {
      activeStarSection = 'Task';
    }

    return {
      visualization: {
        type: 'star',
        title: 'STAR Narrative Framework (Voice Synced)',
        description: 'Real-time spoken narrative breakdown tracking Situation, Task, Action, and Result.',
        data: currentVisualization?.data || {
          situation: 'High-throughput system experiencing latency spikes under 10x traffic bursts.',
          task: 'Lead redesign of the stateless API layer and implement caching to meet <5ms p99 SLA.',
          action: 'Introduced Redis caching, Polly resilience policies, and connection pooling across clusters.',
          result: 'Achieved 99.99% uptime, reduced latency by 64%, and sustained 25,000 QPS with zero data loss.',
        },
      },
      activeEntities: [activeStarSection],
      highlightSummary: `Voice Synced: Presenting STAR [${activeStarSection}]`,
    };
  }

  // 4. Default: Construct rich architecture visualization synthesized from spoken response
  const defaultNodes = [
    { id: '1', label: 'Client Ingress', role: 'Web / Mobile / Partner Ingress', type: 'ingress' as const },
    { id: '2', label: 'Azure API Management', role: 'Rate Limiting & OAuth2 Gateway', type: 'ingress' as const },
    { id: '3', label: 'ASP.NET Core API', role: 'Stateless Autoscaling Microservice Cluster', type: 'compute' as const },
    { id: '4', label: 'Azure Cache for Redis', role: 'In-Memory Read Model (<2ms)', type: 'cache' as const },
    { id: '5', label: 'Azure SQL / Cosmos DB', role: 'Managed Multi-Region Persistence', type: 'database' as const },
    { id: '6', label: 'Azure Application Insights', role: 'Distributed Tracing & Observability', type: 'compute' as const },
  ];

  const defaultEdges = [
    { from: '1', to: '2', label: 'HTTPS / TLS 1.3' },
    { from: '2', to: '3', label: 'Mutual TLS / JWT' },
    { from: '3', to: '4', label: 'StackExchange.Redis' },
    { from: '3', to: '5', label: 'EF Core Connection Pool' },
    { from: '3', to: '6', label: 'OpenTelemetry Telemetry' },
  ];

  return {
    visualization: {
      type: 'architecture',
      title: 'Scalable Cloud System Architecture (Voice Synthesized)',
      description: 'Topology automatically generated and synchronized from live spoken interview voice response.',
      data: {
        nodes: defaultNodes,
        edges: defaultEdges,
      },
    },
    activeEntities: activeEntities.length > 0 ? activeEntities : ['ASP.NET Core API', 'Azure API Management'],
    highlightSummary: activeEntities.length > 0
      ? `Voice Synced: ${activeEntities.join(', ')}`
      : 'Voice Synced System Diagram',
  };
}

/**
 * Checks whether an entity label or ID matches the currently spoken voice stream.
 */
export function isSpokenEntityActive(label: string, activeEntities: string[]): boolean {
  if (!activeEntities || activeEntities.length === 0) return false;
  const labelLower = label.toLowerCase();
  return activeEntities.some((entity) => {
    const entityLower = entity.toLowerCase();
    return labelLower.includes(entityLower) || entityLower.includes(labelLower);
  });
}
