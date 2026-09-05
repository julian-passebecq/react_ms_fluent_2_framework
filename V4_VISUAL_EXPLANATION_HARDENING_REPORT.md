# V4 visual explanation hardening

## Authorized scope and starting evidence

Started with a clean working tree at exact commit `4f40870dec06780ed6c0b15d7a52315ecd39c702` on framework `main`. The remote also resolved to that commit. The requested zip's `00_READ_FIRST.md` was read first, followed by `01_CODEX_MASTER_PROMPT.md` and the remaining guidance/evidence. All ten SHA-256 manifest records matched. Root/local AGENTS guidance, the active V4 handoff and the latest audit/factorisation/release reports were read. The recording referenced by the prose is not included in this zip; the explicit compare/swap/movement/code/state requirements supplied by the user define its interaction-quality criteria.

The user's current request authorizes this framework-only visual pass. Historical handoff instructions and the six-consumer rerun plan do not authorize consumer changes. No independent consumer repository was modified or rerun. Throwaway framework-owned distribution fixtures remain the acceptance mechanism introduced in the baseline. The baseline commit is preserved as ancestry, without rewrite.

## Focused audit and implementation

| Boundary before implementation | Finding | Delivered change |
| --- | --- | --- |
| Join pairing, NULL extension and cardinality | Existing semantic result IDs, source focus, reveal counts and lineage fit. | New progressive approved authoring; focused result lineage and contributor-to-result entry motion in `table.join`. No join API replacement. |
| Sorting/search | Existing `LoopSceneSpec` fits stable order/code/variables. | Bubble and detailed stable insertion traces use `algorithm.loop`; binary-search fixture remains unchanged. No loop schema or algorithm-specific renderer. |
| Stable items changing named container membership | Missing semantic boundary across SQL, algorithms and data engineering. | Exactly one new `collection.flow` family, reused for grouping, ranking, worklist, hash/shuffle/skew and partition resizing. |
| Moving SQL ROWS frame | Table rows exist; explicit frame membership/current row overlay absent. | Additive `TableWindowFrame` validation and `TableSvgSceneSpec.windowFrames` / `TableRendererInput.windowFrame`. |
| Workflow retry/fan-in/backfill | Existing `WorkflowSpec` fits. Legacy viewport-driven placement overlapped branches and misranked the root; long attempt badges overlapped the task type. | Explanatory workflows adapt to the existing core `layeredDiagramLayout`, retaining existing port-aware dependency routing. Viewport derives from its bounds. Extended status gets a separate line. Browser assertions verify distinct task bounds, forward dependency order and badge separation. No new layout algorithm, DAG engine or policy executor. |
| Real browser movement | Keyed objects existed, but `append` removed/reinserted them on every update and canceled CSS transitions. | Reproduced with the independent production browser tests, then fixed shared reordering through `appendPreservingState` / supported `moveBefore`. |
| External distribution and canonical examples | Official exact-source bootstrap already works. | Additive `@datapass/canonical/explanations` export and allowlisted file. Same consumer-owned lock/source verification/frozen production gate. |

The detailed concept inventory is in [V4_VISUAL_CAPABILITY_MATRIX.md](V4_VISUAL_CAPABILITY_MATRIX.md); the public contract and runnable composition are in [V4_VISUAL_AUTHORING_GUIDE.md](V4_VISUAL_AUTHORING_GUIDE.md).

New core exports are `CollectionContainer`, `CollectionItem`, `CollectionPlacement`, `CollectionSummary`, `CollectionFrame`, `CollectionFlowSpec`, `CompiledCollectionFrame`, `validateCollectionFlowSpec`, `compileCollectionFrame`, `TableWindowFrame` and `validateTableWindowFrame`. New SVG exports include `CollectionRendererInput`, `CollectionRenderer`, `collectionGeometry`, `collectionRendererRegistration`, `registerCollectionRenderers`, `workflowGeometry` (an adapter to the existing layout) and `appendPreservingState`. The existing SVG/Figure registries and scene resolution now recognize `collection.flow`. FigurePlayer's public API and playback mechanism are unchanged. Existing explanation, workflow, diagram, loop and transition contracts remain intact.

The seventeen approved Figures retain existing concept/item IDs where applicable and use a separate explicit canonical examples entrypoint, preserving the thirty-scene historical migration gallery and its original tests. Fourteen new approved Storybook compositions are added to the mandatory story-ID guard alongside all 46 existing stories. Core remains pure; renderer geometry, DOM and CSS motion stay in SVG. No authored coordinates, new packages, graph engine, backend, SQL/Spark execution or V5 visuals were added.

## Verification evidence

