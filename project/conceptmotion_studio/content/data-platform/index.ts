import {
  assertValidLineageSpec, assertValidWorkflowSpec, validateDiagramSpec,
  type DiagramSpec, type LineageAsset, type LineageRelation, type LineageSpec, type WorkflowSpec,
} from '@conceptmotion/core';
import { validateFigureSpec, type FigureSpec, type JsonValue } from '@datapass/content';
import { visualExplanationFigure } from '../visuals/explanation-examples';

/** Original, hand-authored teaching data; no SQL parsing or service execution. */
export const dataPlatformSource = {
  id: 'source:data-platform-authoring-v4', label: 'Datapass original data-platform teaching fixtures', verifiedAt: '2026-09-05',
};

const fact: LineageAsset = {
  id: 'gold.fact_sales', label: 'fact_sales', type: 'table', layer: 'Gold',
  model: { kind: 'fact', grain: 'One row per order line' },
  columns: [
    { id: 'sales_key', label: 'sales_key', role: 'pk', dataType: 'string' },
    { id: 'date_key', label: 'date_key', role: 'fk', dataType: 'date' },
    { id: 'product_key', label: 'product_key', role: 'fk', dataType: 'integer' },
    { id: 'customer_key', label: 'customer_key', role: 'fk', dataType: 'integer' },
    { id: 'sales_amount', label: 'sales_amount', role: 'measure', dataType: 'decimal(12,2)' },
  ],
};
const dimensions: LineageAsset[] = [
  { id: 'gold.dim_date', label: 'dim_date', type: 'table', model: { kind: 'dimension' }, columns: [
    { id: 'date_key', label: 'date_key', role: 'pk' }, { id: 'month_name', label: 'month_name', role: 'attribute' },
  ] },
  { id: 'gold.dim_product', label: 'dim_product', type: 'table', model: { kind: 'dimension' }, columns: [
    { id: 'product_key', label: 'product_key', role: 'pk' }, { id: 'product_name', label: 'product_name', role: 'attribute' },
  ] },
  { id: 'gold.dim_customer', label: 'dim_customer', type: 'table', model: { kind: 'dimension' }, columns: [
    { id: 'customer_key', label: 'customer_key', role: 'pk' }, { id: 'customer_name', label: 'customer_name', role: 'attribute' },
  ] },
];

export const salesStarSchema = {
  kind: 'lineage', version: '4', id: 'sales-star-schema', title: 'Sales star schema',
  description: 'One fact, three dimensions. Read each FK → PK link as many-to-one; dimensions filter facts.',
  cyclePolicy: 'reject', layout: { provider: 'layered', direction: 'lr' },
  assets: [fact, ...dimensions],
  relations: dimensions.map(dimension => ({
    id: `sales-${dimension.columns![0].id}`,
    sources: [{ assetId: fact.id, columnId: dimension.columns![0].id }],
    target: { assetId: dimension.id, columnId: dimension.columns![0].id },
    relationship: { cardinality: 'many-to-one', filterDirection: 'dimension-to-fact' },
  })),
} satisfies LineageSpec;

