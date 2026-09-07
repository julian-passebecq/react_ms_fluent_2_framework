# V4 Table Trace authoring guide

Table Trace is a bounded ConceptMotion semantic family for explaining **how rows, cells, columns and groups participate in a table transformation**. It is not a query engine, dataframe runtime, lineage engine or replacement for the existing Table, Join, Loop, Workflow, Diagram or Lineage families.

This guide describes the candidate shared V4 contract on `experiment/post-hardening-table-trace-consumer-v1`. It is backed by two independent consumer experiments:

- Formation: 9 authored traces covering filtering, sorting, grouping/aggregation, joins, ranking and QUALIFY.
- Visual Algorithms: 6 authored alternates covering ranking plus hash routing, shuffle, skew, repartition and coalesce.

Across those 15 consumer-authored traces, the generic relation grammar remained unchanged and no consumer needed bespoke SVG/D3/coordinate logic.

## When to use Table Trace

Use `table.trace` when the teaching question is primarily:

> **Which semantic rows/cells/groups are used, moved, mapped, dropped, created, derived or grouped to produce the result?**

Good fits:

| Concept | Why Table Trace helps |
| --- | --- |
| Filter / WHERE / QUALIFY | Learners can see which rows survive and which are dropped. |
| Stable sort / ORDER BY | Stable row identity can move from an input position to an output position. |
| GROUP BY / aggregation | Source rows can form semantic groups and feed derived output cells. |
| Join result provenance | Multiple input tables can contribute rows/cells to one output row. |
| Ranking | Input row identity remains visible while derived rank cells are produced. |
| Hash partition routing | Rows can visibly map from a source view to partition views/output state. |
| Shuffle / repartition / coalesce | Row movement is the concept; the trace can show the same identities crossing partition/state boundaries. |
| Pivot / reshape | Cell mappings can cross changed table shapes without a pivot-specific renderer. |

## When *not* to use Table Trace

Table Trace is deliberately not universal.

| Meaning | Prefer |
| --- | --- |
| Moving SQL `ROWS BETWEEN` frame | `table.transform` with `windowFrames`; the frame boundary is the semantic object. |
| Sorting/search algorithms, pointer movement, array mutation | `algorithm.loop` / `collection.flow`. |
| Retry, backfill, orchestration state | `workflow.run`. |
| DAG/topology/architecture | `workflow.topology` or `diagram.flow`. |
| Column/KPI/data lineage | `lineage.model`. |
| Join cardinality/fan-out as the primary concept | `table.join`. |
| Simple static before/after table state | `table.transform`. |
| Actual chart/KPI rendering | A consumer renderer; Table Trace is not a chart grammar. |
| Executing SQL, pandas, Polars or Spark | A real runtime outside this visual contract. |

The two-consumer evidence is intentionally stronger because these negative boundaries are tested. Do not select Table Trace merely because data happens to be tabular.

## Core contract

Import the language-neutral contract from `@conceptmotion/core`:

```ts
import {
  compileTableTrace,
  type TableTraceSpec,
} from '@conceptmotion/core';
```

A trace has:

- one or more `input` views;
- **exactly one** `output` view;
- zero or more named row groups;
- stable relation IDs;
- references to tables, rows, columns, cells or groups;
- only the six shared relation kinds below.

```ts
type TableTraceRelationKind =
  | 'use'
  | 'map'
  | 'drop'
  | 'create'
  | 'derive'
  | 'group';
```

### Relation meanings

| Relation | Contract shape | Meaning |
| --- | --- | --- |
| `use` | one or more `from`, no `to` | Read/inspect/participate without creating a direct output mapping. |
| `map` | one or more `from`, one or more `to` | Preserve or transfer semantic content/identity into another view. |
| `drop` | one or more `from`, no `to` | Explicitly remove semantic content from the result. |
| `create` | no `from`, one or more `to` | Produce output content that has no direct source reference in the authored explanation. |
| `derive` | one or more `from`, one or more `to` | Compute/derive output content from source references. |
| `group` | one or more `from`, exactly one group target | Form a named semantic group from source rows/cells. |

Do not invent operation-specific kinds such as `shuffle`, `rank`, `pivot`, `filter`, `join`, `aggregate`, `repartition` or `coalesce`. Those are lesson concepts expressed by combinations of the six relations.

## Minimal filter example

