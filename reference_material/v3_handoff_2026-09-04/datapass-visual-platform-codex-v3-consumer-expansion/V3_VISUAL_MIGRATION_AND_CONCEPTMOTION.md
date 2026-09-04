# V3 visual migration and ConceptMotion expansion

## Why this is a V3 priority

The user's existing sites already contain many good custom visual explanations. The failure mode would be to rebuild those explanations again in every new app. V3 should convert the most reusable **meaning** into shared ConceptMotion/Figure specs.

## Read-only sources

### `julian-passebecq/leetcodedataeng`

Existing scene families include scan, binary search, hash/frequency, dedupe, stack/queue, batching, sort, two pointers, sliding window, prefix sum, heap/Top K, BFS, topological order, intervals, SQL ranking/latest-row, joins, partition pruning, medallion flow and Git states.

### `julian-passebecq/mlweb`

Visual mental models include linear/logistic regression, decision tree, random forest, gradient boosting, k-NN, SVM, K-Means, PCA, neural networks, leakage and an ML system pipeline.

### legacy ConceptMotion

V2 preserves 186 concepts / 36 live scenes / 28 historical renderer families. Treat this as a behavioral/reference inventory, not a mandate to port everything.

## V3 migration target

Migrate **20–30 high-value concepts** into the shared semantic/Figure system and use them in at least two consumers where plausible.

Priority set:

### SQL / tabular
- filter / WHERE
- inner/left/full joins
- group by
- window partition/order/rank
- latest-row dedupe
- QUALIFY
- grain/cardinality
- SCD2 or CDC state change

### Python / algorithms
- linear scan
- binary search
- hash map/frequency
- stack vs queue
- two pointers
- sliding window
- prefix sum
- stable sort
- heap Top K
- BFS
- topological ordering
- interval merge

### Data engineering
- batching
- partition pruning
- Bronze → Silver → Gold
- retry/idempotency
- DAG ready/running/success state

### ML/stats (selected)
- regression
- logistic boundary
- decision split/tree path
- k-means iterations
- PCA projection or leakage pipeline

## Migration classification report

For each candidate classify:

- **A — existing family**: express with an existing semantic spec/renderer;
- **B — extend generic family**: small additive semantics to an existing family;
- **C — new generic family**: justified only if >=4 concepts reuse it;
- **D — app-specific/defer**: keep in consumer or defer to future chart/GeoStory work.

Return this matrix as `V3_VISUAL_MIGRATION_REPORT.md`.

## New renderer budget

Add **no more than two new generic semantic renderer families** in V3 unless a documented blocker proves more are necessary.

Candidates only if needed:

- a generic sequence/pointer/range trace family for scans, windows, two pointers, sort and prefix-sum behavior;
- a generic graph traversal/state family for BFS/topological/DAG behavior.

Before adding either, inspect whether current loop/diagram/workflow semantics can be extended cleanly instead.

## Controls

Shared interactive explanations should consistently support the relevant subset of:

- Play/Pause
- Previous/Next
- Reset
- direct step selection/scrub when useful
- speed
- active explanation
- reduced motion/static state

Do not force playback controls onto static figures.
