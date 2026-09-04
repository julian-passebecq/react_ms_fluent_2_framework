# Codex handoff — ConceptMotion Studio

> Foundation v1.1 was completed on 2026-09-04. This file remains the preserved pre-v1.1 baseline handoff; use [`../../V1_MIGRATION_LOG.md`](../../V1_MIGRATION_LOG.md), [`../../V1_API_SURFACE.md`](../../V1_API_SURFACE.md), [`../../V1_TEST_REPORT.md`](../../V1_TEST_REPORT.md), and [`../../V1_AUDIT_SELF_REVIEW.md`](../../V1_AUDIT_SELF_REVIEW.md) for the implemented result.

**Read this first.** This ZIP is intended to be taken over by Codex as a standalone repository. It is not part of the ML website anymore.

## 1. Project goal

ConceptMotion Studio exists because technical learning material is usually split between two weak extremes:

- dense prose/cheat sheets that say *what* a concept is but do not show state change;
- bespoke visual demos that look good but cannot be reused across SQL, DAX, pandas, Spark, pipelines, storage, statistics and ML.

The intended product is a **visual explanation library + catalogue + authoring grammar** for modern data work. An AI should be able to explain a new concept by choosing a renderer and producing semantic scene state, rather than generating one-off SVG/DOM animation code every time.

The target user works across Python, pandas, SQL/T-SQL/BigQuery/DuckDB, DAX/Power BI, PySpark, Airflow, data modeling, lakehouse/storage, statistics/ML, Git and Docker. The user prefers a **light theme** and wants explanations that are compact, visual, interview-useful and technically precise.

The key product idea is:

```text
Catalogue taxonomy
      │
      ├── Storyboard (motion + state + synchronized code)
      ├── Interactive diagram (structure/parameters)
      ├── Paper / handwritten sheet (dense recall)
      └── Cross-language sheet (same action, different syntax)
```

Do not try to animate everything. Animation is useful when ordering, movement, dependency, propagation, selection, optimization or changing state is the lesson.

## 2. Current inventory after the 2026-09-04 improvement pass

- **186** catalogued concepts across **12** domains.
- **36** live scene definitions.
- **28** D3 renderer families in `src/renderers/index.js`.
- **16** printable catalogue sheets.
- **15** cross-language semantic actions.
- **8** syntax lenses: Python, pandas, T-SQL, BigQuery, DuckDB, PySpark, Polars, DAX.
- React 19 shell, D3 7.9 renderer core, Vite build.
- Python dependency-free scene authoring helper.
- Offline data/semantic QA suite.

A very important distinction now exists in the UI:

- **Surface** = recommended teaching treatment in the catalogue.
- **Live** = there is an implemented renderer + scene timeline today.
- **Planned** = catalogue coverage only. Never imply the scene already exists.

There are currently 147 concepts whose recommended surface is interactive/story. Of those, 33 are live; 114 remain planned. There are 36 live scenes total because three implemented join lessons are classified as diagram surfaces. This is deliberate roadmap coverage, not a completion claim. The SQL join family now has an explicit result table so row multiplication and NULL-extension are visible rather than inferred from arcs alone.

## 3. What was changed in the last pass

### Repository separation

The earlier prototype had temporarily been added under `mlweb/conceptmotion`. That was reverted. The ML website was restored to its pre-ConceptMotion main commit. This ZIP is the new standalone project.

### Catalogue truthfulness

The Atlas previously marked many concepts as `interactive` even when no scene existed, which could read as if 147 interactions were already built. The UI now displays `LIVE` vs `PLANNED`, includes an implementation filter, and paginates the large catalogue.

### SQL join family expanded

Added live scenes for:

- RIGHT JOIN
- FULL OUTER JOIN
- CROSS JOIN
- semi join / EXISTS
- anti join / NOT EXISTS

The join renderer now supports unmatched rows on either side (`[leftIndex, null]` and `[null, rightIndex]`).

### Bubble-sort storyboard fixed

The original storyboard only showed the first pass and stopped while the array was still unsorted. It now reaches the sorted state. This matters because the final frame must expose the algorithm invariant/result, not merely stop at a convenient animation point.

