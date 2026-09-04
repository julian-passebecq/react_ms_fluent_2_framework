import type {
  DiagramSpec,
  FlowKind,
  LineageSpec,
  WorkflowPreset,
  WorkflowSpec,
} from '@conceptmotion/core';

export const pipelineFlowKinds: Array<{ id: Extract<FlowKind, 'data-batch' | 'data-stream' | 'cdc'>; label: string }> = [
  { id: 'data-batch', label: 'Batch' },
  { id: 'data-stream', label: 'Stream' },
  { id: 'cdc', label: 'CDC' },
];

export function createPipelineDiagram(flowKind: FlowKind = 'data-batch'): DiagramSpec & {
  readonly frames: readonly {
    id: string;
    activeNodeIds?: readonly string[];
    activeEdgeIds?: readonly string[];
    failedNodeIds?: readonly string[];
  }[];
} {
  return {
    kind: 'diagram',
    version: '1.1',
    id: 'medallion-pipeline',
    title: { en: 'Source to governed BI', no: 'Fra kilde til styrt BI' },
    description: 'Data movement and orchestration control use separate semantic channels.',
    layout: { direction: 'lr', density: 'comfortable' },
    groups: [
      { id: 'lakehouse', label: 'Lakehouse workspace', kind: 'boundary', childNodeIds: ['bronze', 'silver', 'gold'] },
    ],
    nodes: [
      { id: 'source', label: 'Operational source', kind: 'source', iconId: 'generic.database', ports: [{ id: 'out', side: 'right', role: 'data' }] },
      { id: 'bronze', label: 'Bronze', kind: 'raw', groupId: 'lakehouse', iconId: 'fabric.lakehouse', ports: [{ id: 'in', side: 'left' }, { id: 'out', side: 'right' }] },
      { id: 'silver', label: 'Silver', kind: 'curated', groupId: 'lakehouse', iconId: 'fabric.lakehouse', ports: [{ id: 'in', side: 'left' }, { id: 'out', side: 'right' }, { id: 'control', side: 'bottom' }, { id: 'error', side: 'bottom' }] },
      { id: 'gold', label: 'Gold', kind: 'serving', groupId: 'lakehouse', iconId: 'fabric.warehouse', ports: [{ id: 'in', side: 'left' }, { id: 'out', side: 'right' }] },
      { id: 'semantic', label: 'Semantic model', kind: 'semantic-model', iconId: 'powerbi.semantic-model', ports: [{ id: 'in', side: 'left' }, { id: 'out', side: 'right' }] },
      { id: 'bi', label: 'BI report', kind: 'report', iconId: 'generic.chart', ports: [{ id: 'in', side: 'left' }] },
      { id: 'orchestrator', label: 'Orchestrator', kind: 'control', iconId: 'fabric.pipeline', ports: [{ id: 'control', side: 'top' }] },
      { id: 'quarantine', label: 'Quarantine', kind: 'error-store', iconId: 'generic.warning', ports: [{ id: 'in', side: 'top' }, { id: 'out', side: 'right' }] },
    ],
    edges: [
      { id: 'flow-ingest', from: { nodeId: 'source', portId: 'out' }, to: { nodeId: 'bronze', portId: 'in' }, label: flowKind === 'data-stream' ? 'events' : flowKind === 'cdc' ? 'I / U / D' : 'hourly files', flowKind },
      { id: 'flow-cleanse', from: { nodeId: 'bronze', portId: 'out' }, to: { nodeId: 'silver', portId: 'in' }, label: 'validate + cleanse', flowKind: 'data-batch' },
      { id: 'flow-curate', from: { nodeId: 'silver', portId: 'out' }, to: { nodeId: 'gold', portId: 'in' }, label: 'model', flowKind: 'data' },
      { id: 'flow-model', from: { nodeId: 'gold', portId: 'out' }, to: { nodeId: 'semantic', portId: 'in' }, label: 'Direct Lake', flowKind: 'lineage' },
      { id: 'flow-serve', from: { nodeId: 'semantic', portId: 'out' }, to: { nodeId: 'bi', portId: 'in' }, label: 'queries', flowKind: 'data' },
      { id: 'flow-control', from: { nodeId: 'orchestrator', portId: 'control' }, to: { nodeId: 'silver', portId: 'control' }, label: 'run signal', flowKind: 'control' },
      { id: 'flow-failure', from: { nodeId: 'silver', portId: 'error' }, to: { nodeId: 'quarantine', portId: 'in' }, label: 'invalid rows', flowKind: 'failure' },
      { id: 'flow-recovery', from: { nodeId: 'quarantine', portId: 'out' }, to: { nodeId: 'gold', portId: 'in' }, label: 'approved replay', flowKind: 'success' },
    ],
    frames: [
      { id: 'ingest', activeNodeIds: ['source', 'bronze'], activeEdgeIds: ['flow-ingest'] },
      { id: 'transform', activeNodeIds: ['bronze', 'silver', 'orchestrator'], activeEdgeIds: ['flow-cleanse', 'flow-control'] },
      { id: 'failure', activeNodeIds: ['quarantine'], activeEdgeIds: ['flow-failure'], failedNodeIds: ['silver'] },
      { id: 'recovery', activeNodeIds: ['quarantine', 'gold', 'semantic', 'bi'], activeEdgeIds: ['flow-recovery', 'flow-model', 'flow-serve'] },
    ],
  };
}

