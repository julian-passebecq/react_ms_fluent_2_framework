# Gold-standard scenes and surfaces for Foundation v1.1

These are architecture tests. Each must be polished enough to demonstrate reusable primitives, not one-off SVG hacks.

## 1. Table filter + sort

**Goal:** show stable row identity.

Required:

- rows have persistent IDs;
- filter visually removes/nonselects rows;
- sort physically reorders surviving rows;
- no full-frame visual reset between steps;
- source and output state are understandable;
- accessible text/table fallback.

## 2. Join fan-out

**Goal:** show why one-to-many joins multiply rows.

Required:

- left/right tables;
- current join keys highlighted;
- result rows created with stable IDs;
- source lineage into result rows;
- LEFT join null-extension example;
- play/step and static final state.

## 3. Programming loop

Example: loop through an array and accumulate/filter values.

Required:

- current code line highlight;
- current array index/pointer;
- variable/state inspector;
- iteration count;
- deterministic next/previous step.

## 4. Statistics / ML

Recommended v1.1 choice: linear regression residuals or gradient descent.

Required:

- direct manipulation of one meaningful parameter;
- visual explanation of consequence;
- avoid generic decorative chart animation;
- explanatory annotation/takeaway.

## 5. Cloud/data pipeline

Default topology:

```text
Source -> Bronze -> Silver -> Gold -> BI
                 ^
              Orchestrator
```

Required:

- reusable nodes/containers/ports/edges;
- switchable flow modes: batch / stream / CDC;
- control flow distinct from data flow;
- failure/error state and recovery/retry example;
- active path focus;
- fallback generic icons.

## 6. Data model / lineage

Required:

- fact/dimension semantics not color-only;
- ports/anchors;
- deterministic layout;
- relationship/cardinality labels where relevant;
- lineage or filter-direction focus mode;
- readable static export.

## 7. Airflow-style DAG run explanation

Use the generic WorkflowSpec with `airflow` preset.

Required:

- task dependencies;
- TaskGroup/nested grouping;
- run selector or at least two deterministic run examples;
- queued/running/success/failed/retrying/skipped/upstream-failed state support;
- selected task inspector;
- retry path visually explained;
- static final/current-frame export.

## 8. Fabric/ADF-style pipeline explanation

Use the same WorkflowSpec with Fabric/ADF preset.

Required:

- activity nodes and dependency connectors;
- success/failure/completion/skip semantics not color-only;
- nested ForEach or If/Condition container;
- breadcrumb/focus into nested container;
- selected activity inspector;
- simulated run with at least one alternate/failure path.

## 9. Lakeflow-oriented workflow preset

Do not create a separate engine. Demonstrate the same semantic workflow model rendered with a Databricks Lakeflow-oriented presentation:

- notebook / pipeline / dbt or SQL task types;
- dependency graph;
- branch or for-each representation;
- runtime/task metadata in inspector.

This can reuse the same underlying workflow fixture as another provider where sensible.

## 10. Challenge Workbench integration demo

One challenge must demonstrate the full progressive-disclosure interaction:

- Description + Monaco Code initially;
- Visualize loads a ConceptMotion scene;
- Hint stepper;
- Reveal Solution;
- Compare opens Monaco diff;
- local draft + mastered/flag state;
- no runtime execution.

Recommended challenge: CROSS JOIN or ROW_NUMBER because the visual explanation is obvious.

## Optional stretch scenes

- BFS/DFS graph traversal;
- window frame (`ROWS BETWEEN`) animation;
- Airflow Grid-like multi-run state matrix;
- asset/data lineage overlay on orchestration graph;
- SCD2 timeline.

## 11. Bilingual shell proof

Demonstrate the shared EN/NO application chrome on at least one Studio surface.

Required:

- compact toggle;
- persistence;
- English fallback for untranslated content;
- code/identifiers unchanged;
- toggle can be hidden on an English-only Challenge page.

## 12. Renderer-neutral figure proof

Demonstrate that `FigureFrame` / `VisualizationSurface` can host a simple non-ConceptMotion placeholder/custom renderer without changing the page composition.

This does NOT require importing or implementing the D3 SDK v2. A small local static/SVG renderer is sufficient to prove the contract.


## 13. Knowledge Atlas proof

Required:

- compact documentation navigation and On-this-page/equivalent navigation;
- original concise technical article;
- official source link(s);
- feature/product status and version metadata;
- `verifiedAt` / freshness state;
- one embedded ConceptMotion figure through `FigureFrame`;
- local EN/NO content fallback;
- one fixture ChangeEvent that marks the page/figure as needs-review through stable feature IDs.

No network fetch is required or allowed for the demo.

## 14. Column-level lineage proof

Use manually supplied parser-like JSON. Do not implement a SQL parser.

Required:

- stable table and column IDs;
- source-column to target/derived-column edges;
- optional expression/transformation label;
- selectable upstream/downstream focus;
- readable static state/export.
