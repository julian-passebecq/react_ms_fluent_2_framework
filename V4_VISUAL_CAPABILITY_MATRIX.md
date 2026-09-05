# V4 visual explanation capability matrix

Baseline: `4f40870dec06780ed6c0b15d7a52315ecd39c702`. The six independent consumer repositories are unchanged.

The approved, production-ready variants are exported from `@datapass/canonical/explanations` as `visualExplanationFigures` and `visualExplanationFigure(id)`. Existing concept IDs and source item IDs are reused. The original 30-scene migration corpus remains byte-compatible in its existing export; consumers explicitly choose the richer teaching variants. They are not additional copies of the source corpus.

| Requested proof | Canonical example ID | Shared family | Visible behavior |
| --- | --- | --- | --- |
| INNER JOIN | `sql-inner-join` | Existing `table.join` | Probe the two source rows, then emit each pair; focused lineage and emitted count change together. |
| LEFT JOIN | `sql-left-join` | Existing `table.join` | Unmatched `o4` remains on the left, then creates `o4 × NULL` with a NULL-EXTENDED badge and one contributor edge. |
| Grain/cardinality | `sql-grain` | Existing `table.join` | Two A orders pair with two A dimension versions, creating four distinct result identities; B adds one more. |
| GROUP BY | `sql-group` | New generic `collection.flow` | Four detail rows move to customer containers, then collapse into three summaries; A's result retains `o1,o2` provenance and SUM=150. |
| Window ranking | `sql-window-rank` | `collection.flow` | Four stable events form two ordered partitions, then receive ranks without collapsing. |
| Moving ROWS frame | `sql-rows-between` | Existing `table.transform`, additive overlay | Current row advances; consecutive membership changes from one row to pairs; teaching sums are 10, 30, 50, 70, 90. |
| Bubble sort | `algorithm-bubble-sort` | Existing `algorithm.loop` | Compare, swap or keep; real stable-item movement, focused code and i/j/comparison/swap state. |
| Insertion sort | `algorithm-stable-sort` | Existing `algorithm.loop` | Hold key, compare, shift larger items, place key; the prefix grows and equal keys remain 3a before 3b. |
| Binary search | `algorithm-binary-search` | Existing `algorithm.loop`, unchanged content | Candidate interval, midpoint, comparison and focused code remain synchronized. |
| DFS worklist | `algorithm-dfs-worklist` | `collection.flow` | Push/pop between undiscovered, vertical stack and visited order; newest child C leaves before B. No graph layout is added. |
| Hash partitioning | `de-hash` | `collection.flow` | Explicit illustrative key-modulo rule routes stable rows from source to destination partitions. |
| Spark-style shuffle | `de-shuffle` | `collection.flow` | Map inputs, route decision, physical transfer, destination-local reduce phase and load counts. |
| Skew | `de-skew` | `collection.flow` | Five hot-key rows visibly accumulate at one destination; the other receives one. Load bars and state agree. |
| Repartition | `de-repartition` | `collection.flow` | Same six-row/three-partition input as coalesce; key redistribution gives two three-row partitions. |
| Coalesce | `de-coalesce` | `collection.flow` | Merge the last two-row block intact; four original rows stay in place; resulting loads are 4/2. |
| Retry | `de-retry` | Existing `workflow.run`, unchanged content | Existing keyed-write retry and attempt state remain intact. |
| Backfill, fan-out/fan-in | `de-backfill` | Existing `workflow.run` | Two explicit date scopes fan out, one retries, and publish waits until both succeed. |

The only new renderer family is `collection.flow`. Reuse crosses SQL grouping/ranking, algorithm worklists, hash/shuffle/skew and partition resizing. Loop order cannot represent multiple simultaneous containers, a table state does not represent cross-container provenance, and a workflow task is not a moving row. This is the focused semantic gap that justifies the addition.

`tests/visuals/explanation-examples.test.ts` verifies all frames, conservation, sorting, summaries, window sums and workflow states. `tests/visuals/explanation-motion.test.ts` verifies renderer identity, reverse stepping and deterministic export. `tests/external-consumer/tests/browser/explanations.spec.ts` exercises all 17 examples through the independently bootstrapped production FigurePlayer at 1440px and 390px. The existing migration, browser, screenshot, coverage and privacy gates remain enabled.

Limits: examples are deterministic authored traces, not SQL/Spark/algorithm execution services. The simple modulo teaching rule is explicitly not Spark's internal hash. Backfill uses existing explicit task/date identities, not a new mapped-task executor. A recursion call-stack or arbitrary graph/workflow execution is not claimed. Chrome is the certified browser matrix; older DOMs without state-preserving `moveBefore` retain static placement and stepping but are not certified for interpolated motion.
