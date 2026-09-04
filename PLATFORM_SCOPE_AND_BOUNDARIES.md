# Platform scope and boundaries

The user has several related projects, but they should not collapse into a single codebase with mixed responsibilities.

## Umbrella: Datapass Visual Platform

Conceptually, the ecosystem is:

```text
Datapass Visual Platform
|
+-- @datapass/ui
|   Fluent 2 application shells and recurring composites
|
+-- ConceptMotion
|   semantic explanatory animation and technical diagrams
|
+-- @datapass/knowledge
|   source-aware content, feature/version metadata and change-impact contracts
|
+-- @datapass/charts   [future v2; existing D3 SDK evolves into this]
|   analytical/editorial D3 chart grammar and Power BI adapters
|
+-- product consumers
    +-- ConceptMotion Studio
    +-- Data Forge
    +-- Challenge/LeetCode trainer
    +-- Cloud/architecture learning sites
    +-- Knowledge/documentation sites
    +-- future BI/Power BI generators
```

These are related through contracts and shared design language, not by forcing every feature into one package.

## 1. `@datapass/ui`

Purpose: reusable professional product UI.

Owns:

- Fluent theme/presets;
- AppShell/TopBar/SideNav;
- Catalog/Workbench/Explainer/Challenge layout composites;
- inspector/panel composition;
- FigureFrame / renderer-neutral visualization surface;
- EN/NO toggle and application-level locale support;
- generic empty/error/loading states.

Does not own:

- D3 geometry;
- ConceptMotion semantics;
- chart grammar;
- workflow scheduling semantics;
- Power BI host APIs.

## 2. `@datapass/knowledge`

Purpose: pure source/content/change metadata contracts for technical documentation and future update impact analysis.

Owns:

- knowledge entry metadata;
- official/expert/community/internal source references;
- product/feature identities;
- lifecycle/version/verified metadata;
- normalized change events;
- deterministic feature-ID based impact resolution.

Does not own:

- React page rendering;
- source crawling/RSS collection;
- AI summarization;
- notifications;
- book/PDF generation.

## 3. ConceptMotion

Purpose: explain how technical/data/programming concepts change over time or state.

Owns:

- semantic scene spec;
- stable entities;
- timeline/state compilation;
- transition planning;
- tables/rows/algorithms;
- nodes/ports/edges/groups;
- workflow/DAG semantics;
- animated data/control flow;
- pedagogical annotations;
- SVG renderer and React adapter.

Examples:

- filter/join/window visualization;
- loops and algorithms;
- regression explanation;
- star schema/lineage;
- Airflow/Fabric/Lakeflow run explanation.

## 4. D3 SDK / future `@datapass/charts`

Purpose: portable analytical/editorial charts and difficult geographic/data-story visualizations.

Owns in future v2:

- canonical ChartSpec;
- line/bar/scatter/distribution/ranking/flow/maps;
- editorial themes/presets;
- annotations/facets/highlights;
- geographic event timelines and world stories;
- cross-runtime adapters;
- first-class Power BI custom visual generation;
- React/web/notebook adapters.

It should remain framework-independent at the rendering core.

## 5. Data Forge

Purpose: generate realistic data projects and artifacts.

Consumes the platform but does not define its primitives.

Forge can later emit:

- WorkflowSpec -> ConceptMotion workflow renderer;
- data-model/lineage specs -> ConceptMotion;
- ChartSpec -> `@datapass/charts`;
- generated code/specs -> Monaco/shared Workbench.

## 6. Challenge trainer

Purpose: practice skills through problems.

Consumes:

- `@datapass/ui` Challenge Workbench;
- Monaco;
- optional ConceptMotion visual explanations.

It is not a code-execution platform in Foundation v1.1.

## Why D3 maps are a sibling, not a ConceptMotion feature

A temporal world map of earthquakes, Nobel prizes, launches, incidents or migration is primarily a data-visualization grammar problem:

- projection;
- geographic layers;
- temporal filtering/playback;
- event glyphs;
- route geometry;
- map zoom/camera;
- high-volume rendering;
- Power BI adaptation.

ConceptMotion may later orchestrate or embed such a chart during a teaching sequence, but it should not become the owner of general geospatial chart grammar.

This boundary keeps both libraries smaller and more coherent.

## Shared contracts across libraries

The platform should align on concepts without forcing imports between unrelated cores:

### Visual metadata

- title;
- subtitle;
- takeaway;
- source;
- note;
- units;
- accessibility summary.

### Theme semantics

- background/surface;
- foreground/muted;
- grid/border;
- accent;
- categorical palette;
- status semantics;
- typography/density profile.

### Lifecycle expectations

- deterministic mount/update;
- cleanup;
- reduced motion;
- responsive container sizing;
- stable IDs where interaction exists;
- SVG export when supported.

### Locale

- `en` / `no` application strings;
- optional localized content;
- English fallback.

These contracts make integration possible without creating a monolithic framework. Knowledge Atlas is an application archetype built from `@datapass/ui` + `@datapass/knowledge` + renderer-neutral figures, not a new visualization core.
