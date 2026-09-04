# Acceptance criteria — Foundation v1

The Codex pass is accepted for audit only when all applicable criteria are met and reported honestly.

## Architecture

- [ ] pure TypeScript core has no React/DOM/Fluent dependency;
- [ ] React adapter is thin;
- [ ] Fluent UI is confined to application/shared UI layer;
- [ ] renderer registry is split by family;
- [ ] stable entity IDs and state diff/transition planning exist;
- [ ] legacy scene compatibility strategy is documented.

## Visuals

- [ ] six required gold scenes render;
- [ ] table rows visibly maintain identity across transformations;
- [ ] cloud pipeline has meaningful animated flow semantics;
- [ ] data/control/error paths are distinguishable without color alone;
- [ ] diagram nodes/ports/edges are reusable;
- [ ] default theme is serious/concise, not a colorful marketing page;
- [ ] Figure metadata/source/annotation contract is visible in examples.

## Interaction/accessibility

- [ ] play/pause/step/scrub works;
- [ ] keyboard operation works for core controls;
- [ ] reduced-motion mode produces complete states;
- [ ] at least table-heavy scenes expose textual/tabular fallback;
- [ ] focus-visible is present;
- [ ] interactive diagram objects can expose meaningful labels/state.

## Quality

- [ ] package lockfile exists;
- [ ] production build passes;
- [ ] current offline tests remain green or migrations are documented;
- [ ] semantic unit tests cover join/filter/sort/flow state;
- [ ] browser smoke covers six gold scenes;
- [ ] desktop and phone layout smoke passes;
- [ ] deterministic SVG freeze/export exists;
- [ ] `V1_TEST_REPORT.md` contains actual commands/results;
- [ ] `V1_AUDIT_SELF_REVIEW.md` lists known limitations.

## Scope discipline

- [ ] no unnecessary full editor;
- [ ] no Web Components rewrite;
- [ ] no full catalog rewrite;
- [ ] no replacement of Fluent primitives;
- [ ] Data Forge itself was not built in this pass.