export const salesColumnLineage = {
  kind: 'lineage', version: '4', id: 'sales-column-lineage', title: 'From raw orders to sales fields',
  description: 'Read the amount, order-line key and date derivations. SQL is explanatory text.',
  cyclePolicy: 'reject', layout: { provider: 'layered', direction: 'lr' },
  assets: [
    { id: 'raw.orders', label: 'raw.orders', type: 'table', layer: 'Raw', columns: [
      { id: 'amount', label: 'amount', role: 'source' },
      { id: 'order_line_id', label: 'order_line_id', role: 'key' },
      { id: 'ordered_at', label: 'ordered_at', role: 'source' },
    ] },
    { id: 'silver.orders', label: 'silver.orders', type: 'table', layer: 'Silver', columns: [
      { id: 'amount_clean', label: 'amount_clean', role: 'derived' },
      { id: 'sales_key', label: 'sales_key', role: 'key' },
      { id: 'date_key', label: 'date_key', role: 'derived' },
    ] },
    { ...fact, columns: [fact.columns![4], fact.columns![0], fact.columns![1]] },
  ],
  relations: [
    { id: 'clean-amount', sources: [{ assetId: 'raw.orders', columnId: 'amount' }], target: { assetId: 'silver.orders', columnId: 'amount_clean' }, label: 'CAST amount', derivation: 'Convert a valid source amount to decimal; rejected values are handled upstream.', expression: 'CAST(amount AS DECIMAL(12,2))', statementType: 'select', changeType: 'derive' },
    { id: 'name-sales-key', sources: [{ assetId: 'raw.orders', columnId: 'order_line_id' }], target: { assetId: 'silver.orders', columnId: 'sales_key' }, label: 'Rename key', derivation: 'The source already supplies a globally unique order-line identifier.', expression: 'order_line_id AS sales_key', statementType: 'select', changeType: 'rename' },
    { id: 'derive-date-key', sources: [{ assetId: 'raw.orders', columnId: 'ordered_at' }], target: { assetId: 'silver.orders', columnId: 'date_key' }, label: 'DATE key', derivation: 'Use the business date after upstream time-zone normalization.', expression: 'CAST(ordered_at AS DATE)', statementType: 'select', changeType: 'derive' },
    ...(['amount_clean', 'sales_key', 'date_key'] as const).map((columnId, index): LineageRelation => ({
      id: `publish-${columnId}`, sources: [{ assetId: 'silver.orders', columnId }],
      target: { assetId: fact.id, columnId: ['sales_amount', 'sales_key', 'date_key'][index] },
      label: index === 0 ? 'Publish amount' : 'Copy key', expression: index === 0 ? 'amount_clean AS sales_amount' : columnId,
      derivation: 'Publish at the same order-line grain; this projection does not aggregate.', statementType: 'create-view', changeType: index === 0 ? 'rename' : 'copy',
    })),
  ],
} satisfies LineageSpec;

export const salesKpiLineage = {
  kind: 'lineage', version: '4', id: 'sales-kpi-lineage', title: 'Why the revenue KPI changes',
  description: 'Follow one source field into a modeled amount, semantic measure and report visual.',
  cyclePolicy: 'reject', layout: { provider: 'layered', direction: 'tb' },
  assets: [
    salesColumnLineage.assets[1],
    { ...fact, columns: [fact.columns![4]] },
    { id: 'semantic.sales', label: 'Sales semantic model', type: 'semantic-model', columns: [{ id: 'revenue', label: 'Revenue', role: 'measure' }] },
    { id: 'report.sales', label: 'Revenue report', type: 'report', columns: [{ id: 'revenue-kpi', label: 'Revenue KPI', role: 'target' }] },
  ],
  relations: [
    salesColumnLineage.relations[3],
    { id: 'measure-revenue', sources: [{ assetId: fact.id, columnId: 'sales_amount' }], target: { assetId: 'semantic.sales', columnId: 'revenue' }, label: 'Sum in filter context', derivation: 'Sum modeled order-line amounts in the current semantic filter context.', expression: 'Revenue = SUM(fact_sales[sales_amount])', changeType: 'aggregate' },
    { id: 'bind-revenue-kpi', sources: [{ assetId: 'semantic.sales', columnId: 'revenue' }], target: { assetId: 'report.sales', columnId: 'revenue-kpi' }, label: 'Bind measure to visual', derivation: 'The report visual binds Revenue; visual filters also affect its context.', changeType: 'copy' },
  ],
} satisfies LineageSpec;