export const salesModelLineage: LineageSpec = {
  kind: 'lineage',
  version: '1.1',
  id: 'sales-star-lineage',
  title: 'Sales star schema',
  description: 'Fact and dimension ports preserve explicit relationship endpoints.',
  assets: [
    { id: 'dim_date', label: 'Dim Date', type: 'dimension', layer: 'dimension', iconId: 'generic.table', columns: [
      { id: 'date_key', label: 'DateKey', role: 'key', dataType: 'int' },
      { id: 'date', label: 'Date', role: 'source', dataType: 'date' },
    ] },
    { id: 'dim_product', label: 'Dim Product', type: 'dimension', layer: 'dimension', iconId: 'generic.table', columns: [
      { id: 'product_key', label: 'ProductKey', role: 'key', dataType: 'int' },
      { id: 'product_name', label: 'ProductName', role: 'source', dataType: 'string' },
    ] },
    { id: 'fct_sales', label: 'Fact Sales', type: 'fact', layer: 'fact', iconId: 'generic.table', columns: [
      { id: 'date_key', label: 'DateKey', role: 'key', dataType: 'int' },
      { id: 'product_key', label: 'ProductKey', role: 'key', dataType: 'int' },
      { id: 'sales_amount', label: 'SalesAmount', role: 'measure', dataType: 'decimal' },
    ] },
  ],
  relations: [
    { id: 'rel-date', sources: [{ assetId: 'dim_date', columnId: 'date_key' }], target: { assetId: 'fct_sales', columnId: 'date_key' }, label: '1 → *', changeType: 'copy' },
    { id: 'rel-product', sources: [{ assetId: 'dim_product', columnId: 'product_key' }], target: { assetId: 'fct_sales', columnId: 'product_key' }, label: '1 → *', changeType: 'copy' },
  ],
};

