# ConceptMotion Table Trace V1

**Status:** experimental branch proof; not merged into the pinned V4 baseline  
**Branch:** `conceptmotion-table-trace-v1`  
**Base:** `ce8353ee0878ca74b2fe24a1af7de657a6ba61f2`  
**Date:** 2026-09-06  
**Implementing model:** GPT-5.6 Sol

## Why this exists

`table.transform` already preserves stable rows through filtering and sorting, and `table.join` already teaches join fan-out, NULL extension and source/result lineage. The missing educational primitive was a language-neutral way to show **which rows, columns and cells were used, preserved, removed, created, grouped or derived between an input and an output table**.

That problem appears in pandas, SQL, Polars, Spark and dataframe teaching. It should not require a renderer per language.

Table Trace introduces one semantic family:

`table.trace`

The family is deliberately based on **semantic references and relations**, not authored SVG coordinates.

## Inspiration, not copied implementation

The design was informed by public educational visualization work, especially:

- Pandas Tutor / Tidy Data Tutor / SQL Tutor: Sam Lau, Sean Kross, Eugene Wu and Philip J. Guo, *Teaching Data Science by Visualizing Data Table Transformations* (DataEd 2023).
- Pandas Tutor source: `SamLau95/pandas_tutor`.
- SQL Tutor source: `cudbg/sqltutor`.
- Data Tweening: incremental visualization of data transforms.
- Datamations: animated explanations of data-analysis pipelines.

No source UI or implementation code from those projects is copied here. The reusable ConceptMotion contracts, renderer and fixtures are newly authored against the existing Datapass semantic architecture.

## Semantic contract

A trace contains one or more input views and exactly one output view.

A reference points to a semantic object inside a view:

- `table`
- `row`
- `column`
- `cell`
- `group`

A relation explains what happened:

- `use` — data was inspected to decide/compute something.
- `map` — source data corresponds directly to target data.
- `drop` — source data is intentionally absent from the result.
- `create` — target data has no direct source identity.
- `derive` — one or more source entities produce one or more target entities.
- `group` — source entities become members of an educational grouping.

The core compiler validates view, row, column, cell and group references before rendering.

### Identity model

Table Trace exposes two identity spaces intentionally:

1. **View-scoped reference key** — e.g. `trace:before:row:o1`; this lets the renderer address the before and after visual copies independently.
2. **Underlying semantic entity ID** — e.g. `orders:row:o1`; this remains the same when the same table row survives across views.

This preserves ConceptMotion's stable semantic identity without forcing before/after layouts to share one DOM node.

## Minimal JSON example

```json
{
  "id": "figure.filter-late",
  "kind": "concept",
  "rendererId": "table.trace",
  "title": "Filter late orders",
  "fallbackText": "Status cells are tested; matching rows survive.",
  "spec": {
    "kind": "table-trace",
    "version": "1",
    "id": "filter-late",
    "title": "Filter late orders",
    "views": [
      {
        "id": "before",
        "role": "input",
        "table": {
          "id": "orders",
          "columns": [{ "id": "status" }],
          "rows": [
            { "id": "o1", "values": { "status": "late" } },
            { "id": "o2", "values": { "status": "ok" } }
          ]
        }
      },
      {
        "id": "after",
        "role": "output",
        "table": {
          "id": "orders",
          "columns": [{ "id": "status" }],
          "rows": [
            { "id": "o1", "values": { "status": "late" } }
          ]
        }
      }
    ],
    "relations": [
      {
        "id": "predicate",
        "kind": "use",
        "from": [
          { "viewId": "before", "kind": "cell", "rowId": "o1", "columnId": "status" },
          { "viewId": "before", "kind": "cell", "rowId": "o2", "columnId": "status" }
        ]
      },
      {
        "id": "keep-o1",
        "kind": "map",
        "from": [{ "viewId": "before", "kind": "row", "rowId": "o1" }],
        "to": [{ "viewId": "after", "kind": "row", "rowId": "o1" }]
      },
      {
        "id": "drop-o2",
        "kind": "drop",
        "from": [{ "viewId": "before", "kind": "row", "rowId": "o2" }]
      }
    ],
    "frames": [
      { "id": "predicate", "activeRelationIds": ["predicate"] },
      { "id": "result", "activeRelationIds": ["keep-o1", "drop-o2"] }
    ]
  }
}
```

