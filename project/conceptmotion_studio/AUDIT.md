# Audit — ConceptMotion Studio v0.3 handoff

Date: 2026-09-04

## Executive assessment

The project is a credible **prototype architecture and content taxonomy**, not yet a production-ready reusable library. Its strongest decisions are the separation of learning surfaces, the data-driven scene model, and the broad catalogue. Its weakest area is renderer engineering: many renderers still redraw complete frames rather than animating stable object identity, and browser/build QA has not yet been completed in this environment.

## Scorecard

| Area | Status | Notes |
| --- | --- | --- |
| Product concept | Strong | Clear problem/solution fit for visually explaining modern data concepts. |
| Catalogue/taxonomy | Strong prototype | 186 concepts, broad and useful, but not every summary is source-verified. |
| Scene authoring model | Good | Deterministic frames + synchronized code are the right abstraction. Schema migration still open. |
| D3 renderer architecture | Mixed | 28 reusable families, but monolithic file and too much full redraw. |
| React/D3 boundary | Good | React shell and D3 SVG subtree are reasonably separated. |
| Storyboard UX | Good prototype | Playback, scrub, code sync, reduced motion, keyboard support. |
| Cheat-sheet UX | Good prototype | Multiple surfaces/themes, print path, cross-language comparisons. |
| Accessibility | Partial | SVG title/desc + controls improved; still needs browser audit and textual data fallback. |
| Mobile | Unverified | Responsive CSS exists, but no real device/browser pass was run here. |
| Automated QA | Moderate | Strong offline data checks; no browser/visual regression tests yet. |
| Build reproducibility | Incomplete | npm install timed out in this environment; no lockfile. |
| Packaging/API | Early | Demo app + authoring helper; not yet a clean npm library distribution. |

## Findings fixed in this pass

### 1. Misleading live coverage

**Before:** catalogue `surface: interactive` could look like a completed interaction.

**After:** the UI explicitly distinguishes recommended surface from `LIVE`/`PLANNED`, includes implementation filtering and shows live counts.

### 2. Search tags were malformed

Catalogue tags were passed as strings but the UI spread them as iterable characters. Search still often worked because summary/title were included, but tags were not correctly modeled.

**Fix:** the catalogue helper now normalizes string tags into token arrays.

### 3. Bubble sort stopped unsorted

**Fix:** storyboard now ends with `[2, 3, 4, 6, 8]` and the data-integrity test asserts the final sorted order.

### 4. DAX REMOVEFILTERS visual inconsistency

**Fix:** displayed filters and highlighted fact rows now use the same `daxEffectiveFilters()` state. A unit assertion covers the current CALCULATE example.

### 5. Outer join renderer was one-sided

**Fix:** join renderer now supports NULL extension from either left or right.

### 6. Join semantics were visible only as match arcs

**Fix:** the current pair list is now compiled by a pure `joinResultRows()` helper into a visible result table. One-to-many joins physically create multiple result rows; LEFT/RIGHT/FULL joins show NULL-extension; semi/anti joins return unique left rows. Offline assertions cover these result counts/content.

## Remaining high-risk correctness issues

### Renderer semantics are not deeply unit-tested

Only a few pure semantic invariants are extracted today. Visual correctness can drift from captions/metrics when calculations live inside renderer code.

**Recommendation:** move calculations for joins, ranking, windows, DAX, partitions, statistics, etc. into pure functions and test them independently.

### Generated output vs pedagogical approximation

Some scenes intentionally simplify real engines. Example: a B-tree diagram is conceptual, not a literal SQL Server/BigQuery storage-page implementation. Captions should say when a visual is a mental model rather than an engine trace.

### Dialect/version specificity

T-SQL, BigQuery, DuckDB, DAX, Spark and Airflow change. Engine/version-specific cheat-sheet syntax should be verified before release.

## Architecture concerns

### Monolithic renderer registry

`src/renderers/index.js` is already difficult to maintain. Split it before adding many more renderers.

### `resetLayer()` destroys object continuity

26 of 28 current renderer functions clear an entire layer before drawing the next state. That prevents the strongest form of D3 animation: tracking the same object through a semantic transition. `partition` and `array` are the main current exceptions and should be treated as migration examples, not perfect final implementations.

Use keyed joins when object identity matters. Keep full redraw for static/parameterized views where movement is not part of the lesson.

### Flat legacy scene payload vs nested canonical v1

New authoring should use `data`, but bundled scenes remain flat. The compatibility layer is acceptable temporarily; it should not become permanent ambiguity.

## UX concerns

### Catalogue depth can overwhelm

186 concepts are useful as scope but not as a first screen. Filters, priorities and live/planned state help. Longer-term add curated learning paths such as:

- Analyst/BI core
- SQL interview core
- Data engineer core
- Power BI/DAX core
- Airflow/pipeline troubleshooting
- ML/statistics essentials

### Storyboard needs direct manipulation

Current playback is mostly authored timeline playback. Strong references like TensorFlow Playground/Seeing Theory add controls that let learners change an input and observe consequences. Add this only where a parameter is pedagogically meaningful.

### Join output continuity can improve

The result table now exists and fixes the main semantic gap. The next step is to keep result-row IDs stable with keyed D3 enter/update/exit so learners can track rows as they are created rather than seeing a full redraw.

### Handwritten theme needs structural variation

Do not stop at a script-like font. The reference style uses ruled/grid paper, hand-drawn boxes, underlines, callout arrows and dense section composition.

## Accessibility concerns

- Need focus/focus-visible audit across all controls.
- Need screen-reader summaries of each current frame beyond SVG `<desc>`.
- Need a nonvisual tabular/text fallback for data-heavy scenes.
- Need contrast audit for all theme/preset combinations.
- Need reduced-motion browser testing.

## Performance concerns

- SVG size is modest today; no major issue at current scene scale.
- Do not attempt huge real DAGs/10k+ marks with the current SVG renderers. Keep scene semantics but add Canvas/WebGL for high-density use cases.
- 186 catalogue cards are now paginated in batches of 60.

## Security concerns

The app is currently static and does not execute user code. If AI/JSON import is added:

- parse JSON only; do not `eval` scene content;
- never accept arbitrary HTML from scene fields;
- validate renderer name and schema;
- cap object/frame counts to prevent pathological scenes;
- sanitize exported filenames/text;
- do not load arbitrary remote scripts from imported scene specs.

## Testing gaps

The current environment could run data/Python tests but dependency installation timed out. Missing verification:

- Vite production build;
- React runtime errors;
- browser interaction tests;
- layout/overflow at mobile widths;
- visual regression screenshots;
- a11y automated checks;
- print/PDF rendering.

These are P0 for Codex.
