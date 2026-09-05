# V4 visual and semantic refinement review

## Small V4 polish pass — 5 September 2026

This follow-up starts from `c434bc2aa8d74e44fc58a445af9b669c584e81cd`. It adds no application, package, renderer family or routing layer.

| Requested polish | Reviewed outcome |
| --- | --- |
| Formation reasoning navigation | Existing section IDs now serve a compact Fluent section picker and explicit Jump button, including the assessment. Jumping focuses the destination without changing the hash route. Each section and assessment has a keyboard-accessible return to the picker. All six sections, questions, answers and progress behavior remain intact. |
| Consumer copy | Source/UI audit of Formation, Sandbox and both Atlases; browser copy regression across 15 normal routes at desktop/phone widths. Product labels replace implementation-oriented loading, catalog, reference, assessment and status wording. Historical IDs, source records, filenames, notebook import projections, required attribution and truthful execution notices remain preserved. Developer metadata remains in existing ContentDetails. Dataset keys and technical teaching terms such as schema drift remain useful lesson content. |
| Figure density | Small loop explanations had an extra 24 viewport units of bottom space. Only the existing recommended-viewport calculation changes; compact examples now retain a 15–20 unit gutter. All 34 refined frames remain within their unchanged containment assertions. Regular/expanded minimums, table/join presentation and graph geometry were reviewed and retained. |
| Architecture on phones | The existing shared pan hint now names swipe/sideways scroll and Left/Right arrow operation, with an ARIA description linked to the focusable canvas. A quiet raised surface and teal edge improve discoverability. Label sizes, panning scale, stage content and the shared renderer remain unchanged. |
| Visual consistency | Navigation uses existing Fluent controls and Datapass surface/border/radius/ink tokens; reasoning headings lose only their unnecessary top margin. The pan hint uses the same semantic palette. Checkpoint amber remains sparse. No new theme or decorative treatment. |

Navigation evidence is `qa/v4-screenshots/v4-polish-think-{sql,python-de}-navigation-*`; refreshed compact Algorithm and Architecture phone captures use the existing V4 gallery names. Desktop and phone navigation captures, compact binary search and the phone Architecture figure were visually inspected. Existing tests additionally verify keyboard focus, unchanged lesson URLs, retained assessment answers, panning, all 34 refined frames, Axe and strict overflow. See the test report for final release results.

No requested change required structural refactoring or migration. Larger reductions to long lesson content or dense architecture layouts remain outside this surgical pass; all content and readable horizontal panning are preserved.

## Evidence and visual system

Before evidence is the supplied `references/current-v3/` gallery in the preserved V4 handoff plus unchanged V3 screenshots. After evidence is in [qa/v4-screenshots](project/conceptmotion_studio/qa/v4-screenshots). Browser tests regenerate the V4 evidence separately; the four existing Foundation screenshot comparisons remain enabled with their original tolerances and Linux baselines.

V4 uses warm off-white canvas, white/quiet raised surfaces, navy ink, teal action/selection and sparse dark amber state emphasis. Semantic tokens replace repeated consumer palette choices; Fluent v9 still supplies generic controls. Cards have restrained borders/radii and low elevation. There is no new decorative animation, marketing theme or vendor-image dependency.

Consumer titles, explanations and actions lead. Figure/importer/schema/source IDs remain inspectable through shared closed details; visible human attribution and necessary no-execution facts are not hidden as implementation trivia. Formation is the public name. Historical source names and compatible IDs are preserved, not rewritten as newly authored history.

## Consumer outcomes

| Surface | Before → after | Representative after evidence |
| --- | --- | --- |
| Formation | Runtime/importer/provenance-heavy surfaces → learning paths, local progress, readable notebooks, clear reasoning checkpoints and appropriately sized Figures. Submitted assessment review now persists. | `v4-formation-catalog-*`, `v4-formation-thinking-*`, `v4-formation-sql-lesson-*`, `v4-formation-advanced-sql-compare-*`, `v4-formation-pyspark-display-only-*` |
| Code Sandbox | Visualize hidden among generic tabs → truthful catalog mapping indicator and direct Visualize action, shared FigurePlayer, clearer reference-vs-draft state and optional source details. | `v4-code-sandbox-catalog-*`, `v4-code-sandbox-visual-*` |
| Code Interview | Flat question/review composition → distinct approach, answer and post-submit strong-answer/trade-off sections; local ungraded notes are clearly separate from selected-answer scoring. Compact desktop prelude keeps question entry prominent. | `v4-code-interview-sessions-*`, `v4-code-interview-reasoning-*`, `v4-code-interview-*` |
| Algorithm Atlas | Sparse canvas and raw migration detail → compact content-fitted scenes, readable captions, real code/state focus and human source summaries with optional audit detail. | `v4-algorithm-binary-search-*`, `v4-sql-window-rank-*`, `v4-de-retry-*`, `v4-regression-*` |
| Architecture Atlas | Undifferentiated generic glyphs/large empty canvas → eight semantic node roles, registered icon fallbacks, provider-independent stage paths, readable Stage Lens and aspect-fitted layered/radial canvases. | `v4-architecture-layered-*`, `v4-architecture-radial-*`, `v4-architecture-layered-figure-*` |
| Pilot Galaxy | Equal-weight hub/project nodes and weak hierarchy → distinct hub, canonical categories/status legend, selected connection, semantic node cards and public project inspector. Notes/private overlays retain their existing local policy. | `v4-pilot-galaxy-*`, `v4-pilot-galaxy-figure-*` |
| Visual Sandbox | Ambiguous ready/applied message → edit/apply/preview hierarchy, valid-pending vs invalid vs applied status, last-valid preview retention, three presentation choices, optional developer details and local schema/guide links. | `v4-visual-sandbox-*`, `v4-figure-presentation-*` |

