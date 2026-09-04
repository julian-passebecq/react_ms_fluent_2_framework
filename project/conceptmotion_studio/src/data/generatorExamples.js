/** Seed examples for the next generator families. These are contracts/examples,
 * not a claim that all three renderers are live yet. */

export const cloudFabricExample = {
  kind: 'cloud-diagram',
  version: '0.1',
  id: 'fabric-ingest-serve',
  title: 'Fabric ingest to serve',
  layout: 'layered',
  providerTheme: 'fabric',
  containers: [
    { id: 'ingest', type: 'stage', label: 'Ingest' },
    { id: 'process', type: 'stage', label: 'Process' },
    { id: 'serve', type: 'stage', label: 'Serve' }
  ],
  nodes: [
    { id: 'sources', type: 'data-source', label: 'Source systems', container: 'ingest' },
    { id: 'pipeline', type: 'fabric-pipeline', label: 'Fabric pipeline', container: 'ingest' },
    { id: 'lakehouse', type: 'lakehouse', label: 'Lakehouse', container: 'process' },
    { id: 'notebook', type: 'notebook', label: 'Spark notebook', container: 'process' },
    { id: 'semantic', type: 'semantic-model', label: 'Semantic model', container: 'serve' },
    { id: 'powerbi', type: 'power-bi', label: 'Power BI', container: 'serve' }
  ],
  edges: [
    { from: 'sources', to: 'pipeline', label: 'ingest', tone: 'data', style: 'dashed', animation: { type: 'packets', speed: 'medium' } },
    { from: 'pipeline', to: 'lakehouse', label: 'load', tone: 'data', style: 'solid' },
    { from: 'lakehouse', to: 'notebook', label: 'transform', tone: 'process', style: 'solid' },
    { from: 'notebook', to: 'semantic', label: 'curate', tone: 'process', style: 'solid' },
    { from: 'semantic', to: 'powerbi', label: 'serve', tone: 'serve', style: 'solid' }
  ]
};

export const starModelExample = {
  kind: 'data-model',
  version: '0.1',
  id: 'sales-star',
  title: 'Sales star schema',
  layout: 'star',
  entities: [
    { id: 'sales', type: 'fact', name: 'Sales', grain: 'One row per order line', columns: [
      { name: 'SalesKey', role: 'pk' },
      { name: 'DateKey', role: 'fk' },
      { name: 'ProductKey', role: 'fk' },
      { name: 'CustomerKey', role: 'fk' },
      { name: 'StoreKey', role: 'fk' },
      { name: 'SalesAmount', role: 'measure' }
    ]},
    { id: 'dates', type: 'dimension', name: 'Dates', columns: [{ name: 'DateKey', role: 'pk' }, { name: 'Date', role: 'attribute' }] },
    { id: 'products', type: 'dimension', name: 'Products', columns: [{ name: 'ProductKey', role: 'pk' }, { name: 'ProductName', role: 'attribute' }] },
    { id: 'customers', type: 'dimension', name: 'Customers', columns: [{ name: 'CustomerKey', role: 'pk' }, { name: 'CustomerName', role: 'attribute' }] },
    { id: 'stores', type: 'dimension', name: 'Stores', columns: [{ name: 'StoreKey', role: 'pk' }, { name: 'StoreName', role: 'attribute' }] }
  ],
  relationships: [
    { from: 'sales.DateKey', to: 'dates.DateKey', cardinality: 'many-to-one', filterDirection: 'single' },
    { from: 'sales.ProductKey', to: 'products.ProductKey', cardinality: 'many-to-one', filterDirection: 'single' },
    { from: 'sales.CustomerKey', to: 'customers.CustomerKey', cardinality: 'many-to-one', filterDirection: 'single' },
    { from: 'sales.StoreKey', to: 'stores.StoreKey', cardinality: 'many-to-one', filterDirection: 'single' }
  ]
};

export const lineageExample = {
  kind: 'lineage',
  version: '0.1',
  id: 'sales-lineage',
  title: 'Source to Power BI lineage',
  layout: 'left-to-right',
  assets: [
    { id: 'raw_orders', type: 'table', layer: 'bronze', label: 'raw.orders' },
    { id: 'order_rows', type: 'table', layer: 'bronze', label: 'raw.order_rows' },
    { id: 'stg_orders', type: 'sql-model', layer: 'silver', label: 'stg_orders' },
    { id: 'fct_sales', type: 'table', layer: 'gold', label: 'fct_sales' },
    { id: 'semantic_sales', type: 'semantic-model', layer: 'semantic', label: 'Sales model' },
    { id: 'report_sales', type: 'report', layer: 'report', label: 'Sales dashboard' }
  ],
  flows: [
    { from: 'raw_orders', to: 'stg_orders', label: 'normalize' },
    { from: 'order_rows', to: 'stg_orders', label: 'join keys' },
    { from: 'stg_orders', to: 'fct_sales', label: 'transform' },
    { from: 'fct_sales', to: 'semantic_sales', label: 'model' },
    { from: 'semantic_sales', to: 'report_sales', label: 'visualize' }
  ]
};

export const generatorExamples = [cloudFabricExample, starModelExample, lineageExample];
