# Migration and scope

## Keep

- existing working ConceptMotion Studio as the behavioral/reference baseline;
- current scene catalog for compatibility;
- existing cloud/data-model/lineage generator research;
- useful renderer families while extracting stable semantics;
- current offline tests unless a migration is documented;
- supplied user media/visual references.

## Migrate incrementally

- JavaScript reusable library code -> TypeScript as touched;
- monolithic renderer registry -> family registries/explicit registration;
- redraw-heavy moving scenes -> stable keyed semantic transitions;
- ad-hoc app controls -> Fluent-based shared composites;
- one-off DAG/cloud layouts -> reusable node/port/edge/workflow infrastructure;
- product-specific locale strings -> small EN/NO application locale layer.

## Add in Foundation v1.1

- pure semantic core boundary;
- SVG/D3 framework-independent renderer boundary;
- thin React adapter;
- `@datapass/ui` Fluent application composites;
- renderer-neutral FigureFrame/VisualizationSurface;
- EN/NO locale infrastructure and optional toggle;
- Challenge Workbench using Fluent + Monaco + ConceptMotion;
- generic WorkflowSpec;
- Airflow/Fabric-ADF/Lakeflow presentation presets;
- deterministic workflow run playback;
- nested container/group support;
- JSON spec playground;
- stable entity identity/state diff/transition planning;
- six polished core ConceptMotion scenes;
- `@datapass/knowledge` pure TS content/source/change contracts;
- Knowledge Atlas archetype and local demo;
- deterministic local change-impact resolution;
- column-level lineage-ready semantics and one fixture demo;
- optional Challenge analysis/diagnostics extension slot.

## Read-only reference in Foundation v1.1

The D3 v7 SDK snapshot under `reference_material/d3viz_v7_reference/` is architectural reference only.

Foundation v1.1 should learn from its factorized motion/pattern approach but must not merge it into ConceptMotion.

## Explicitly NOT in Foundation v1.1

- D3 SDK v2 implementation;
- GeoStory/world-map story engine;
- D3 Power BI adapter rewrite;
- expanded universal editorial chart grammar;
- actual code execution/judge;
- terminal/backend runtime;
- actual Airflow/Fabric/ADF/Lakeflow deployment/runtime;
- drag/drop pipeline authoring;
- full Data Forge implementation;
- Web Components adapter;
- Canvas renderer;
- universal Power BI visual;
- full free-form whiteboard;
- migration of every old website;
- completion of all ConceptMotion catalog concepts;
- translation of all content into Norwegian;
- live source monitoring/RSS crawling/alerts;
- AI documentation rewriting;
- DAX Formatter service calls;
- SQL parser integration;
- narrative article/movie GeoStory renderer;
- real handwriting/whiteboard implementation.

The goal is a credible reusable foundation that Data Forge, the coding trainer, architecture/learning sites and future D3/Power BI work can consume next.