The `*` evidence suffix covers desktop and phone Chrome. All eight new Storybook compositions additionally have 1440px/390px evidence under `storybook-*`.

## Eleven existing explanations refined

The inventory stays at thirty migrated Figures. Exactly eleven existing entries gain synchronized tracks: 34 semantic frames and 37 authored code lines. No new renderer family, item outcome or source migration is claimed.

| Existing scene ID | Synchronized teaching focus | Preserved outcome/invariant |
| --- | --- | --- |
| `sql-filter` | Predicate line, survivor identities, retained/filtered counts | Four orders → two original orders; row grain unchanged. |
| `sql-inner-join` | Matching keys, current pairs and result cardinality | Three matching pairs. |
| `sql-left-join` | Match/unmatched branch, original left identities, NULL extension | Four result rows including one unmatched NULL-extended row. |
| `sql-grain` | Business grain vs joined pairs and distinct original orders | Two A orders × two A versions produce four A pairs; five total pairs from three distinct orders. |
| `sql-group` | Group/aggregate lines, source-to-customer counts, conserved amount | Four orders → three customers; total 250 is conserved. |
| `sql-window-rank` | Partition/order/rank, row identity and output grain | Four events remain four ranked events. |
| `algorithm-binary-search` | Bounds, midpoint, compared item and branch | Midpoints 3 → 5 → 4; return index 4. |
| `algorithm-sliding-window` | Enter/leave item, window bounds and running sum | Window sums 6 → 6 → 9. |
| `algorithm-two-pointers` | Pointer identities, comparison and branch | Sums 12 → 8 → 9; return pair (1, 3). |
| `algorithm-prefix-sum` | Prefix accumulation and range subtraction | Prefix `[0,2,3,6,8]`; range `[1,4)` totals 6. |
| `de-retry` | Task identity, retry branch, event key and committed state | `event-42` stays stable; attempts 1 → 2 do not duplicate the one row/value 80 before publish. |

Focus references are renderer-facing semantic IDs, never DOM selectors or authored pixel coordinates. Validation checks known/unique code/entity/state references, one explanation step per semantic frame and finite scalar state. Existing keyed renderer entities survive steps; SVG export ordering is stabilized where repeated table updates previously reordered static chrome.

## Presentation, accessibility and review corrections

Compact/regular/expanded are consumer props. Their geometry is content-aware and stable over all states, rather than resizing on each step. A wide layered architecture is aspect-fitted instead of inheriting Galaxy's square canvas; expanded radial layouts gain enough height to avoid height-driven shrinking. Semantic node titles are larger and wrap within their existing cards; legacy generic node rendering is unchanged. Hosted CI exposed two titles that fit Windows fonts but overflowed Linux fallback fonts. A reproduced forced-font regression led to conservative glyph-width-budget wrapping at the same 14px size, with full names retained in accessible labels and inspectors rather than shrinking typography or weakening containment checks.

Visual inspection found that a roughly 655px coding half-pane shrank 11px SVG labels to about 7px. Explicit presentation now keeps the native 960px canvas pannable below 840px; unsized legacy figures retain the prior 600px breakpoint. The viewport is keyboard-focusable and ArrowRight panning is browser-tested. Captions, timeline actions, attribution and text alternatives remain outside the horizontal pan. This is intentional contained scrolling, not page overflow or hidden clipped content.

Targeted browser checks visit all eleven refined scenes and all 34 frames at desktop/phone widths, asserting stable viewBoxes, focused code/state/entities, in-bounds SVG content and no browser errors. Three-size tests verify deterministic repeated export, keyboard details/panning and unmodified semantic content. Architecture/Galaxy tests cover icon resolution, stage/connection selection, category/status counts, fit and export. Serious/critical Axe and strict page-overflow gates are preserved; final results are in [V4_TEST_REPORT.md](V4_TEST_REPORT.md).

Dense graphs still need their readable Stage Lens/project inspector and text alternative on small screens; V4 does not promise that every multi-node graph fits a phone without panning. Workflow explanation tracks currently align to the first declared run; the refined retry fixture has one run. No full content translation, universal responsive chart grammar or complete historical Storybook accessibility certification is claimed.
