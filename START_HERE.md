# START HERE — ConceptMotion + Fluent foundation v0.7

This handoff is the next development package for ConceptMotion. It contains the current working ConceptMotion Studio baseline, selected prior research, current visual references, and a concrete implementation prompt for Codex.

## The decision is already made

Do not reopen the React-vs-vanilla debate unless a hard technical blocker is discovered.

The target is:

- **React + TypeScript** for product/application surfaces.
- **Fluent UI v9 / Fluent 2** for accessible application primitives and interaction patterns.
- **ConceptMotion Core** as a React-independent semantic scene/timeline model.
- **SVG + D3** as the primary renderer technology for technical/educational visuals.
- **ConceptMotion React adapter** as the primary web integration.
- **A small shared `@datapass/ui` layer** for recurring application composites, not a replacement for Fluent.
- **Fluent React Charts** only for ordinary business charts where it saves time; ConceptMotion remains responsible for explanatory technical motion.
- **Mermaid** may remain a secondary/generated topology format, not the primary interactive visual language.
- **Web Components** are a future adapter, not the v1 core.

## Product identity

The desired combination is:

**Fluent outside + BBC/Economist editorial discipline inside figures + ConceptMotion semantic animation.**

The default UI should be serious, concise, light, structured and professional. The Fluent marketing homepage is a reference for quality, not a mandate to use colorful gradients everywhere.

## First action for Codex

Read these files in order:

1. `CODEX_MASTER_PROMPT.md`
2. `TARGET_ARCHITECTURE.md`
3. `CONCEPTMOTION_PRODUCT_CONTRACT.md`
4. `SEMANTIC_MOTION_SPEC.md`
5. `DESIGN_SYSTEM_DIRECTION.md`
6. `SHARED_UI_COMPONENTS.md`
7. `GOLD_STANDARD_SCENES.md`
8. `ACCEPTANCE_CRITERIA.md`
9. `MIGRATION_AND_SCOPE.md`
10. the current project audit at `project/conceptmotion_studio/AUDIT.md`

Then inspect the existing source before changing architecture.

## What v1 must prove

The v1 foundation is successful if it can convincingly render and interact with:

- moving/filtering/sorting table rows;
- join fan-out with stable row identity;
- a programming loop with synchronized pointer/code/state;
- at least one statistics/ML explanatory scene;
- a cloud/data-engineering pipeline with animated batch/stream/CDC/control/error flows;
- a data model or lineage diagram with reusable node/port/edge primitives;
- a professional Fluent-based Studio/Catalog/Explainer UI.

Do not try to finish the entire 186-concept catalog in this pass.