The existing Visual Sandbox can load/edit this family as ordinary Figure JSON. No executable code is accepted or evaluated.

## Renderer behavior

The renderer currently provides:

- one or more input tables on the left and one output table on the right;
- row, column and cell semantic focus;
- correspondence arrows for `map`, `derive` and `group` relations;
- distinct non-text color semantics for use/drop/create/lineage/group states;
- selectable semantic nodes and accessible Figure fallback through the existing renderer stack;
- frame-based relation focus;
- stable keyed DOM identity across frame updates;
- reduced-motion compatibility;
- compact teaching views that prioritize referenced rows/columns instead of attempting to display a full large dataset.

The Visual Sandbox rejects traces exceeding 10,000 table cells across all views. This is an authoring/preview safety budget, not a claim that production dataframe engines should be limited to small data.

## Grammar proof

The branch tests prove that the same contract can express:

1. filter — predicate cells are `use`; surviving rows `map`; rejected rows `drop`;
2. sort — each stable row `map`s from its old display order to its new order;
3. group + aggregate — rows form a `group`; source measure cells `derive` an aggregate cell;
4. pivot / reshape — source cells `map` into a changed output row/column shape;
5. join — two input tables can jointly `derive` an output row.

These are semantic proofs, not runtime pandas/SQL execution.

## Deliberate non-goals for this branch

This branch does **not** add:

- Pyodide or pandas execution;
- a SQL engine or query optimizer;
- Spark execution;
- automatic code instrumentation;
- a new Git renderer;
- a general graph editor;
- authored SVG coordinates;
- another animation framework;
- consumer-specific content changes.

Future runtime adapters may emit the same trace contract, but they are downstream of the visual language rather than prerequisites for it.

## Known gaps / next evidence

### Motion choreography

V1 is primarily a before/after correspondence renderer with semantic frame focus. Existing keyed transforms preserve DOM continuity, but `map` and `derive` do not yet produce a full Data-Tweening-style flight/ghost animation between source and target tables. A later focused pass should test a reusable relation-motion cue without adding authored coordinates.

### Groups

Rows participating in `group` relations are individually highlighted. The current optional group outline is most truthful when grouped rows are contiguous in the compact view; richer non-contiguous group-bracketing should be treated as a renderer refinement, not a semantic change.

### Rich dataframe metadata

V1 references table/row/column/cell/group. It intentionally does not yet model pandas-specific MultiIndex levels, Series objects or scalar values. Add those only if real course material demonstrates that the generic table grammar cannot explain a required operation cleanly.

### FigureSpec typing friction

`FigureSpec.spec` is intentionally generic `JsonValue`. Strong TypeScript scene types therefore need an explicit serialization/cast boundary when inserted into a Figure fixture. JSON authoring itself works. A future authoring helper could reduce this TypeScript friction without weakening the generic content envelope.

### Runtime trace generation

The first useful adapter experiment would likely be a bounded offline pandas/Polars/SQL trace generator that produces `TableTraceSpec`. Do not add it until the authored trace family has been validated in real lessons.

## Branch gate

During development the branch uses a temporary branch-only workflow to run:

- frozen dependency install;
- Table Trace core semantic tests;
- SVG registry/renderer tests;
- Figure adapter tests;
- Visual Sandbox tests;
- TypeScript project references;
- production Studio build / bundle check before branch handoff.

The temporary workflow is removed before this branch is considered ready for integration. The verified workflow runs remain in GitHub Actions history.

## Integration note

The repository `main` branch moved beyond the V4 pin while this experiment was being developed. This branch intentionally remains based on `ce8353ee...`; it must not be silently rebased or merged over newer framework work. Integrating Table Trace into a later framework line should be a deliberate conflict-resolution pass after reviewing the newer renderer families and authoring changes.
