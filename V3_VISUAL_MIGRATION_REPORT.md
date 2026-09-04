# V3 visual migration report

## Result and counting rule

Thirty authored semantic scenes live in `project/conceptmotion_studio/content/visuals/`. They are shared content artifacts, not a new package or a second rendering stack. Algorithm Atlas consumes all thirty. Formation capstones and the coding consumers reuse these same Figure objects. Architecture Atlas separately adapts sixteen workload/provider reference variants; those variants are **not** added to the thirty-concept count.

Classification: **A = existing semantic/renderer family; B = additive generic extension; C = new renderer family; D = deferred.** All thirty migrated concepts are A. The opt-in radial/layered Diagram layout providers are B. V3 adds **zero** new renderer families, within the maximum of two.

## Read-only source provenance

The source working trees were not modified. Their checked-out HEADs were older, so research used the current local `origin/main` objects after confirming each against the remote main ref.

| Source | Pinned main commit | Reference files |
| --- | --- | --- |
| `julian-passebecq/leetcodedataeng` | `a3bff6aeeb89af5e379b4d8c168b3b1f581fe026` | `src/AnimatedConceptLayer.jsx`; curriculum/algorithm concepts cross-checked against `src/algorithmExtensions.js` and the deterministic imported practice corpus |
| `julian-passebecq/mlweb` | `a3b5a8e3f9166b137cfa32ea4924255c8717eec1` | `visual-lab.js` |
| `julian-passebecq/architectureweb` | `26f1ca6e501f68b3bab4217c4d13059a6796134e` | `src/data/visualArchitectures.js`, `src/data/translationMap.js`, `src/data/architectures.js` |

References were inspected as content/pedagogy sources. No old React, CSS, imperative scene rendering, vendor asset paths, or animation implementation was copied. Small deterministic datasets and frame explanations were newly authored to express the source concepts through existing contracts. These are **illustrative semantic adaptations**, not full challenge-solution replays. Public attribution and opaque source IDs are exported through `visualSources`; full repository, commit and path are retained in this non-bundled report only. The visibility audit confirmed all three source repositories are private. Runtime content, app source panels and source maps must not publish their GitHub URLs or construct them from metadata. Public source IDs are `source:visual-practice-v3`, `source:visual-ml-v3` and `source:architecture-reference-v3`; each maps to the corresponding pinned source row above. Reference freshness is a dated source snapshot, not a claim of live service verification.

## Concept matrix

All rows below are classification A. `practice` means leetcodedataeng's pinned visual/pedagogical corpus; `ML` means mlweb's pinned Visual Lab. Each row has a separate stable Figure ID, explanation sequence and tested invariant.

| Stable ID | Source family | Shared renderer | Distinct invariant / expected result |
| --- | --- | --- | --- |
| `sql-filter` | practice: filter | `table.transform` | amount ≥ 70 retains original IDs o1 and o3 |
| `sql-inner-join` | practice: inner join / hash join | `table.join` | three matched output pairs |
| `sql-left-join` | practice: left join | `table.join` | four orders survive, including unmatched C |
| `sql-full-join` | practice: full join | `table.join` | five output rows include unmatched C and D |
| `sql-group` | practice: group by | `table.transform` | four orders become three customer rows; totals 150, 80, 20 still sum to 250 |
| `sql-window-rank` | practice: SQL ranking | `table.transform` | four original event IDs survive partitioned ranking |
| `sql-latest-row` | practice: latest-row dedupe | `table.transform` | rank then retain a-new and b-new, with explicit tie-breaker caveat |
| `sql-qualify` | practice: QUALIFY / ranking | `table.transform` | filtering follows the window; dialect availability is explicit |
| `sql-grain` | practice: join cardinality | `table.join` | two A orders × two dimension versions yields four A pairs; total five |
| `sql-cdc` | practice: CDC / SCD2 | `table.transform` | retain A-v1, close its interval, append A-v2; exactly one current row |
| `algorithm-scan` | practice: scan | `algorithm.loop` | visited-prefix accumulation finishes at 19 |
| `algorithm-binary-search` | practice: binary search | `algorithm.loop` | candidate interval never discards target 13 at index 4 |
| `algorithm-frequency` | practice: hash / frequency | `algorithm.loop` | bucket counts sum to number of processed observations |
| `algorithm-stack-queue` | practice: stack / queue | `algorithm.loop` | identical A,B,C arrivals remove newest C versus oldest A |
| `algorithm-two-pointers` | practice: two-pointer pattern | `algorithm.loop` | sorted end comparisons converge to 2 + 7 = 9; illustrative pair-sum variant |
| `algorithm-sliding-window` | practice: sliding window | `algorithm.loop` | fixed consecutive windows total 6, 6, 9 using add/subtract |
| `algorithm-prefix-sum` | practice: prefix sum | `algorithm.loop` | half-open range [1,4) equals prefix[4] − prefix[1] = 6 |
| `algorithm-stable-sort` | practice: stable sorting | `algorithm.loop` | original item IDs move; equal key 3a remains before 3b |
| `algorithm-top-k` | practice: heap / Top K | `algorithm.loop` | a bounded candidate set finishes at 8,9 |
| `algorithm-interval-merge` | practice: intervals | `algorithm.loop` | overlapping [1,3],[2,5] become [1,5], separate from [8,9] |
| `algorithm-bfs` | practice: graph traversal | `diagram.flow` | successive frontiers have distances 0, 1, 2 |
| `algorithm-topological` | practice: topological ordering | `diagram.flow` | Publish waits for both Clean and Validate |
| `de-batching` | practice: batching | `algorithm.loop` | seven items partition exactly once into batches of 3,3,1 |
| `de-partition-pruning` | practice: partition pruning | `table.transform` | metadata selects p2: 200 candidate rows instead of 450 |
| `de-medallion` | practice: Bronze/Silver/Gold | `diagram.flow` | raw → valid → business contracts, not three identical copies |
| `de-retry` | practice: retry / idempotency | `workflow.run` | sparse states carry forward; publish waits; write attempt 2 uses the same logical key |
| `de-pure-transform` | practice: transformation boundary | `diagram.flow` | input → validate → transform → output, no hidden I/O |
| `ml-regression` | ML: linear | `statistics.regression` | illustrative MSE decreases 56/3 → 14/3 → 0 |
| `ml-decision-tree` | ML: tree | `diagram.flow` | age=25, income=40 follows exactly one path to Class A |
| `ml-leakage` | ML: validation / leakage | `diagram.flow` | test→fit is marked as the forbidden path; correct frames fit train only |