const layers = [
  ['raw.orders', 'Operational orders', 'Raw'], ['bronze.orders', 'Landing copy', 'Bronze'],
  ['silver.orders', 'Validated orders', 'Silver'], ['gold.fact_sales', 'Sales fact', 'Gold'],
  ['semantic.sales', 'Sales semantic model', 'Semantic'], ['report.sales', 'Sales report', 'Serve'],
] as const;
export const medallionLineage = {
  kind: 'lineage', version: '4', id: 'medallion-asset-lineage', title: 'Raw data to a trusted report',
  description: 'Layer names describe asset responsibilities; they do not imply six separate compute engines.',
  cyclePolicy: 'reject', layout: { provider: 'layered', direction: 'tb' },
  assets: layers.map(([id, label, layer]) => ({ id, label, layer, type: 'asset' })),
  relations: layers.slice(1).map(([id], index): LineageRelation => ({
    id: `layer-${layers[index][2]}-${layers[index + 1][2]}`, sources: [{ assetId: layers[index][0] }], target: { assetId: id },
    label: ['Land unchanged', 'Clean and validate', 'Model at declared grain', 'Define business measures', 'Bind report fields'][index],
    changeType: index === 0 || index === 4 ? 'copy' : 'derive',
  })),
} satisfies LineageSpec;

export const platformProviders = ['conceptual', 'fabric', 'databricks', 'gcp', 'azure'] as const;
export type PlatformProvider = typeof platformProviders[number];
export const platformResponsibilities = ['source', 'move', 'store', 'process', 'model', 'serve', 'operate', 'govern'] as const;
const services: Record<PlatformProvider, readonly string[]> = {
  conceptual: ['Operational sources', 'Batch / CDC ingestion', 'Lakehouse storage', 'Clean and validate', 'Business model', 'Reports / APIs', 'Schedule and observe', 'Catalog and access'],
  fabric: ['Apps / databases', 'Copy / Mirroring', 'OneLake', 'Spark / Dataflow Gen2', 'Semantic model', 'Power BI', 'Data Factory pipelines', 'Purview / catalog'],
  databricks: ['Apps / databases', 'Lakeflow / Auto Loader', 'Delta tables', 'Spark / SQL', 'Gold data products', 'SQL / AI BI', 'Lakeflow Jobs', 'Unity Catalog'],
  gcp: ['Apps / databases', 'Datastream', 'Cloud Storage', 'Dataflow / Dataform', 'BigQuery marts', 'Looker', 'Managed Airflow', 'Catalog / IAM'],
  azure: ['Apps / databases', 'Data Factory copy', 'ADLS Gen2', 'Databricks / SQL', 'Curated SQL model', 'Power BI / APIs', 'Data Factory pipelines', 'Purview / Entra ID'],
};

/** A vocabulary lens, not a provisioning recipe or equivalence claim. IDs stay stable. */
export function lakehouseArchitecture(provider: PlatformProvider = 'conceptual'): DiagramSpec {
  const labels = services[provider];
  if (!labels) throw new Error(`Unknown platform provider: ${provider}`);
  const spec: DiagramSpec = {
    kind: 'diagram', version: '4', id: `lakehouse-${provider}`, title: `Lakehouse responsibilities · ${provider}`,
    description: 'Source → Move → Store → Process → Model → Serve; Operate and Govern span the platform.',
    layout: { provider: 'layered', density: 'comfortable', direction: 'lr' },
    nodes: platformResponsibilities.map((id, index) => ({
      id, label: labels[index], kind: id, iconId: `data.${id}`, preferredRank: index < 6 ? index : index === 6 ? 2 : 3,
      metadata: { responsibility: id, provider, ...(index >= 6 ? { appliesTo: platformResponsibilities.slice(0, 6) } : {}) },
    })),
    edges: [
      ...platformResponsibilities.slice(0, 5).map((id, index) => ({ id: `${id}-${platformResponsibilities[index + 1]}`, from: { nodeId: id }, to: { nodeId: platformResponsibilities[index + 1] }, flowKind: 'data-batch' as const })),
      { id: 'operate-process', from: { nodeId: 'operate' }, to: { nodeId: 'process' }, flowKind: 'control' },
      { id: 'govern-store', from: { nodeId: 'govern' }, to: { nodeId: 'store' }, flowKind: 'lineage' },
    ],
  };
  const result = validateDiagramSpec(spec);
  if (!result.valid) throw new Error(result.issues.map(issue => issue.message).join('; '));
  return spec;
}