### DAX correctness bug fixed

`REMOVEFILTERS(Channel)` was hidden in the drawn filter chips but was still incorrectly applied when deciding which fact rows were visually active. The DAX renderer now computes a pure `daxEffectiveFilters()` state and uses the same state for both display and fact-row evaluation.

### Accessibility / interaction

Storyboard now supports:

- previous/next;
- play/pause;
- replay;
- scrubber;
- speed cycling;
- keyboard shortcuts (`←`, `→`, Space/K, R);
- `prefers-reduced-motion` step-only mode;
- dynamic captions/operation labels via live regions;
- SVG description text;
- visible renderer failure fallback.

### Scene contract migration started

The intended **canonical v1 scene shape** keeps renderer-specific static data under `data`:

```js
{
  id: 'spark-skew',
  renderer: 'partition',
  data: { buckets: [...], records: [...] },
  code: [...],
  frames: [...]
}
```

Bundled scenes are still mostly the older flat shape. `src/lib/scene.js` normalizes either form so the project remains compatible during migration. The Python authoring helper now emits canonical nested `data`.

### Cheat-sheet coverage expanded

Cross-language actions now include filtering, projection, derived columns, grouping, sorting, joins, dedup, rolling windows, Parquet read/write, distinct values, ranking, anti-join, missing-value handling and monthly date normalization.

Added printable reference sheets for Python core, pandas, SQL dialect differences, Power BI performance and Docker, in addition to the existing SQL/DAX/Kimball/Airflow/Spark/storage/statistics/ML/Git/VS Code sheets.

## 4. Architecture decision

### React

React owns:

- application navigation;
- catalogue/search/filter state;
- storyboard controls;
- cheat-sheet UI;
- theme preferences;
- error boundaries/fallback UI.

### D3

D3 owns the SVG subtree and should own state-to-geometry transitions. Do **not** have React and D3 both mutate the same SVG nodes.

### Python

Python is an authoring adapter, not the browser renderer. Use it to emit scene JSON from notebooks, query plans, metadata, lineage definitions, pipeline configs, etc.

### AI authoring principle

AI should emit semantic state such as:

```text
order
focusIds
active
window
positions
done
failed
blocked
filters
codeFocus
operation
caption
```

It should not normally emit pixel-by-pixel keyframes.

## 5. Biggest doubts / technical debt

These are the areas where the current implementation is least mature.

### A. Renderer file is too monolithic

`src/renderers/index.js` contains all 28 renderer functions. This was expedient for the prototype but is the wrong long-term package structure.

**Recommended:** split by renderer family, e.g.

```text
src/renderers/
  registry.js
  shared.js
  table/
  join/
  dag/
  partition/
  dax/
  storage/
  statistics/
  ml/
```

Keep pure semantic calculations outside D3 where possible so they can be tested without a browser.

### B. Many renderers rebuild instead of transition

`resetLayer()` clears and redraws **26 of the 28 current renderer functions** every frame. That means many storyboard states are *visually different*, but not truly animated with stable object identity. The two renderer families already closest to the desired object-constancy model are `partition` and `array`.

This is probably the single most important renderer-level improvement. The supplied moving Bubble Sort reference works because the learner can track the **same object** as it changes position.

**Recommended:** use keyed D3 joins (`.data(data, d => d.id)`), stable IDs, `enter/update/exit`, and transitions. Do not indiscriminately transition every property; transition only semantic movement.

### C. Join result construction is now explicit, but still redraw-based

The join renderer now builds a visible result table from the current semantic pair list, including one-to-many multiplication and NULL-extension for LEFT/RIGHT/FULL joins. Semi/anti joins project unique left rows. The pure `joinResultRows()` helper is covered by offline assertions.

The remaining debt is **object continuity**: the join view still rebuilds the layer per frame, so output rows appear as new drawings rather than entering through a keyed D3 join. Also, the generic output table currently shows all left/right source columns rather than parsing the exact SQL projection.

**Recommended:** preserve result-row IDs across frames, animate enter/update/exit, and optionally let scenes declare an explicit pedagogical output projection.