```ts
import type { TableData, TableTraceSpec } from '@conceptmotion/core';

const before: TableData = {
  id: 'orders',
  columns: [{ id: 'order' }, { id: 'status' }],
  rows: [
    { id: 'o1', values: { order: 'A', status: 'late' } },
    { id: 'o2', values: { order: 'B', status: 'ok' } },
  ],
};

const after: TableData = {
  ...before,
  rows: [before.rows[0]],
};

export const lateOrdersTrace: TableTraceSpec = {
  kind: 'table-trace',
  version: '1',
  id: 'late-orders',
  title: 'Keep late orders',
  views: [
    { id: 'before', role: 'input', table: before },
    { id: 'after', role: 'output', table: after },
  ],
  relations: [
    {
      id: 'read-status',
      kind: 'use',
      from: [
        { viewId: 'before', kind: 'column', columnId: 'status' },
      ],
    },
    {
      id: 'keep-o1',
      kind: 'map',
      from: [{ viewId: 'before', kind: 'row', rowId: 'o1' }],
      to: [{ viewId: 'after', kind: 'row', rowId: 'o1' }],
    },
    {
      id: 'drop-o2',
      kind: 'drop',
      from: [{ viewId: 'before', kind: 'row', rowId: 'o2' }],
    },
  ],
};

compileTableTrace(lateOrdersTrace);
```

`compileTableTrace` validates references and produces both:

- view-scoped reference keys such as `trace:before:row:o1`;
- underlying semantic entity IDs such as `orders:row:o1`.

This distinction lets a renderer show the same semantic row in two views while preserving identity.

## Multiple inputs and join provenance

A trace may contain multiple input views and one output view. This is useful when the teaching point is output-row provenance rather than join cardinality itself.

```ts
{
  id: 'emit-customer-order',
  kind: 'derive',
  from: [
    { viewId: 'customers', kind: 'row', rowId: 'c1' },
    { viewId: 'orders', kind: 'row', rowId: 'o10' },
  ],
  to: [
    { viewId: 'result', kind: 'row', rowId: 'c1-o10' },
  ],
}
```

If fan-out/cardinality is the lesson, keep using `table.join`. Table Trace is an alternate lens only when source-to-output participation is the clearer explanation.

## GROUP BY and aggregation

Groups are semantic, view-scoped row collections. They are not layout coordinates.

```ts
const trace: TableTraceSpec = {
  kind: 'table-trace', version: '1', id: 'sum-by-customer', title: 'Sum by customer',
  views: [
    { id: 'detail', role: 'input', table: detail },
    { id: 'summary', role: 'output', table: summary },
  ],
  groups: [
    { id: 'customer-a', viewId: 'detail', rowIds: ['o1', 'o3'], label: 'customer = A' },
  ],
  relations: [
    {
      id: 'group-a', kind: 'group',
      from: [
        { viewId: 'detail', kind: 'row', rowId: 'o1' },
        { viewId: 'detail', kind: 'row', rowId: 'o3' },
      ],
      to: [{ viewId: 'detail', kind: 'group', groupId: 'customer-a' }],
    },
    {
      id: 'sum-a', kind: 'derive',
      from: [
        { viewId: 'detail', kind: 'cell', rowId: 'o1', columnId: 'amount' },
        { viewId: 'detail', kind: 'cell', rowId: 'o3', columnId: 'amount' },
      ],
      to: [{ viewId: 'summary', kind: 'cell', rowId: 'A', columnId: 'total' }],
    },
  ],
};
```

## Ranking and derived cells

Ranking usually preserves row identity while adding a derived value. Prefer a row `map` plus a cell `derive` rather than an invented ranking renderer.

```ts
[
  {
    id: 'keep-row-a', kind: 'map',
    from: [{ viewId: 'ordered', kind: 'row', rowId: 'a' }],
    to: [{ viewId: 'ranked', kind: 'row', rowId: 'a' }],
  },
  {
    id: 'rank-a', kind: 'derive',
    from: [{ viewId: 'ordered', kind: 'row', rowId: 'a' }],
    to: [{ viewId: 'ranked', kind: 'cell', rowId: 'a', columnId: 'rank' }],
  },
]
```

Use `table.transform` + `windowFrames` instead when the moving frame boundary is the concept, for example `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW`.

## Distributed row movement

Shuffle, repartition, coalesce and hash routing are not special renderer families. Model partitions as semantic views/tables and map the same stable row IDs across them.

The visual should communicate row/state movement, not claim to simulate a Spark runtime. Do not infer network traffic, partitioner internals, task scheduling, adaptive execution or physical plans unless those facts are explicitly authored from a source-backed fixture.

