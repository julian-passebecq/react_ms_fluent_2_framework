# Migration and scope

## Current prototype strengths to preserve

- broad catalog/taxonomy;
- deterministic storyboard concept;
- synchronized code focus;
- existing themes/cheat-sheet work;
- pure semantics helpers already extracted;
- existing generator schema experiments;
- existing reduced-motion direction.

## Current weaknesses to fix first

- monolithic renderer registry;
- full-layer redraw breaking object continuity;
- mixed scene payload generations;
- no clean package distribution;
- browser/visual regression QA gaps;
- incomplete accessibility fallback;
- lack of reusable ports/routing/flow semantics.

## Migration rules

1. Do not rewrite everything at once.
2. Keep compatibility for existing scenes while introducing canonical v1 types.
3. New code should be TypeScript even if legacy app files remain JS during migration.
4. Split renderers by semantic family before adding many more.
5. Move calculations out of renderer code into pure functions.
6. Use six gold scenes to prove the new architecture, then migrate older scenes opportunistically.

## Non-goals

- complete editor/diagram authoring canvas;
- full Power BI adapter;
- Web Component adapter;
- video/PPTX export;
- all legacy-site migration;
- every standard chart type;
- a general React framework.