export const columnLineageFixture: LineageSpec & { readonly frames: readonly { id: string; activeRelationIds: readonly string[] }[] } = {
  kind: 'lineage',
  version: '1.1',
  id: 'order-column-lineage',
  title: 'Order revenue column lineage',
  description: 'Manually supplied parser-like JSON; no SQL parser is present.',
  assets: [
    {
      id: 'raw_orders', label: 'raw.orders', type: 'source-table', layer: 'bronze', iconId: 'generic.database',
      source: { system: 'ERP', object: 'dbo.orders' },
      columns: [
        { id: 'order_id', label: 'order_id', role: 'key', dataType: 'bigint' },
        { id: 'order_date', label: 'order_date', role: 'source', dataType: 'datetime2' },
        { id: 'customer_id', label: 'customer_id', role: 'source', dataType: 'nvarchar' },
      ],
    },
    {
      id: 'raw_order_lines', label: 'raw.order_lines', type: 'source-table', layer: 'bronze', iconId: 'generic.database',
      source: { system: 'ERP', object: 'dbo.order_lines' },
      columns: [
        { id: 'order_id', label: 'order_id', role: 'key', dataType: 'bigint' },
        { id: 'quantity', label: 'quantity', role: 'source', dataType: 'int' },
        { id: 'unit_price', label: 'unit_price', role: 'source', dataType: 'decimal' },
      ],
    },
    {
      id: 'fct_sales', label: 'gold.fct_sales', type: 'target-table', layer: 'gold', iconId: 'fabric.warehouse',
      target: { system: 'Fabric Warehouse', object: 'gold.fct_sales' },
      columns: [
        { id: 'sales_key', label: 'sales_key', role: 'key', dataType: 'bigint' },
        { id: 'order_date', label: 'order_date', role: 'target', dataType: 'date' },
        { id: 'net_amount', label: 'net_amount', role: 'derived', dataType: 'decimal' },
      ],
    },
  ],
  relations: [
    {
      id: 'lineage-order-date',
      sources: [{ assetId: 'raw_orders', columnId: 'order_date' }],
      target: { assetId: 'fct_sales', columnId: 'order_date' },
      label: 'cast date', derivation: 'Remove the time component', expression: 'CAST(o.order_date AS date)',
      statementType: 'create-table-as', changeType: 'derive', sourceSpan: { sourceId: 'fixture.sql', start: { line: 4, column: 3 }, end: { line: 4, column: 33 } },
    },
    {
      id: 'lineage-net-amount',
      sources: [
        { assetId: 'raw_order_lines', columnId: 'quantity' },
        { assetId: 'raw_order_lines', columnId: 'unit_price' },
      ],
      target: { assetId: 'fct_sales', columnId: 'net_amount' },
      label: 'derive revenue', derivation: 'Quantity multiplied by unit price', expression: 'l.quantity * l.unit_price',
      statementType: 'create-table-as', changeType: 'derive', sourceSpan: { sourceId: 'fixture.sql', start: { line: 5, column: 3 }, end: { line: 5, column: 40 } },
    },
    {
      id: 'lineage-order-key',
      sources: [
        { assetId: 'raw_orders', columnId: 'order_id' },
        { assetId: 'raw_order_lines', columnId: 'order_id' },
      ],
      target: { assetId: 'fct_sales', columnId: 'sales_key' },
      label: 'join + key', derivation: 'Stable key derived after the order-line join', expression: 'HASH(o.order_id, l.order_id)',
      statementType: 'create-table-as', changeType: 'join', sourceSpan: { sourceId: 'fixture.sql', start: { line: 8, column: 1 }, end: { line: 8, column: 38 } },
    },
  ],
  frames: [
    { id: 'order-date', activeRelationIds: ['lineage-order-date'] },
    { id: 'net-amount', activeRelationIds: ['lineage-net-amount'] },
    { id: 'join-key', activeRelationIds: ['lineage-order-key'] },
  ],
};

export const workflowPresets: Array<{ id: WorkflowPreset; label: string }> = [
  { id: 'airflow', label: 'Airflow' },
  { id: 'fabric-data-factory', label: 'Fabric / ADF' },
  { id: 'databricks-lakeflow', label: 'Lakeflow' },
];