### D. Canonical scene schema is in migration

The documentation now says nested `data`, but bundled scenes are mostly flat. Runtime normalization keeps both working.

**Recommended:** once renderer contracts settle, migrate all bundled scenes to v1 and make schema validation strict at development/build time.

### E. Content breadth is ahead of live visual depth

The catalogue is intentionally broad but only 36 scenes are live. Do not solve this by creating 114 bespoke visualizations. The right task is to add **high-reuse renderers** and let many catalogue entries share them.

### F. No real browser QA was run in this environment

`npm install` repeatedly timed out in the build environment, so I could not run the final Vite bundle or Playwright-style browser checks here. The offline tests pass. Codex should install dependencies and run a real build immediately.

### G. No lockfile yet

Create and commit a lockfile after a clean successful install. Do not hand-edit one.

### H. Visual themes are still mostly CSS token changes

The user wants genuinely different surfaces: professional, Economist/editorial, social-media card, presentation/dashboard, handwritten/no-color notebook. The current themes are useful but not yet a mature design system. A handwritten theme should change layout grammar (lines, boxes, underlines, arrow style, density), not only fonts/colors.

### I. Math typesetting is basic

The notebook references use formulas. There is no KaTeX/MathJax integration yet. Add one only where formula rendering clearly improves sheets/scenes; do not make every concept mathematical.

### J. Export/sharing is missing

Potentially valuable later:

- shareable deep link to a storyboard scene/frame (catalogue concept deep links already exist);
- SVG/PNG export;
- print/PDF export for paper sheets;
- optional GIF/MP4 storyboard export;
- embed component/API example.

## 6. Highest-value next implementation order

### P0 — make the prototype trustworthy

1. Run `npm install` and commit the generated lockfile.
2. Run `npm run check` and fix any Vite/React compile errors.
3. Open every tab in a real browser at desktop + mobile widths.
4. Test light/dark and all visual presets.
5. Add automated browser smoke tests for opening every live scene.
6. Split `renderers/index.js` enough that future work is manageable.
7. Migrate/validate canonical scene schema or clearly keep a versioned compatibility layer.
8. Convert join input/output rows and match links to keyed D3 joins so row identity persists across frames.

### P1 — user-relevant renderer grammars

Build reusable grammars in this order:

1. **table-transform** — filter, select, group, dedup, pivot/melt, LAG/LEAD, running total;
2. **window-compare** — ROWS vs RANGE, peers, current row, frame bounds;
3. **join-algorithm** — hash/merge/nested-loop join mechanics, not only relational join semantics;
4. **index/query-plan** — scan vs seek, composite index, sargability, selectivity/cardinality;
5. **DAX context** — row context, filter context, context transition, relationship propagation, SUMX/CALCULATE;
6. **DAG runtime** — trigger rules, retries/backoff, branch skip, pools/concurrency, backfills;
7. **storage-layout** — Parquet row group → column chunk → page, pruning/pushdown, small files/compaction;
8. **stream/time** — event time, watermark, late data, checkpoint, CDC;
9. **semantic-model** — star/snowflake, grain, SCD patterns, filter propagation;
10. **statistics/ML** — distributions, CI/p-value, threshold tradeoffs, trees/boosting, neural training.

### P2 — improve authoring as a library

- Renderer contracts/types per family.
- Scene validation with clear error messages.
- A small scene editor/import box for JSON.
- `createScene()` helpers and example AI prompts.
- React component package boundary separate from the demo app.
- Optional Python package directory with validation/tests.

## 7. User reference: moving Bubble Sort video

The supplied short-form video is a core UX reference. Do not copy branding/assets; reproduce the **teaching mechanics**.

Observed pattern from the video/contact sheet:

