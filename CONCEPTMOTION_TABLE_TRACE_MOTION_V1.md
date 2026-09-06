# ConceptMotion Table Trace Motion V1

**Status:** verified experimental motion branch; not merged  
**Branch:** `conceptmotion-table-trace-motion-v1`  
**Parent:** `conceptmotion-table-trace-v1` @ `eaeac424428f9faecae6f939bd0051d4d84abbe6`  
**Original V4 base:** `ce8353ee0878ca74b2fe24a1af7de657a6ba61f2`  
**Verified implementation commit:** `47e7ce1eb2153f10be1a098eb2042ccab74ad9a6`  
**Verified GitHub Actions run:** `34063105552`  
**Temporary workflow cleanup commit:** `c9471c906fab98842ad802e3ed0ff83d4d5c7086`  
**Date:** 2026-09-06  
**Implementing model:** GPT-5.6 Sol

## Goal

The first Table Trace branch proved that one language-neutral relation grammar can describe filter, sort, group/aggregate, pivot/reshape and two-input join behavior.

This branch answers the next question:

> Can ConceptMotion derive useful educational motion from those semantic relations without adding authored coordinates or a second animation framework?

For this branch, the answer is **yes**. The same authored `TableTraceSpec` now drives deterministic static meaning and optional browser choreography.

## Architecture

The stable semantic state remains the source of truth:

```text
TableTraceSpec
  views + refs + relations + frames
              |
              v
      compileTableTrace()
              |
              v
       deterministic layout
              |
        +-----+-----+
        |           |
        v           v
 stable SVG     transient motion
 state          overlay
```

The transient overlay is decorative and disposable. It is not part of semantic identity and is removed from frozen/static SVG export.

This preserves the framework responsibility split:

- `@conceptmotion/core` owns semantic table/reference/relation meaning;
- `@conceptmotion/svg` owns layout-derived presentation and choreography;
- `@datapass/figure` / `FigurePlayer` owns step/play/reset and consumer chrome;
- content remains JSON-first and language-neutral.

## Relation-to-motion grammar

No animation coordinates are authored in JSON. Source and target anchors are computed from the same renderer layout used for semantic relation routes.

| Relation | Default motion | Teaching intent |
| --- | --- | --- |
| `use` | pulse | show which data is inspected |
| `map` | travel | show stable data correspondence / movement |
| `drop` | fade/exit | show data intentionally removed |
| `create` | enter/pulse | show a target with no direct source identity |
| `derive` | converge | show one or more sources contributing to a result |
| `group` | converge toward group | show rows becoming members of an educational group |

Sort needs no new relation type: row-level `map` relations naturally travel from the old display position to the new one.

Pivot needs no new relation type: cell-level `map` relations travel into the reshaped output coordinates.

Join needs no new renderer: several source rows can `derive` one joined row and therefore converge toward the same target.

## Native motion layer

`@conceptmotion/svg` now contains a small `MotionController` wrapper around the browser Web Animations API.

Properties:

- no new runtime dependency;
- renderer-owned lifecycle;
- animations are cancelled when a new frame begins or the renderer is destroyed;
- unsupported/non-browser environments retain the deterministic final SVG state;
- reduced-motion mode does not create motion travelers;
- no timers, simulations or authored coordinates are stored in content.

This is intentionally a small progressive-enhancement layer, not a replacement for ConceptMotion state or FigurePlayer timelines.

The Playwright gate instruments the real browser `Element.prototype.animate` API and verifies that selecting a Table Trace motion example causes actual Web Animations calls. The branch therefore does not infer motion only from static `data-motion` attributes.

## Transient export contract

Motion travelers live under:

```text
data-cm-transient="true"
```

`freezeSvgElement()` removes those nodes when runtime state is stripped.

Therefore SVG export contains:

- semantic tables;
- current relation highlights;
- current relation routes/arrows;
- accessible title/description;

but not a half-finished traveler/token.

This preserves deterministic static exports while allowing browser motion in the live Figure.

## Frame identity

`TableTraceSvgFrame.id` is now passed into the renderer as `frameId`.

The renderer tracks frame/relation identity so unrelated React updates (selection, metadata changes, resize-related rerenders) do not restart the same choreography continuously.

A frame may also provide a learner-facing `caption`, which FigurePlayer already knows how to expose.

## Editable Sandbox gallery

The Visual Sandbox contains five JSON-first Table Trace examples:

1. **Filter rows** — `use`, `map`, `drop`.
2. **Sort rows** — row travel from old order to new order.
3. **Group + aggregate** — group convergence, then measure-cell convergence into SUM cells.
4. **Pivot / reshape** — cell travel from long rows into wide quarter columns.
5. **Two-input join** — key-column focus followed by two-source convergence into joined rows.

All five remain ordinary Figure JSON and go through the existing production Sandbox validator. No executable Python/SQL/JavaScript is accepted.

## Reduced motion

Reduced motion is structural, not cosmetic:

- semantic highlights and arrows remain;
- transient motion tokens are omitted;
- FigurePlayer automatic playback remains disabled by its existing reduced-motion policy;
- all steps remain manually reachable.

The educational explanation therefore never depends on seeing an animation.

## Accessibility correction found by the browser gate

