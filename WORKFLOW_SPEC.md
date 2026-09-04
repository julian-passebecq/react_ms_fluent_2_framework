# WorkflowSpec — semantic contract for DAG / pipeline scenes

This is a design contract for Codex to implement/refine in pure TypeScript. Names may change if migrations/tests justify it, but preserve the semantics and provider independence.

## Core shape

Human-readable workflow labels may use the shared EN/NO-compatible shape while IDs/provider types remain locale-neutral.

```ts
type LocalizedText = string | Partial<Record<'en' | 'no', string>>;

type WorkflowSpec = {
  kind: 'workflow';
  version: string;
  id: string;
  title: LocalizedText;
  description?: LocalizedText;
  preset?: 'generic' | 'airflow' | 'fabric-data-factory' | 'azure-data-factory' | 'databricks-lakeflow';
  layout?: {
    direction?: 'lr' | 'tb';
    density?: 'compact' | 'comfortable';
  };
  schedule?: {
    kind?: 'manual' | 'cron' | 'interval' | 'event';
    expression?: string;
    label?: LocalizedText;
  };
  parameters?: Record<string, unknown>;
  groups?: WorkflowGroup[];
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  runs?: WorkflowRun[];
  overlays?: WorkflowOverlay[];
};
```

## Node

```ts
type WorkflowNode = {
  id: string;
  label: LocalizedText;
  taskType?: string;
  providerType?: string;
  groupId?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
  ports?: Array<{ id: string; side?: 'left'|'right'|'top'|'bottom'; role?: string }>;
};
```

Examples of semantic `taskType` values:

- `copy`
- `notebook`
- `sql`
- `python`
- `pyspark`
- `dbt`
- `pipeline`
- `dataflow`
- `branch`
- `foreach`
- `condition`
- `wait`
- `notify`
- `generic`

Do not make these provider package names part of the core type system; `providerType` may preserve original vocabulary.

## Group / nested container

```ts
type WorkflowGroup = {
  id: string;
  label: LocalizedText;
  kind?: 'group' | 'foreach' | 'condition' | 'switch' | 'until' | 'task-group';
  parentId?: string;
  childNodeIds?: string[];
  childGroupIds?: string[];
  metadata?: Record<string, unknown>;
};
```

## Edge

```ts
type WorkflowEdge = {
  id?: string;
  from: string;
  to: string;
  condition?: 'dependency' | 'success' | 'failure' | 'completion' | 'skip' | 'true' | 'false';
  label?: LocalizedText;
  dataFlowKind?: 'none' | 'data' | 'batch' | 'stream' | 'cdc' | 'lineage';
  metadata?: Record<string, unknown>;
};
```

`condition` describes orchestration/control dependency. `dataFlowKind` is an optional overlay and must not erase the distinction between control and data movement.

## Simulated run

```ts
type WorkflowRun = {
  id: string;
  label?: LocalizedText;
  startedAt?: string;
  frames: Array<{
    id: string;
    at?: number;
    states: Record<string, {
      status: 'pending' | 'queued' | 'running' | 'success' | 'failed' | 'retrying' | 'skipped' | 'upstream_failed';
      attempt?: number;
      durationMs?: number;
      message?: LocalizedText;
    }>;
  }>;
};
```

The simulator replays declared semantic state. It does not infer a production scheduler.

## Overlays

Optional pedagogical overlays may describe:

- assets produced/consumed;
- lineage;
- data-flow path;
- warnings;
- annotations.

Use stable IDs and semantic targets.

## Validation invariants

- every node ID is unique;
- every edge endpoint resolves;
- every group child resolves;
- no node belongs to two incompatible exclusive groups;
- run state keys resolve to nodes/groups;
- layout is deterministic for identical spec + layout version;
- reduced-motion view still exposes the complete current semantic state.
