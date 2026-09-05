import type { DiagramSpec, LineageSpec } from '@conceptmotion/core';
import type { FigureSpec, JsonValue } from '@datapass/content';
export const architectureSource = { id: 'source:architecture-reference-v3', label: 'Author-provided architecture reference', verifiedAt: '2026-09-04' };
export const providers = ['conceptual', 'databricks', 'fabric', 'gcp'] as const;
export type Provider = typeof providers[number];
export const providerNames: Record<Provider, string> = { conceptual: 'Conceptual', databricks: 'Databricks', fabric: 'Microsoft Fabric', gcp: 'Google Cloud' };
export const stages = ['source', 'move', 'store', 'process', 'model', 'serve', 'operate', 'govern'] as const;
export type Stage = typeof stages[number];
export const stageNames: Record<Stage, string> = { source: 'Source', move: 'Move', store: 'Store', process: 'Process', model: 'Model', serve: 'Serve', operate: 'Operate', govern: 'Govern' };
export const stageIntent: Record<Stage, string> = { source: 'Identify the operational system of record and data ownership.', move: 'Transport or capture data while preserving replay and change semantics.', store: 'Persist replayable data independently of how it will be processed.', process: 'Clean, enrich and validate using an explicit compute engine.', model: 'Publish a declared business grain, keys and quality contract.', serve: 'Expose trusted data to BI, APIs, applications or ML.', operate: 'Coordinate dependencies, retries, observability and delivery; orchestration is not compute.', govern: 'Make ownership, access, catalog, quality and lineage explicit across every stage.' };
export type Workload = 'medallion' | 'streaming' | 'cdc' | 'orchestration';
export const workloadNames: Record<Workload, string> = { medallion: 'Lakehouse / medallion', streaming: 'Streaming / real time', cdc: 'CDC / replication', orchestration: 'Orchestration / platform' };
type Translation = Record<Provider, readonly string[]>;
/** Semantic content adapted from the pinned source's sixteen variants. No old UI or icon paths. */
export const translations: Record<Workload, Translation> = {
  medallion: {
    conceptual: ['Apps / DBs / files', 'Batch / CDC', 'Raw / trusted zones', 'Clean + validate', 'Business products', 'BI / APIs / ML', 'Schedules + retries', 'Catalog + lineage'],
    databricks: ['Apps / DBs / files', 'Lakeflow Connect / Auto Loader', 'Delta Bronze / Silver', 'Lakeflow pipelines / Runtime', 'Delta Gold', 'SQL Warehouse / AI/BI', 'Lakeflow Jobs / Bundles', 'Unity Catalog'],
    fabric: ['Apps / DBs / SaaS', 'Copy Job / Mirroring', 'OneLake Lakehouse', 'Fabric Spark / Dataflow Gen2', 'Fabric Warehouse', 'Power BI', 'Data Factory Pipelines / Git', 'OneLake catalog / Purview'],
    gcp: ['Apps / DBs / SaaS', 'Datastream / Dataflow', 'Cloud Storage / BigQuery', 'Dataform / Managed Spark', 'BigQuery marts / Iceberg', 'Looker', 'Managed Airflow / Cloud Build', 'Knowledge Catalog'],
  },
  streaming: {
    conceptual: ['Events / telemetry', 'Broker / event bus', 'Hot store + history', 'Window + enrich', 'Event aggregates', 'Live dashboard / actions', 'Lag + failure monitoring', 'Schema + replay policy'],
    databricks: ['Kafka / cloud events', 'Kafka / Lakeflow Connect', 'Delta streaming tables', 'Structured Streaming', 'Lakeflow tables', 'SQL Warehouse / AI/BI', 'Lakeflow Jobs', 'Unity Catalog'],
    fabric: ['Apps / IoT / logs', 'Eventstreams', 'Eventhouse / OneLake', 'Eventstream operators', 'KQL materialized views', 'Real-Time Dashboard / Activator', 'Monitoring + alerts', 'OneLake catalog'],
    gcp: ['Apps / IoT / logs', 'Pub/Sub', 'BigQuery / Cloud Storage', 'Dataflow / Apache Beam', 'BigQuery analytical tables', 'Looker / apps', 'Airflow / Workflows', 'Knowledge Catalog'],
  },
  cdc: {
    conceptual: ['Operational database', 'Log-based capture', 'Raw changes / replica', 'Apply + validate changes', 'Curated analytical model', 'BI / APIs / ML', 'Capture monitoring', 'Data quality + lineage'],
    databricks: ['Operational database', 'Lakeflow Connect CDC', 'Delta Bronze', 'Lakeflow pipelines / MERGE', 'Delta Silver / Gold', 'SQL Warehouse', 'Lakeflow Jobs', 'Unity Catalog'],
    fabric: ['Operational database', 'Mirroring / Copy Job CDC', 'OneLake replica / Bronze', 'Spark / SQL / Dataflow Gen2', 'Warehouse / semantic model', 'Power BI', 'Data Factory Pipelines', 'OneLake catalog / Purview'],
    gcp: ['Operational database', 'Datastream', 'BigQuery / Cloud Storage', 'Dataform / Dataflow / SQL', 'Business tables', 'Looker / apps', 'Managed Airflow', 'Knowledge Catalog'],
  },
  orchestration: {
    conceptual: ['Schedule / event trigger', 'Dispatch tasks', 'Input / output assets', 'Transformation engine', 'Publish dependency', 'Refresh / downstream task', 'Retries + task DAG', 'Quality + lineage'],
    databricks: ['Lakeflow Jobs trigger', 'Notebook / pipeline task', 'Delta assets', 'Runtime / pipeline / SQL', 'Curated tables', 'Dashboard refresh', 'Lakeflow Jobs / Bundles', 'Unity Catalog'],
    fabric: ['Pipeline / Airflow trigger', 'Copy / Fabric operators', 'OneLake assets', 'Notebook / Spark / SQL', 'Warehouse refresh', 'Power BI', 'Pipelines / Apache Airflow Job', 'OneLake catalog / Purview'],
    gcp: ['Airflow / Workflows trigger', 'Task / service dispatch', 'Cloud Storage / BigQuery', 'BigQuery / Dataflow / Spark', 'Dataform graph', 'Apps / BI', 'Managed Airflow / Workflows', 'Knowledge Catalog'],
  },
};

