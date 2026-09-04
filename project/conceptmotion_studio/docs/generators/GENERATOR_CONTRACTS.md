# Generator contracts

This folder defines the next major structured diagram families. They are intentionally separate from the existing storyboard scene schema because their semantics are different.

## Families

| Kind | Primary job | First renderer target |
| --- | --- | --- |
| `cloud-diagram` | cloud/network/platform architecture | cloud topology / data platform |
| `data-model` | star schema, semantic model, ERD-lite | entity/card + relationship layout |
| `lineage` | source-to-transform-to-model-to-report flow | layered DAG/flow layout |

## Design rule

The spec should describe **meaning**, not SVG coordinates. Layout engines may accept optional author hints later, but AI authors should not have to calculate pixel positions.

## Shared invariants

- stable IDs;
- deterministic output for the same spec/theme/layout version;
- generic icon fallback;
- readable without animation;
- meaningful optional animation only;
- exportable static state;
- annotations should target stable semantic IDs.

## Validation

Pure validators live in `src/lib/generatorSpecs.js`. Seed examples live in `src/data/generatorExamples.js` and are exercised by `tests/generator-spec-smoke.mjs`.

The JSON Schemas in `schemas/` document structure, while the pure validators additionally verify reference integrity such as edge endpoints and relationship field references.
