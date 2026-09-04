# START HERE - Datapass Visual Platform Foundation v1.1

This is the implementation handoff for Codex.

The user has several related products and experiments: ConceptMotion, Data Forge, a LeetCode-style data training interface, cloud/data architecture sites, source-aware technical documentation, a D3 visualization generator, Power BI work, and a personal portfolio. The goal is NOT to merge every product into one application. The goal is to create a small reusable platform foundation so future products stop rebuilding the same UI, animation, diagram and learning patterns.

## The architectural decision is already made

Do not reopen the React-vs-vanilla debate unless a real blocker is found.

### Application layer

- React + TypeScript.
- Fluent UI v9 / Fluent 2 for standard application primitives and interaction patterns.
- Monaco for code, solution diff and JSON spec editing where appropriate.
- A restrained shared `@datapass/ui` layer for recurring composites only.

### Explanatory visualization layer

- ConceptMotion Core stays framework-independent and DOM-free.
- SVG + D3 is the primary technical/educational renderer.
- React is the primary adapter, not the semantic core.
- Semantic specs describe meaning and state changes, not primary pixel coordinates.

### Analytical/editorial chart layer

The existing D3 visualization SDK is a SIBLING library, not something to merge into ConceptMotion in v1.

The D3 SDK already has:

- canonical chart spec;
- Economist/BBC/newsroom-style themes;
- cross-runtime exporters;
- `createPlayback`, `drawPath`, `attachZoom`, `animatePathParticles`;
- `geoBubble`, `metro`, `barRace`, `force`, `pack`, `flowMap` patterns;
- early Power BI generation.

Foundation v1.1 must only create clean extension points so a future D3 SDK v2 can integrate without refactoring the whole platform again.

Read `D3_SDK_V2_BRIDGE_AND_ROADMAP.md` and `D3_GEOSTORY_V2.md`. The actual D3 SDK v2 implementation is OUT OF SCOPE for this Codex pass.

## Product identity

The desired visual combination is:

**Fluent 2 application quality + the concise organization of the user's portfolio/FabricStack + BBC/Economist editorial discipline inside figures + ConceptMotion semantic animation.**

Default UI:

- light first;
- serious and concise;
- thin borders;
- minimal shadows;
- compact typography;
- restrained accent color;
- no generic colorful marketing hero;
- immediate useful content.

## Five reusable application archetypes required in v1.1

1. Catalog - search/filter/discovery.
2. Workbench - canvas + navigation + inspector.
3. Explainer - concise narrative + large visual + timeline controls.
4. Challenge Workbench - LeetCode-like problem + optional visual explanation + code + solution + diff.
5. Knowledge Atlas - source-aware documentation/reference pages with interactive figures, official links, version/status/freshness metadata and a local change-impact demo.

Also required: a reusable Orchestration Workbench driven by one generic WorkflowSpec and capable of Airflow-, Fabric/ADF- and Lakeflow-oriented presentation presets.

Read `V1_1_DELTA.md`, `KNOWLEDGE_ATLAS.md` and `CONTENT_AND_CHANGE_CONTRACT.md`. Foundation v1.1 must not implement live monitoring/crawling.

## Language/i18n decision

Foundation v1.1 includes small EN/NO infrastructure because the user wants the same bilingual behavior as the portfolio in future learning and professional sites.

Do NOT translate all content now.

Implement:

- shared locale provider;
- reusable EN/NO toggle;
- local persistence;
- optional localized strings with English fallback;
- per-app/per-page ability to hide the toggle when it adds no value.

Challenge/code content may remain English-only. Code, SQL keywords and technical identifiers are never translated.

Read `I18N_AND_LANGUAGE.md`.

## What v1.1 must prove

Foundation v1.1 is successful only if it proves the reusable architecture through working examples:

- stable moving/filtering/sorting table rows;
- join fan-out with stable row identity;
- programming loop with synchronized code/pointer/state;
- at least one statistics/ML explanatory scene;
- cloud/data-engineering flow with distinct batch/stream/CDC/control/error semantics;
- data model or lineage with reusable nodes/ports/routed edges;
- generic WorkflowSpec rendered as Airflow-style DAG explanation;
- same workflow engine rendered as Fabric/ADF-style pipeline;
- same workflow engine rendered with Lakeflow-oriented presentation;
- professional Fluent Catalog/Workbench/Explainer/Challenge shells;
- Monaco JSON spec playground;
- Challenge Workbench with Description/Visualize/Hints and Code/Solution/Compare;
- EN/NO application chrome infrastructure;
- renderer-neutral figure/surface composition suitable for future `@datapass/charts` integration;
- Knowledge Atlas surface backed by local `@datapass/knowledge` fixtures;
- official source/version/status/verified metadata;
- deterministic local ChangeEvent -> impacted knowledge entry resolution;
- one fixture-driven column-level lineage scene;
- optional Challenge diagnostics/analysis extension point for future code tools.

## What v1.1 explicitly must NOT build

- no D3 SDK v2 refactor;
- no GeoStory/world-map framework implementation;
- no Power BI custom visual overhaul;
- no universal chart grammar expansion;
- no arbitrary code execution/judge;
- no actual Airflow/Fabric/ADF/Lakeflow execution;
- no drag/drop pipeline builder;
- no full Data Forge backend/generator;
- no Web Components rewrite;
- no migration of every old website;
- no giant visual catalog expansion;
- no live source monitoring, RSS crawling, AI change classification or notifications;
- no DAX Formatter network integration;
- no SQL parser integration;
- no narrative article/movie/map renderer;
- no freehand/whiteboard implementation.

## Read order for Codex

Read these files in order before editing source:

1. `CODEX_MASTER_PROMPT.md`
2. `V1_1_DELTA.md`
3. `PLATFORM_SCOPE_AND_BOUNDARIES.md`
4. `V1_VS_V2_BOUNDARY.md`
5. `V1_IMPLEMENTATION_PLAN.md`
6. `TARGET_ARCHITECTURE.md`
7. `CONCEPTMOTION_PRODUCT_CONTRACT.md`
8. `SEMANTIC_MOTION_SPEC.md`
9. `DESIGN_SYSTEM_DIRECTION.md`
10. `FLUENT2_INTEGRATION.md`
11. `SHARED_UI_COMPONENTS.md`
12. `I18N_AND_LANGUAGE.md`
13. `KNOWLEDGE_ATLAS.md`
14. `CONTENT_AND_CHANGE_CONTRACT.md`
15. `ICON_REGISTRY_CONTRACT.md`
16. `CHALLENGE_WORKBENCH.md`
17. `CODE_INTELLIGENCE_ADAPTERS.md`
18. `ORCHESTRATION_WORKBENCH.md`
19. `WORKFLOW_SPEC.md`
20. `FUTURE_NARRATIVE_STORY_AND_GEOSTORY.md`
21. `D3_SDK_V2_BRIDGE_AND_ROADMAP.md`
22. `D3_GEOSTORY_V2.md`
23. `POWERBI_D3_V2.md`
24. `PLATFORM_ROADMAP_V11.md`
25. `VISUAL_STYLE_VARIANTS.md`
26. `GOLD_STANDARD_SCENES.md`
27. `ACCEPTANCE_CRITERIA.md`
28. `MIGRATION_AND_SCOPE.md`
29. `REFERENCE_AUDIT_V11_IDEAS.md`
30. `project/conceptmotion_studio/AUDIT.md`

Then inspect the existing project source before moving files or changing APIs.

## Required return from Codex

Return the completed repository plus:

- `V1_TEST_REPORT.md` - exact commands and actual results;
- `V1_AUDIT_SELF_REVIEW.md` - limitations, shortcuts and unfinished items;
- `V1_MIGRATION_LOG.md` - major moves/API compatibility decisions;
- `V1_API_SURFACE.md` - public core/svg/react/ui exports and short examples;
- production build output verified locally;
- screenshots or browser-smoke evidence for the major required surfaces if the environment permits.

Do not claim a feature is complete if it was not tested.
