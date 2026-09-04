# v0.6 improvement pass

This handoff is more useful than v0.5 in two ways:

1. It no longer leaves cloud/model/lineage purely as prose ideas: the canonical project now contains **validated seed contracts**, JSON schemas, examples, and offline smoke tests for all three generator families.
2. It separates the handoff into a **full research archive** and a **slim Codex working archive** so the user does not need to send 200+ MB of reference code every time.

## Added to the canonical project

- `src/lib/generatorSpecs.js`
- `src/data/generatorExamples.js`
- `schemas/cloud-diagram.schema.json`
- `schemas/data-model.schema.json`
- `schemas/lineage.schema.json`
- `examples/generators/*.json`
- `docs/generators/GENERATOR_CONTRACTS.md`
- `tests/generator-spec-smoke.mjs`

These deliberately stop before pretending the renderers are complete. Codex now has a tested contract to implement against instead of only a design brief.

## What remains intentionally unimplemented

- live cloud topology renderer;
- live data model/entity renderer;
- live lineage renderer;
- generic provider icon registry;
- auto-layout engine for these new specs;
- export pipeline for the new generator families.

Those are now clean next tasks rather than ambiguous product ideas.