export const workflowFixture: WorkflowSpec = {
  kind: 'workflow',
  version: '1.1',
  id: 'sales-refresh',
  title: { en: 'Sales medallion refresh', no: 'Oppdatering av salgsmedaljong' },
  description: 'One provider-independent graph drives every presentation preset.',
  preset: 'airflow',
  layout: { direction: 'lr', density: 'comfortable' },
  schedule: { kind: 'cron', expression: '0 5 * * *', label: { en: 'Daily at 05:00', no: 'Daglig kl. 05:00' } },
  parameters: { businessDate: '2026-09-04', retryLimit: 2 },
  groups: [
    { id: 'quality_checks', label: 'Quality checks', kind: 'task-group', childNodeIds: ['profile_rows', 'check_keys'] },
  ],
  nodes: [
    { id: 'extract', label: 'Extract orders', taskType: 'copy', providerType: 'Copy activity', iconId: 'generic.database', metadata: { owner: 'Data ingestion', runtime: 'serverless' } },
    { id: 'bronze', label: 'Load bronze', taskType: 'pipeline', providerType: 'Lakehouse load', iconId: 'fabric.lakehouse', metadata: { layer: 'bronze' } },
    { id: 'profile_rows', label: 'Profile rows', taskType: 'notebook', providerType: 'Notebook', groupId: 'quality_checks', iconId: 'generic.notebook', metadata: { compute: 'small autoscale' } },
    { id: 'check_keys', label: 'Check keys', taskType: 'sql', providerType: 'SQL script', groupId: 'quality_checks', iconId: 'generic.code', metadata: { rule: 'customer_id not null' } },
    { id: 'transform', label: 'Build silver', taskType: 'pyspark', providerType: 'Spark notebook', iconId: 'generic.notebook', metadata: { retries: 2, compute: 'medium autoscale' } },
    { id: 'publish', label: 'Publish gold', taskType: 'dbt', providerType: 'Warehouse procedure', iconId: 'fabric.warehouse', metadata: { target: 'gold.fct_sales' } },
    { id: 'quarantine', label: 'Quarantine rows', taskType: 'pipeline', providerType: 'Failure path', iconId: 'generic.warning', metadata: { target: 'ops.quarantine' } },
    { id: 'notify', label: 'Notify owner', taskType: 'notify', providerType: 'Teams / email', iconId: 'generic.user', metadata: { channel: 'data-ops' } },
  ],
  edges: [
    { id: 'edge-extract-bronze', from: 'extract', to: 'bronze', condition: 'success', dataFlowKind: 'data-batch', label: 'On success' },
    { id: 'edge-bronze-profile', from: 'bronze', to: 'profile_rows', condition: 'success', label: 'Fan out' },
    { id: 'edge-bronze-keys', from: 'bronze', to: 'check_keys', condition: 'success', label: 'Fan out' },
    { id: 'edge-profile-transform', from: 'profile_rows', to: 'transform', condition: 'completion', label: 'Completed' },
    { id: 'edge-keys-transform', from: 'check_keys', to: 'transform', condition: 'success', label: 'Passed' },
    { id: 'edge-transform-publish', from: 'transform', to: 'publish', condition: 'success', dataFlowKind: 'lineage', label: 'Validated' },
    { id: 'edge-transform-quarantine', from: 'transform', to: 'quarantine', condition: 'failure', label: 'On failure' },
    { id: 'edge-publish-notify', from: 'publish', to: 'notify', condition: 'success', label: 'Published' },
    { id: 'edge-quarantine-notify', from: 'quarantine', to: 'notify', condition: 'completion', label: 'Always notify' },
    { id: 'edge-profile-notify-skip', from: 'profile_rows', to: 'notify', condition: 'skip', label: 'Skipped branch' },
  ],
  runs: [
    {
      id: 'run-success', label: 'Successful run', startedAt: '2026-09-04T05:00:00Z', frames: [
        { id: 'success-queued', at: 0, states: { extract: { status: 'queued' } } },
        { id: 'success-extract', at: 1, states: { extract: { status: 'running', attempt: 1 } } },
        { id: 'success-bronze', at: 2, states: { extract: { status: 'success', durationMs: 42000 }, bronze: { status: 'running', attempt: 1 } } },
        { id: 'success-quality', at: 3, states: { bronze: { status: 'success' }, quality_checks: { status: 'running' }, profile_rows: { status: 'running' }, check_keys: { status: 'running' } } },
        { id: 'success-transform', at: 4, states: { profile_rows: { status: 'success' }, check_keys: { status: 'success' }, quality_checks: { status: 'success' }, transform: { status: 'running', attempt: 1 } } },
        { id: 'success-publish', at: 5, states: { transform: { status: 'success' }, publish: { status: 'running' }, quarantine: { status: 'skipped' } } },
        { id: 'success-notify', at: 6, states: { publish: { status: 'success' }, notify: { status: 'running' } } },
        { id: 'success-complete', at: 7, states: { notify: { status: 'success' } } },
      ],
    },
    {
      id: 'run-retry', label: 'Retry recovered', startedAt: '2026-09-03T05:00:00Z', frames: [
        { id: 'retry-queued', at: 0, states: { extract: { status: 'queued' } } },
        { id: 'retry-extract', at: 1, states: { extract: { status: 'running', attempt: 1 } } },
        { id: 'retry-quality', at: 2, states: { extract: { status: 'success' }, bronze: { status: 'success' }, quality_checks: { status: 'running' }, profile_rows: { status: 'success' }, check_keys: { status: 'success' } } },
        { id: 'retry-transform', at: 3, states: { quality_checks: { status: 'success' }, transform: { status: 'running', attempt: 1 } } },
        { id: 'retry-failed', at: 4, states: { transform: { status: 'failed', attempt: 1, message: 'Transient capacity limit' }, quarantine: { status: 'running' } } },
        { id: 'retry-wait', at: 5, states: { transform: { status: 'retrying', attempt: 2 }, quarantine: { status: 'success' } } },
        { id: 'retry-running', at: 6, states: { transform: { status: 'running', attempt: 2 } } },
        { id: 'retry-publish', at: 7, states: { transform: { status: 'success', attempt: 2 }, publish: { status: 'running' } } },
        { id: 'retry-complete', at: 8, states: { publish: { status: 'success' }, notify: { status: 'success' } } },
      ],
    },
  ],
  overlays: [{ id: 'asset-flow', kind: 'data-flow', targetIds: ['extract', 'bronze', 'transform', 'publish'], metadata: { flowKind: 'data-batch' } }],
};

export function workflowWithPreset(preset: WorkflowPreset): WorkflowSpec {
  return { ...workflowFixture, preset };
}