export function architectureDiagram(workload: Workload, provider: Provider, layout: 'layered' | 'radial'): DiagramSpec & { frames: readonly { id: string; activeNodeIds: readonly string[]; activeEdgeIds: readonly string[] }[] } {
  const labels = translations[workload][provider];
  const edges = stages.slice(0, 5).map((stage, i) => ({ id: `${stage}-${stages[i + 1]}`, from: { nodeId: stage }, to: { nodeId: stages[i + 1] }, flowKind: 'data' as const }));
  return { kind: 'diagram', version: '3', id: `architecture-${workload}-${provider}-${layout}`, title: workloadNames[workload], description: 'Source → Move → Store → Process → Model → Serve', layout: { provider: layout, hubId: 'process', density: 'comfortable' }, nodes: stages.map((stage, i) => ({ id: stage, label: labels[i], kind: stage, preferredRank: i < 6 ? i : i === 6 ? 2 : 3, iconId: `data.${stage}`, metadata: { stage, intent: stageIntent[stage], sourceId: architectureSource.id } })), edges: [...edges, { id: 'operate-process', from: { nodeId: 'operate' }, to: { nodeId: 'process' }, flowKind: 'control' }, { id: 'govern-store', from: { nodeId: 'govern' }, to: { nodeId: 'store' }, flowKind: 'lineage' }], frames: stages.map((stage, i) => ({ id: stage, activeNodeIds: [stage], activeEdgeIds: i > 0 && i < 6 ? edges.slice(0, i).map(edge => edge.id) : stage === 'operate' ? ['operate-process'] : stage === 'govern' ? ['govern-store'] : [] })) };
}

export function architectureFigure(workload: Workload, provider: Provider, layout: 'layered' | 'radial'): FigureSpec {
  const spec = architectureDiagram(workload, provider, layout);
  return { id: spec.id, kind: 'diagram', rendererId: 'diagram.flow', title: `${workloadNames[workload]} · ${providerNames[provider]}`, takeaway: 'Keep stage responsibilities stable while translating provider vocabulary.', spec: JSON.parse(JSON.stringify(spec)) as JsonValue, fallbackText: stages.map((stage, i) => `${stageNames[stage]}: ${translations[workload][provider][i]}`).join('. '), sourceIds: [architectureSource.id], verifiedAt: architectureSource.verifiedAt, status: 'Pinned reference snapshot, not live service verification', profile: 'professional' };
}

const lineage: LineageSpec = { kind: 'lineage', version: '3', id: 'architecture-lineage', title: 'Business metric lineage', assets: [{ id: 'raw', label: 'Raw orders', type: 'table', layer: 'Bronze', columns: [{ id: 'amount', label: 'amount' }] }, { id: 'clean', label: 'Validated orders', type: 'table', layer: 'Silver', columns: [{ id: 'amount', label: 'amount' }] }, { id: 'daily', label: 'Daily revenue', type: 'table', layer: 'Gold', columns: [{ id: 'revenue', label: 'revenue' }] }], relations: [{ id: 'validate', sources: [{ assetId: 'raw', columnId: 'amount' }], target: { assetId: 'clean', columnId: 'amount' }, changeType: 'filter', label: 'Valid amounts' }, { id: 'aggregate', sources: [{ assetId: 'clean', columnId: 'amount' }], target: { assetId: 'daily', columnId: 'revenue' }, changeType: 'aggregate', expression: 'SUM(amount)', label: 'Daily SUM' }] };
export const lineageFigure: FigureSpec = { id: lineage.id, kind: 'lineage', rendererId: 'lineage.model', title: lineage.title, spec: JSON.parse(JSON.stringify(lineage)) as JsonValue, fallbackText: 'Raw orders.amount → validated orders.amount → SUM(amount) in daily revenue.revenue. Hand-authored lineage, not SQL parsing.', takeaway: 'Orchestration dependencies and data derivation are related but different graphs.', profile: 'professional' };