/** The existing approved trace, with its original content/task/run identities. */
export const backfillWorkflow = assertValidWorkflowSpec(visualExplanationFigure('de-backfill').spec) as WorkflowSpec;
export const backfillTopology: DiagramSpec = {
  kind: 'diagram', version: '4', id: 'backfill-dependencies', title: 'Two dates, one publish dependency',
  description: 'Both date tasks feed publish. Topology alone does not declare a running or successful task.',
  layout: { provider: 'layered', density: 'comfortable' }, nodes: backfillWorkflow.nodes,
  edges: backfillWorkflow.edges.map(edge => ({ id: `${edge.from}-${edge.to}`, from: { nodeId: edge.from }, to: { nodeId: edge.to }, flowKind: 'control', label: 'Success' })),
};

function figure(spec: LineageSpec | DiagramSpec | WorkflowSpec, rendererId: string, fallbackText: string): FigureSpec {
  if (spec.kind === 'lineage') assertValidLineageSpec(spec);
  const result: FigureSpec = {
    id: spec.id, title: spec.title, kind: spec.kind, rendererId,
    spec: JSON.parse(JSON.stringify(spec)) as JsonValue, fallbackText,
    sourceIds: [dataPlatformSource.id], verifiedAt: dataPlatformSource.verifiedAt, profile: 'professional',
  };
  if (!validateFigureSpec(result).valid) throw new Error(`Invalid canonical Figure: ${spec.id}`);
  return result;
}

export const dataPlatformFigures: readonly FigureSpec[] = [
  figure(salesStarSchema, 'lineage.model', 'Grain: one row per order line. fact_sales has sales_key PK, date_key/product_key/customer_key FKs and sales_amount measure. Each FK references the matching dimension PK many-to-one. Each dimension filters the fact; fact rows do not filter dimensions.'),
  figure(salesColumnLineage, 'lineage.model', 'raw.orders.amount → silver.orders.amount_clean → gold.fact_sales.sales_amount. Rename the globally unique order_line_id to sales_key; derive date_key from the normalized business date. The order-line grain is preserved. SQL is authored explanation, not executed.'),
  figure(salesKpiLineage, 'lineage.model', 'silver.orders.amount_clean → gold.fact_sales.sales_amount → semantic.sales.revenue → report.sales.revenue-kpi. Revenue sums sales_amount in filter context. The KPI endpoint is lineage metadata; the analytical visual belongs to the consumer or VizForge.'),
  figure(medallionLineage, 'lineage.model', 'Operational orders → Bronze landing copy → Silver validated orders → Gold sales fact → semantic model → report. Preserve replayable source data; define grain before measures.'),
  ...platformProviders.map(provider => figure(lakehouseArchitecture(provider), 'diagram.flow', platformResponsibilities.map((id, i) => `${id}: ${services[provider][i]}`).join('. ') + '. Operate and Govern apply across all six stages; the two context edges are representative, not exhaustive.')),
  figure(backfillTopology, 'diagram.flow', 'Select two dates, fan out to September 1 and September 2, then fan in to publish after both succeed. No execution state is represented here.'),
  figure({ ...backfillWorkflow, id: 'backfill-workflow-topology', runs: undefined, explanation: undefined }, 'workflow.topology', 'The same WorkflowSpec dependencies can be presented without a run.'),
  visualExplanationFigure('de-backfill'),
];

export function dataPlatformFigure(id: string): FigureSpec {
  const result = dataPlatformFigures.find(figure => figure.id === id);
  if (!result) throw new Error(`Unknown data-platform Figure: ${id}`);
  return result;
}
