# Roadmap — renderer-first expansion

The catalogue is intentionally broader than the live implementation. Expand by **renderer reuse**, not by writing one JavaScript animation per catalogue item.

## P0 — engineering stabilization

- Install dependencies and commit lockfile.
- Full Vite build.
- Browser smoke test every live scene.
- Split renderer registry into modules.
- Strict development-time scene validation.
- Migrate bundled scenes to canonical v1 `data` shape or formally version compatibility.
- Convert join source/result rows and match links to keyed transitions; optionally support an explicit output projection per scene.
- Catalogue concept deep links now exist; add shareable storyboard/frame deep links and restore frame state from URL.
- Add error boundary around main app sections.

## P1 — next high-reuse renderer grammars

### 1. Table transformation renderer

Target concepts:

- pandas/SQL/PySpark filtering
- SELECT/project
- GROUP BY
- dedup
- LAG/LEAD
- running totals
- pivot/melt
- SCD1 merge

State vocabulary:

```text
rowOrder
visibleRows
selectedColumns
activeRows
outputRows
groups
aggregates
cursor
operation
```

### 2. Window-frame comparison renderer

Target:

- ROWS vs RANGE
- peers/ties
- UNBOUNDED PRECEDING
- moving frame
- running total

### 3. Join algorithm renderer

Separate relational join *semantics* from physical join *algorithms*.

Target:

- hash join: build → buckets → probe
- merge join: sorted cursors advance together
- nested loop: outer row → indexed inner seek

### 4. Index/query-plan renderer

Target:

- scan vs seek
- composite index leftmost-prefix idea
- covering index lookup avoidance
- sargability
- cardinality/selectivity errors
- sort/spill/exchange

### 5. DAX evaluation renderer

Target:

- row context
- filter context
- CALCULATE add/replace/remove
- context transition
- SUMX iterator
- relationship propagation
- active/inactive relationships
- storage engine vs formula engine mental model

Use SQLBI/Microsoft as accuracy references.

### 6. DAG runtime renderer

Target:

- trigger rules
- branch/skipped states
- retries/backoff
- pool/concurrency slots
- sensors/deferral
- catchup/backfill
- root-cause failure propagation

### 7. Storage renderer

Target:

- Parquet file → row groups → column chunks → pages
- column pruning
- row-group/page skipping
- partition pruning
- small-file compaction
- Delta log/snapshot
- Iceberg manifests/metadata

### 8. Statistics renderer

Target:

- mean/median/outlier effect
- variance/std
- distribution shape
- confidence interval
- p-value sampling distribution
- Type I/II + power
- bootstrap
- A/B test
- Bayesian update

### 9. ML renderer families

Target:

- gradient boosting residual corrections
- KNN neighborhood
- SVM margin
- Naive Bayes evidence update
- neural forward/loss/backward/update
- threshold precision/recall tradeoff

## P2 — learning paths

Create curated paths without removing full catalogue scope:

### Analyst / BI core

SQL joins → group/window → star schema → DAX context → KPI → Power BI performance.

### Data engineer core

Partition/shuffle → join algorithms → Parquet → Delta/Iceberg → idempotency → watermark → Airflow runtime → observability.

### Interview algorithms core

Hash lookup → binary search → two pointers → sliding window → heap/top-K → BFS/DFS → topological sort → sorting tradeoffs.

### Statistics / ML core

Distribution → sampling/CLT → CI/p-value → regression → trees/ensembles → clustering/PCA → evaluation/thresholds.

## P3 — authoring/productization

- JSON scene editor with validation.
- Copy/export scene spec.
- npm package boundary.
- React adapter package.
- Python package validation and examples.
- SVG/PNG export.
- Optional storyboard video/GIF export.
- Embed mode for other sites.
