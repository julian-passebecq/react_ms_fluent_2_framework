# QA report — handoff build

> Historical baseline report. Foundation v1.1 production, legacy, semantic, boundary, accessibility, and browser results are recorded in [`../../V1_TEST_REPORT.md`](../../V1_TEST_REPORT.md).

Date: 2026-09-04

## Tests executed successfully

```bash
npm run check:offline
```

Current passing output:

```text
catalog smoke: 186 concepts / 12 categories
scene smoke: 36 scenes
data integrity: 186 concepts · 36 live scenes total · 33/147 recommended interactive/story concepts live · 16 sheets · 15 cross-language actions
handoff smoke: v0.3.1-handoff · 28 renderers · 15 required docs · source media excluded
python smoke: rolling-window-demo · 4 frames · canonical nested data
```

Additional manual/static checks completed:

- live scene IDs all map to catalogue entries;
- codeFocus indices are in range;
- each scene has frames/code/known renderer;
- Bubble Sort final order is asserted sorted;
- DAX REMOVEFILTERS pure semantic state is asserted;
- every cross-language action has all 8 language lenses;
- sheet IDs are unique and sections nonempty;
- catalogue tags are normalized as arrays;
- outer-join renderer supports unmatched right-side rows;
- join result semantics are unit-asserted for LEFT, RIGHT, FULL, semi and anti joins;
- join storyboards now render a concrete result table from the same pure semantic helper;
- Storyboard honors reduced-motion setting at component level.

## Could not verify in this environment

`npm install --no-audit --no-fund` timed out in this environment, including a later 120-second retry. Therefore the following remain **unverified**, not assumed passing:

- Vite production build;
- React compile/runtime;
- real browser rendering;
- desktop/mobile responsive layout;
- all D3 transitions visually;
- print/PDF rendering;
- accessibility automation;
- Netlify deployment.

Codex should treat full browser/build QA as its first task.

## Known QA debt

- No Playwright/Cypress suite.
- No visual regression snapshots.
- No axe/pa11y audit.
- No schema-validator dependency wired into build.
- No unit tests for most renderer-specific semantic calculations.