### Exact coding-corpus links

`figureForPracticeId` is a lookup against stable source IDs, not a title heuristic. Fourteen of the fifteen source algorithm items have related shared scenes; `al-dedupe-order` deliberately has no claimed equivalent. The two-pointer figure teaches a pair-sum variant of the source's sorted-merge pattern and is labelled as an illustrative adaptation, not its solution. In addition:

- `eng-filter-active` → `sql-filter`
- `eng-inner-join` and `al-hash-join` → `sql-inner-join`
- `eng-group-sum` → `sql-group`
- `eng-latest-row` → `sql-latest-row`

This produces eighteen source-ID references across seventeen shared scenes. The coding-corpus test verifies that every mapped ID actually exists in the imported 323-item corpus. Missing scene mappings return `undefined`, allowing a truthful consumer fallback.

## Layout extension B

`DiagramLayoutSpec` adds optional `provider: 'layered' | 'radial'` and `hubId`. Existing specs without a provider retain V1/V2 geometry. `radialDiagramLayout` and `layeredDiagramLayout` implement `DiagramLayoutContract`; `layoutDiagram` selects the provider. Output includes deterministic node rectangles, edge routes and optional group bounds.

Radial layout has ID/group-stable clockwise ordering, an explicit semantic hub, circumference-based separation, rectangle-boundary anchors, and deterministic self-edge routes. Layered layout uses deterministic ranks and lanes, with bounded handling of cycles. Neither uses random forces, DOM measurement, React, ELK, vendor assets or coordinates inside content specs. The SVG graph adapter consumes the resulting geometry. Generic provider-backed Diagram nodes show semantic ACTIVE/ISSUE emphasis, not invented PENDING task status; workflow run statuses remain unchanged.

Architecture Atlas and Pilot Center both use this provider. Tests cover shuffled input order, finite in-bounds geometry, sixteen-spoke non-overlap, empty/singleton/cyclic/self-edge diagrams, nested group-bound calculation and missing-hub validation.

## Architecture consumer migration

Four workload families — lakehouse/medallion, streaming, CDC/replication and orchestration/platform — each expose Conceptual, Databricks, Microsoft Fabric and Google Cloud translations. Eight stable responsibilities are retained: Source, Move, Store, Process, Model, Serve, Operate and Govern. Source Silver/Gold sub-stages are intentionally consolidated into stable Store/Model responsibilities; the Stage Lens contains the provider translation. This is semantic normalization, not a pixel-for-pixel layout migration.

The consumer supports keyboard stage/node selection, active paths, provider comparison, layered/radial layout, reduced-motion steps, current-state SVG export, a shared workflow-run view, and a separate hand-authored column-lineage view. No SQL parser or pipeline execution is implied. Thirty-two diagram combinations (16 variants × 2 layouts) are validated and checked for input-order independence.

## Shared playback and mobile behavior

`FigurePlayer` composes production `FigureView`, `TimelineControls`, `InspectorPanel`, reduced-motion preference and static SVG freezing. It supplies Previous/Next, Play/Pause, Reset, step slider, speed, active explanation, stable-ID selection and export only when a non-error SVG is actually present. Static/fallback figures do not pretend to have playback or SVG export. Export filenames are sanitized. Live same-family figures have per-instance title/description ARIA IDs; frozen exports normalize only those runtime namespaces and remain byte-identical for identical content.

Narrow player containers expose a keyboard-focusable, labelled horizontal figure region at readable SVG scale, with a visible pan hint and full-width captions. This is scoped to the new shared player; existing FigureView geometry and V1/V2 screenshots are unchanged.

## QA and deliberate deferrals

Targeted checks passed: both atlas app TypeScript builds; 48 unit tests across the migration invariants, architecture variants, pure layouts and FigurePlayer; four Playwright atlas flows across desktop 1440px and phone 390px. The browser checks assert keyboard selection, reduced-motion/manual controls, correct provider lens, real SVG downloads, shared Workflow/Lineage rendering, no page overflow, no serious/critical Axe findings and no Monaco on Algorithm Atlas paths. Screenshot evidence is under `project/conceptmotion_studio/qa/screenshots/v3-algorithm-*` and `v3-architecture-*`. Authoritative final gate/hosted results are recorded in `V3_TEST_REPORT.md`.

Class D deferrals include new typed semantic migrations for logistic probability/boundary geometry, random forests, gradient boosting, k-NN, SVM, k-means iteration geometry, PCA projections and neural-network geometry. Broader consolidation of the historical 28 legacy renderer families into typed semantic contracts is also deferred; their existing implementations remain preserved and tested in the legacy app. These deferrals need no placeholder new renderer in V3. No D3 SDK/Power BI rewrite, GeoStory, model training, Spark/Jupyter runtime, backend or external monitoring was added.
