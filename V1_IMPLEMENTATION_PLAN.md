# Foundation v1.1 implementation plan

This is the recommended implementation order. Codex may adjust file-level sequencing, but should preserve the dependency order and scope.

## Phase 0 - Audit before refactor

1. Run existing offline tests.
2. Run the current production build if dependencies can be installed.
3. Inspect current scene schema, renderer registry, timeline behavior and legacy compatibility.
4. Record baseline problems in `V1_MIGRATION_LOG.md`.
5. Do not move files blindly before understanding current import relationships.

## Phase 1 - Workspace/package boundaries

Create/stage the package boundaries:

- `core`;
- `svg`;
- `react`;
- `ui`;
- `knowledge` (pure TS source/content/change contracts);
- `studio` app.

Move only enough code to make the boundaries real. Preserve compatibility adapters for existing scene examples where practical.

Success condition: `core` has no React/DOM/Fluent/Monaco dependency.

## Phase 2 - Semantic state + stable identity

Implement:

- stable entity IDs;
- semantic state model;
- state diff/transition planner;
- deterministic frame compilation;
- pure semantic operations for filter/sort/join/flow/workflow state.

Prove with tests before visual polish.

## Phase 3 - SVG/diagram primitives

Implement/extract:

- tables/rows/cells;
- node types;
- groups/containers;
- ports/anchors;
- deterministic layout contract;
- edges/routes/markers;
- selection/focus;
- flow overlays/status overlays;
- renderer family registry;
- semantic icon ID/resolver boundary with generic fallback.

Do not yet add D3 SDK chart/geostory renderers.

## Phase 4 - React + Fluent shell

Add:

- Fluent theme;
- AppShell;
- Catalog shell;
- Workbench;
- Explainer;
- renderer-neutral FigureFrame/VisualizationSurface;
- compact professional navigation;
- EN/NO infrastructure.

Keep the UI serious and concise.

## Phase 5 - Gold ConceptMotion scenes

Polish the six core scenes:

1. filter/sort;
2. join fan-out;
3. loop;
4. statistics/ML;
5. cloud/data flow;
6. lineage/data model.

These should be high quality before broad catalog work.

## Phase 6 - Orchestration Workbench

Implement:

- generic WorkflowSpec validation;
- topology renderer;
- run-state playback;
- Airflow preset;
- Fabric/ADF preset;
- Lakeflow-oriented preset;
- task inspector;
- nested group breadcrumb/focus;
- JSON spec playground demo.

No actual pipeline runtime.

## Phase 7 - Challenge Workbench

Implement:

- problem catalog;
- Description/Visualize/Hints progressive disclosure;
- Monaco Code/Solution/Compare;
- draft persistence;
- mastered/flag/review state;
- one polished SQL challenge using ConceptMotion visualization.

No code execution.

## Phase 8 - Knowledge Atlas + source/change foundation

Implement:

- `@datapass/knowledge` types/validation/helpers;
- Knowledge Atlas shared UI shell;
- local source/feature/knowledge/change fixtures;
- deterministic ChangeEvent -> impacted entry resolution;
- one source-linked bilingual-ready technical article demo;
- one embedded ConceptMotion figure;
- one fixture-driven column-level lineage scene;
- optional Challenge diagnostics/analysis extension slot.

No live fetch/crawler/parser/service integration.

## Phase 9 - Accessibility/responsive/export

Verify:

- keyboard focus;
- reduced motion;
- textual fallbacks;
- no horizontal overflow;
- mobile layout;
- deterministic SVG freeze/export;
- cleanup of timers/simulations/transitions.

## Phase 10 - V2 readiness review

Before finishing, verify that:

- FigureFrame can host a non-ConceptMotion renderer;
- renderer registry is extensible by family;
- theme metadata is semantic rather than hardwired to one UI library;
- locale handling is generic;
- Data Forge can consume WorkflowSpec later;
- nothing in v1.1 forces the future D3 SDK to become React-only;
- no Power BI host logic has leaked into ConceptMotion core.

Do NOT implement the D3 v2 work during this phase.