Targeted baseline: 28 tests in five affected files passed before implementation. Development validation covers invalid collection identities/membership/focus/summaries, deterministic snapshots and transition plans, complete scene compilation, stable sort/grain/conservation/window sums, workflow states, actual renderer identity and deterministic exports. The original coverage floors and all existing test assertions remain enabled; only exact export/registry/Storybook inventories grow to include the additions.

The first independent production run passed 42/50 browser cases and correctly failed eight real-motion cases (four scenes × two widths). DOM identity and final positions alone were insufficient: all intermediate transforms had already jumped to their targets. A focused native-browser reproduction showed plain `append` canceled the transition, whereas a state-preserving move retained it. These failing motion assertions were retained and strengthened to inspect real CSS transition midpoint geometry, followed by normal playback/pause and reduced-motion verification.

Visual review also exposed workflow branch/card-label collisions. The existing layered layout and a separate attempt line address these; new browser assertions check task separation, dependency order and breadcrumb clearance. An existing deterministic SVG export test caught a duplicated breadcrumb after that change. Its assertion was preserved, the selector was corrected, and the affected 33-test suite passed. Earlier interrupted review runs and the failed export run are diagnostic evidence, not successful release gates.

## Completed local release

`pnpm check` completed uninterrupted on the finished implementation with **exit 0 in 858.100 seconds (14m 18s)**, using Node **24.19.0** and pnpm **11.19.0**. The full log is `project/conceptmotion_studio/qa/v4-visual-release.log` (local diagnostic artifact). Documentation of these results and generated evidence are the only subsequent local changes.

| Gate | Final result |
| --- | --- |
| Practice and preserved legacy integrity | PASS: 323 practice items / 500 variants; original catalog, scenes, imports and Python display-only smoke retained. |
| Unit/semantic tests | PASS: 379 tests in 62 files. All six package coverage floors remain enabled and pass. |
| Authoring / schemas / boundaries | PASS: 22 DX tests, four structural schemas, 112 source files / 12 package boundaries, 81 app files checked for direct Monaco. The Figure CLI validation smoke and all 17 examples' production payload/frame validators also pass. |
| Generated app scaffolds | PASS: all four existing scaffold presets. |
| Production builds | PASS: seven framework apps, separate legacy app and Storybook; 60 approved stories, including 14 new compositions. All original lazy-load and bundle budgets pass. |
| Public-output privacy | PASS: nine outputs, including source maps. |
| Existing framework browser matrix | PASS: 56/56 at desktop and 390px, with the original four platform-specific screenshot comparisons enabled. |
| Independent production consumer matrix | PASS: portfolio 2/2 and learning 54/54. Both use their own frozen install/build and real production preview. |
| Visual acceptance | PASS: all 17 FigurePlayer examples; semantic identity, intermediate motion, code/state, keyboard controls, reduced motion, task/label separation, serious/critical Axe=0 and page overflow ≤1px. |

The final local external proof used immutable source snapshot `45615e76c38a32f50db65f53c1e19ae23077e07b`; portfolio verified 65 distributed files and a 150935-byte consumer-owned lockfile, learning verified 126 files and a 170180-byte lockfile. Both rejected a deliberately mismatched frozen lockfile and retained clean consumer-owned files after release. This local snapshot is distinct from the historical framework HEAD; hosted CI must verify the new pushed commit in `commit` mode.

Twelve supplementary images are retained in `project/conceptmotion_studio/qa/v4-visual-explanations/`; desktop and phone samples were visually reviewed. Historical screenshot evidence and comparison baselines are preserved. Current bundle reports record the new build's measured sizes. Untouched internal app development servers still emit Keyborg/Pilot markup warnings; all existing release assertions pass, and this report does not claim a silent development console.

The final pushed SHA and matching GitHub Actions run are reported in the release response after observing the hosted result. The baseline's successful run is not evidence for this change. CI runs the unchanged full quality sequence and the expanded independent-consumer proofs on its exact checked-out commit, then uploads their evidence.

## Deliberate limits

These are bounded teaching fixtures, not execution runtimes. The illustrative modulo rule is not Spark's internal hash, and changed-container counts are not network-cost measurements. Coalesce/repartition use identical input and target counts to make the teaching comparison clear. Window bounds/sums are authored and tested; no SQL parser was added. Backfill uses explicit date-scoped task identities on the existing first-run explanation mechanism. The DFS worklist is proved; an arbitrary recursion or graph execution system is not claimed.

Desktop Chrome and 390px layouts are the certified browser matrix. Reduced-motion stepping and text alternatives remain usable; browsers without `moveBefore` fall back to static placement and are not certified for interpolated movement here. Screenshots are supplementary review artifacts; acceptance is the independently installed real production FigurePlayer browser suite. No six-consumer product release is certified by this framework pass.
