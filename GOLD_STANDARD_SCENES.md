# Gold-standard scenes for v1

These scenes are the architecture tests. Each must be polished enough to demonstrate a reusable primitive family.

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

Recommended v1 choice: linear regression residuals or gradient descent.

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

## Optional stretch scenes

- BFS/DFS graph traversal;
- DAG queued -> running -> failed -> retry -> success;
- window function / ROW_NUMBER partition visualization.