- dark technical card with a large `BUBBLE SORT` title;
- one-sentence definition directly under the title;
- small Time/Space complexity pills;
- a horizontal array of boxed numeric values;
- the currently compared pair is bracketed/highlighted;
- the operation label changes between states such as `COMPARE` and `SWAP`;
- when a swap happens, the two values visibly exchange positions rather than simply recoloring;
- below the array is line-numbered pseudocode/Python;
- the code line responsible for the current operation is highlighted at the same time as the array state;
- the animation advances pair-by-pair, making causality obvious: **code line → operation → object movement → new state**;
- the learner can visually track the same values across positions;
- complexity information remains visible but secondary;
- the Instagram chrome/creator branding is irrelevant to the library and must not be copied.

This is why the Storyboard state model contains `order`, `focus`, `done`, `operation`, `caption`, and `codeFocus`.

See `research/MOVING_VIDEO_SPEC.md` for the reconstructed timeline/acceptance criteria and `research/user-reference-notes.md` for the other supplied paper/cheat-sheet references.

## 8. Content accuracy policy

The catalogue is partly a design taxonomy and not every one-line summary has been exhaustively validated against an official source. Before turning a planned item into a polished public lesson:

- verify engine-specific SQL syntax against the target engine/version;
- verify DAX behavior with Microsoft Learn and/or SQLBI;
- verify Airflow states/trigger rules against the current Airflow documentation;
- verify Parquet/Delta/Iceberg physical claims against their official specs/docs;
- verify Spark optimizer/execution claims against current Spark/Databricks docs;
- keep statistics/ML definitions mathematically correct and distinguish intuition from formal conditions.

Never silently turn a heuristic into a universal rule.

## 9. QA commands

Offline checks that pass in this ZIP:

```bash
npm run check:offline
```

Expected current summary:

```text
186 concepts
36 scenes
16 sheets
15 cross-language actions
8 language lenses
handoff docs/counts checked; raw reference media excluded
```

Full verification Codex must run after install:

```bash
npm install
npm run check
npm run dev
```

Then add browser/a11y/visual smoke tests.

## 10. Files to read next

1. `AGENTS.md`
2. `AUDIT.md`
3. `ROADMAP.md`
4. `docs/ARCHITECTURE.md`
5. `docs/AUTHORING_CONTRACT.md`
6. `research/MOVING_VIDEO_SPEC.md`
7. `research/user-reference-notes.md`
8. `research/visual-references.md` and `research/SOURCE_AUDIT.md`
9. `QA_REPORT.md`

## 11. One sentence to keep the project aligned

**The catalogue says what should be explainable; reusable renderer grammars determine how it becomes explainable; AI-authored semantic state supplies the lesson.**


## 13. Additional reference bundled in the super handoff: SQLBI Whiteboard

The MEDIUM handoff includes selected SQLBI Whiteboard source/docs under `../../reference_essentials/sqlbi-whiteboard/`, plus `../../SQLBI_REFERENCE_NOTES.md` and a local guide snapshot. The complete SQLBI repository is only in the FULL research package.

Do not turn ConceptMotion into a WPF whiteboard. The useful abstractions are stable semantic objects, annotations attached to object IDs, Markdown recipe import, code as a first-class container, command history, automatic export partitioning, thumbnails/contact sheets, and live-to-frozen snapshot thinking. The first recommended adaptation is a declarative annotation layer whose marks follow moving rows/nodes/code clauses by semantic target ID.

## 10. v0.5 addendum - new generator families

A new user request after the previous handoff made the next product priorities clearer.

### Cloud diagram generator

The project should add a standardized cloud/architecture generator rather than relying on ad hoc Mermaid-like diagrams. Target outputs include Azure/Fabric architecture diagrams, networking diagrams, app/data-platform flows, and optional meaningful data-flow animation.

See the root file `CLOUD_DIAGRAM_GENERATOR.md`.

### Data model / lineage generator

The project should add a standardized data modeling generator for star schema, semantic model, entity cards, and lineage diagrams.

See the root file `DATA_MODEL_GENERATOR.md`.

### Frontend decision

The user does want a public-facing demo/documentation surface, but the core library should remain AI/prompt/file driven. Therefore the recommended product split is:

- core library/runtime first;
- lightweight docs/showcase frontend second;
- no heavy editor first.

See the root file `LIBRARY_PRODUCT_STRATEGY.md`.