The first real Playwright/Axe pass found a serious `nested-interactive` problem in the new renderer: the original Table Trace implementation made table/view containers, row containers and cell/column descendants all interactive, producing nested button semantics.

The production renderer was corrected instead of excluding or weakening Axe:

- structural `trace-view` groups are non-interactive;
- structural `trace-row` groups are non-interactive;
- the table outline is the table selection handle;
- the row outline is the row selection handle;
- columns and cells remain leaf selection handles;
- group overlays remain selectable without wrapping descendant controls.

A focused SVG regression now runs with `onSelect` enabled and asserts:

- structural view/row groups have no interactive role;
- table outline, row outline, column and cell handles are interactive;
- there are zero nested `[role="button"] [role="button"]` controls.

The final desktop and phone Axe gates then pass with no serious/critical violations.

## What this branch does not do

This branch does **not** add:

- pandas/Pyodide execution;
- SQL execution;
- AST/runtime instrumentation;
- Motion.dev, GSAP or another animation dependency;
- authored x/y coordinates;
- bespoke D3 tween logic;
- a new sort/pivot/join renderer;
- a page-level/global autoplay policy;
- consumer-specific migrations.

The existing FigurePlayer timeline remains responsible for step/play/reset. This branch only improves what happens inside a Table Trace step transition.

## Deliberate design decision: no author-selected motion preset yet

V1 derives animation style from relation semantics instead of adding JSON such as `animationType: "..."`.

That keeps authoring simple and lets the consumer experiments reveal whether overrides are genuinely needed. If real lessons show that two `map` relations require materially different choreography, add the smallest semantic/presentation hint later rather than exposing low-level animation parameters now.

## Known limitations / next evidence

### Traveler vs full mark morph

The current implementation moves a compact semantic traveler/token while source and target tables remain visible. It does not physically detach an entire source `<g>` row and morph it into the target table. This is intentional for V1 because before/after comparison remains visible throughout the explanation.

If user testing shows that full row/cell ghost morphs teach better, they can be derived from the same ref geometry without changing the Table Trace contract.

### Group choreography

Group convergence targets the semantic group anchor. Non-contiguous group-bracketing is still a renderer-layout refinement; it should not become a different group schema.

### Very dense relations

More than 24 source/target motion pairs are bundled into one aggregate cue. Educational examples should remain compact; the renderer is not intended to animate production-sized dataframes.

### Global autoplay

Cross-consumer feedback has identified page/global autoplay/pause policy as a framework-level concern. It is intentionally not solved in this branch because it affects every Figure family rather than Table Trace alone.

## Verification evidence

The implementation checkpoint `47e7ce1eb2153f10be1a098eb2042ccab74ad9a6` passed GitHub Actions run `34063105552`.

### Focused tests

| Gate | Result |
| --- | --- |
| Core Table Trace grammar | **6/6 passed** |
| SVG registry + Table Trace motion + accessibility hierarchy | **17/17 passed** |
| Figure integration | **9/9 passed** |
| Visual Sandbox / five-example validation | **8/8 passed** |
| Focused unit total | **40/40 passed** |

### Repository/build gates

- frozen `pnpm` install: **passed**;
- supply-chain lockfile policy: **passed**;
- full TypeScript project references: **passed**;
- reference notebook deterministic import: **passed**;
- production Studio build: **passed**, 3,341 modules transformed;
- existing bundle policy: **passed**;
- Catalog/Knowledge continue to exclude Monaco from their initial paths;
- Workflow/Challenge continue to reach Monaco only dynamically.

Bundle evidence at the verified checkpoint:

```text
initialStaticBytes   705500
knowledgeStaticBytes 872491
workflowStaticBytes  860428
challengeStaticBytes 880217
editorLazyBytes      3906487
```

The build still reports the repository's existing large Fluent/Monaco chunk warnings; the enforced bundle-boundary policy remains green.

### Real-browser gate

A dedicated Studio-only Playwright config avoids booting unrelated V3/V4 consumers for this focused branch test.

Both profiles pass:

- desktop Chrome: `1440 × 1000`;
- phone Chrome: `390 × 844`, touch enabled.

The browser test verifies:

- all five editable Table Trace examples are present;
- actual browser Web Animations calls occur;
- sort creates three travel cues;
- group/aggregate uses convergence across authored steps;
- FigurePlayer `Next` advances semantic frame identity;
- reduced motion removes transient travelers and preserves static steps;
- no page-level horizontal overflow;
- no serious/critical Axe violations.

Playwright result: **2/2 passed**.

## Cleanup / integration note

The temporary branch-only CI workflow was removed after the green run in commit `c9471c906fab98842ad802e3ed0ff83d4d5c7086`. The run remains in GitHub Actions history as verification evidence.

This branch is intentionally not merged. Its parent Table Trace branch itself remains based on the pinned V4 line, while repository `main` has moved forward. Any later integration should be a deliberate conflict-resolution/review pass rather than silently rebasing this experiment over newer framework work.

The next useful evidence is **real lesson reuse**: use Table Trace Motion in Formation / Visual Algorithms concepts such as filtering, sorting, GROUP BY, ranking/window row movement, pivoting and join provenance. Only after that should we decide whether the framework needs full mark morphs, author-selectable choreography hints, or offline runtime trace generation.
