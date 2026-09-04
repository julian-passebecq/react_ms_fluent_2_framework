import type { ViewId } from '../App';

export type CatalogCategory = 'semantics' | 'workflow' | 'learning' | 'knowledge';

export interface CatalogItem {
  id: string;
  title: { en: string; no?: string };
  summary: { en: string; no?: string };
  category: CatalogCategory;
  surface: string;
  status: 'live' | 'foundation';
  target: ViewId;
  tags: string[];
}

export const catalogItems: CatalogItem[] = [
  {
    id: 'table-filter-sort',
    title: { en: 'Table filter + sort', no: 'Tabellfilter + sortering' },
    summary: { en: 'Track the same order rows as a predicate removes records and sorting changes position.', no: 'Følg de samme radene gjennom filtrering og ny sorteringsrekkefølge.' },
    category: 'semantics', surface: 'Workbench', status: 'live', target: 'workbench', tags: ['table', 'filter', 'sort', 'stable identity'],
  },
  {
    id: 'join-fanout',
    title: { en: 'Join fan-out', no: 'Join med fan-out' },
    summary: { en: 'See one customer key create multiple result rows while source identity remains visible.' },
    category: 'semantics', surface: 'Explainer', status: 'live', target: 'explainers', tags: ['sql', 'join', 'lineage'],
  },
  {
    id: 'loop-state',
    title: { en: 'Loop state', no: 'Løkketilstand' },
    summary: { en: 'Synchronize the current code line, array pointer, accumulator and iteration count.' },
    category: 'learning', surface: 'Explainer', status: 'live', target: 'explainers', tags: ['python', 'loop', 'pointer'],
  },
  {
    id: 'regression-residuals',
    title: { en: 'Regression residuals', no: 'Regresjonsresidualer' },
    summary: { en: 'Move the slope and observe how residual error changes.' },
    category: 'learning', surface: 'Explainer', status: 'live', target: 'explainers', tags: ['statistics', 'ml', 'regression'],
  },
  {
    id: 'medallion-flow',
    title: { en: 'Medallion data flow', no: 'Medaljong-dataflyt' },
    summary: { en: 'Distinguish batch, stream, CDC, control and failure paths without relying on color.' },
    category: 'semantics', surface: 'Explainer', status: 'live', target: 'explainers', tags: ['fabric', 'pipeline', 'stream', 'cdc'],
  },
  {
    id: 'model-lineage',
    title: { en: 'Model + lineage', no: 'Modell + dataopprinnelse' },
    summary: { en: 'Reusable nodes, ports and routed edges reveal table and column dependencies.' },
    category: 'semantics', surface: 'Explainer', status: 'live', target: 'explainers', tags: ['model', 'lineage', 'columns'],
  },
  {
    id: 'workflow-airflow',
    title: { en: 'Airflow-oriented DAG', no: 'Airflow-orientert DAG' },
    summary: { en: 'A generic WorkflowSpec shown with task-group and retry-oriented presentation.' },
    category: 'workflow', surface: 'Workflow', status: 'live', target: 'workflow', tags: ['airflow', 'dag', 'retry'],
  },
  {
    id: 'workflow-fabric',
    title: { en: 'Fabric / ADF pipeline', no: 'Fabric / ADF-pipeline' },
    summary: { en: 'The same workflow engine with activity, condition and dependency semantics.' },
    category: 'workflow', surface: 'Workflow', status: 'live', target: 'workflow', tags: ['fabric', 'adf', 'foreach'],
  },
  {
    id: 'workflow-lakeflow',
    title: { en: 'Lakeflow-oriented job', no: 'Lakeflow-orientert jobb' },
    summary: { en: 'The same topology and run state with notebook, SQL and dbt task emphasis.' },
    category: 'workflow', surface: 'Workflow', status: 'live', target: 'workflow', tags: ['databricks', 'lakeflow', 'notebook'],
  },
  {
    id: 'workflow-playground',
    title: { en: 'Workflow spec playground', no: 'Arbeidsflyt-spesifikasjon' },
    summary: { en: 'Edit validated JSON in Monaco and preview only valid semantic specs.' },
    category: 'workflow', surface: 'Workbench', status: 'live', target: 'workflow', tags: ['json', 'monaco', 'validation'],
  },
  {
    id: 'challenge-latest-order',
    title: { en: 'Latest order per customer', no: 'Siste ordre per kunde' },
    summary: { en: 'A SQL window challenge with progressive hints, visual explanation and diff.' },
    category: 'learning', surface: 'Challenge', status: 'live', target: 'challenge', tags: ['sql', 'row_number', 'challenge'],
  },
  {
    id: 'knowledge-runtime',
    title: { en: 'Fabric runtime mental model', no: 'Mental modell for Fabric-kjøretid' },
    summary: { en: 'Source-linked, bilingual-ready guidance with explicit freshness and version state.' },
    category: 'knowledge', surface: 'Knowledge Atlas', status: 'live', target: 'knowledge', tags: ['fabric', 'runtime', 'sources'],
  },
  {
    id: 'change-impact',
    title: { en: 'Deterministic change impact', no: 'Deterministisk endringspåvirkning' },
    summary: { en: 'A local ChangeEvent marks dependent content for review through stable feature IDs.' },
    category: 'knowledge', surface: 'Knowledge Atlas', status: 'live', target: 'knowledge', tags: ['change', 'impact', 'feature id'],
  },
  {
    id: 'column-lineage',
    title: { en: 'Column lineage fixture', no: 'Kolonnelinje-fixture' },
    summary: { en: 'Manual parser-like JSON maps source columns to derived targets without a SQL parser.' },
    category: 'knowledge', surface: 'Explainer', status: 'live', target: 'explainers', tags: ['sql', 'column lineage', 'fixture'],
  },
  {
    id: 'renderer-neutral',
    title: { en: 'Renderer-neutral figure', no: 'Renderernøytral figur' },
    summary: { en: 'The shared figure frame hosts ConceptMotion today and any future chart renderer later.' },
    category: 'semantics', surface: 'Foundation', status: 'foundation', target: 'catalog', tags: ['figure frame', 'charts', 'extension'],
  },
];