## Frames and explanation

The SVG scene layer adds optional teaching frames:

```ts
import type { TableTraceSvgSceneSpec } from '@conceptmotion/svg';

const scene: TableTraceSvgSceneSpec = {
  ...lateOrdersTrace,
  frames: [
    { id: 'inspect', activeRelationIds: ['read-status'], caption: 'Read the status.' },
    { id: 'result', activeRelationIds: ['keep-o1', 'drop-o2'], caption: 'Keep or drop each row.' },
  ],
};
```

`activeRelationIds` select authored semantic relations. They are not DOM selectors. The renderer derives motion from semantic element identity and previous/current geometry.

Attach the existing `ExplanationTrack` when synchronized prose/state/code focus is useful. Explanation refs must still resolve through the existing guarded scene contract.

## Motion and reduced motion

The shared renderer may animate semantic row/cell travel when geometry changes. Consumers do not author pixel coordinates or animation keyframes.

- Normal mode: semantic travel may use Web Animations.
- Reduced motion: the same final semantic state is rendered without travel tokens/animation.
- Freeze/export: output is deterministic and excludes transient animation styles.

A consumer should test both motion paths when row movement is central to the lesson.

## Figure envelope

Wrap the scene in the normal `FigureSpec`:

```ts
import type { FigureSpec, JsonValue } from '@datapass/content';

const figure: FigureSpec = {
  id: 'late-orders-trace',
  kind: 'table',
  rendererId: 'table.trace',
  title: 'Keep late orders',
  spec: JSON.parse(JSON.stringify(scene)) as JsonValue,
  fallbackText: 'Rows with status late remain; other rows are dropped.',
  profile: 'professional',
};
```

Render with `FigureView` / `FigurePlayer`; do not bypass the shared Figure chrome in a consumer merely to access Table Trace.

## Renderer extension without central-registry edits

`@conceptmotion/svg` now supports additive family registrars:

```ts
import {
  createDefaultRendererRegistry,
  type RendererFamilyRegistrar,
} from '@conceptmotion/svg';

const registerExperimentalFamily: RendererFamilyRegistrar = registry => {
  registry.register({
    id: 'consumer.example',
    family: 'consumer',
    create: () => new ConsumerRenderer(),
  });
};

const registry = createDefaultRendererRegistry([registerExperimentalFamily]);
```

This is for testing/consumer extensions. It does **not** turn arbitrary new semantic scene kinds into built-ins. A new built-in scene grammar still requires explicit schema/compiler/resolver/reduced-motion/accessibility/export evidence.

## Accessibility QA contract

External apps generated by `@datapass/scaffold` receive `tests/browser/a11y.ts` with the V4 browser audit contract:

- every application control remains in Axe;
- only Fluent/Tabster `[data-tabster-dummy]` focus sentinels are excluded;
- each excluded node is verified as the expected `i[role="none"][aria-hidden="true"]` infrastructure;
- serious/critical Axe findings remain blocking;
- page-level horizontal overflow remains blocking;
- consumers can assert that a dynamic Figure/lens change does not increase the sentinel count.

Do not widen the exclusion selector.

## External consumer pin rule

For generated independent consumers, `datapass.json` is the **only** framework commit source of truth. `framework:bootstrap`, `framework:verify` and `release:gate` read it directly. Do not copy the SHA into a second verifier script.

This rule exists because the Visual Algorithms experiment exposed a stale duplicated SHA during bootstrap even though the manifest had been updated correctly.

## Validation commands

From `project/conceptmotion_studio`:

```sh
pnpm exec vitest run \
  packages/core/tests/table-trace.test.ts \
  packages/svg/tests/table-trace.test.ts \
  packages/svg/tests/table-trace-a11y.test.ts \
  packages/svg/tests/renderers.test.ts \
  packages/figure/tests/table-trace.test.tsx \
  packages/figure/tests/registry.test.tsx \
  packages/scaffold/tests/external.test.ts

pnpm typecheck
pnpm test:scaffold
pnpm test:external-consumer
```

Before promotion to `main`, run the repository's existing full CI/release tree on the exact final commit. Do not weaken existing tests to accommodate this renderer.

## Current promotion status

The semantic renderer has strong cross-consumer evidence, but this branch is still an **integration/promotion candidate**, not permission to repin all V4 consumers or merge framework `main` silently.

The remaining promotion decision is release governance, not a need for more SQL/distributed renderer families.
