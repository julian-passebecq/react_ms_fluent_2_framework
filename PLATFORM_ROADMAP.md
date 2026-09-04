# Datapass Visual Platform roadmap

This roadmap separates the immediate Codex task from future work. Version numbers describe the platform release train, not necessarily every consumer product's marketing version.

## V1.0 - Foundation (THIS CODEX PASS)

Primary objective: create stable reusable boundaries and prove them with high-quality working surfaces.

### Shared UI

- React + TypeScript + Fluent 2 foundation;
- AppShell/Catalog/Workbench/Explainer/Challenge archetypes;
- renderer-neutral FigureFrame/VisualizationSurface;
- light professional custom theme;
- EN/NO application-chrome infrastructure;
- responsive/accessibility baseline.

### ConceptMotion

- pure semantic core;
- stable IDs;
- state/transition planner;
- family renderer registry;
- reusable table/algorithm/diagram primitives;
- node/group/port/edge infrastructure;
- meaningful flow semantics;
- six gold scenes;
- React adapter;
- deterministic SVG export/freeze.

### Learning

- Challenge Workbench;
- Monaco Code/Solution/Compare;
- optional ConceptMotion Visualize tab;
- local progress/drafts;
- no runtime execution.

### Orchestration

- generic WorkflowSpec;
- Airflow/Fabric-ADF/Lakeflow presentation presets;
- topology/run playback/inspector;
- Monaco JSON playground;
- no actual pipeline execution.

### D3 SDK

- read/reference only;
- define clean bridge/extension contracts;
- do NOT implement D3 SDK v2.

### Data Forge

- consumer contract only;
- do NOT build Forge backend/generator.

---

## V1.1 - Foundation hardening

Do after the V1 audit if necessary.

- fix API inconsistencies found in V1 audit;
- visual regression suite;
- more complete reduced-motion/a11y coverage;
- package export cleanup;
- compatibility/migration helpers for older ConceptMotion scenes;
- improved docs/examples;
- migrate selected existing websites to prove shared UI reuse;
- publish-ready package boundaries if desired.

No major new visual grammar should be added until V1 APIs are stable.

---

## V2.0 - D3/Power BI + GeoStory expansion

Primary objective: evolve the existing D3 generator into a reusable `@datapass/charts` SDK while preserving its framework-independent architecture.

### D3 analytical/editorial grammar

- annotation grammar;
- direct-label engine;
- highlight grammar;
- facets/small multiples;
- layers/reference lines/reference bands;
- number/date/percent/currency format grammar;
- basic transforms (filter/sort/rank/aggregate/rolling/normalize/top-N);
- high-value chart families rather than hundreds of demos;
- publisher-inspired STRUCTURAL presets (Economist/BBC/FT-inspired + neutral professional);
- web/Power BI/social/presentation output profiles.

### Power BI first-class adapter

Correct the current exporter architecture so Power BI uses the SAME D3 rendering engine as web/React rather than a duplicated mini renderer.

Add:

- DataView -> canonical ChartSpec adapter;
- generated data roles/mappings;
- selection IDs/cross-filtering/highlights;
- native Power BI tooltips;
- formatting model;
- report-theme vs editorial-preset modes;
- high contrast/keyboard support;
- generated `pbiviz` project source.

### GeoStory / temporal maps

Factor difficult animated world/city visualizations into reusable grammar:

- temporal geographic events;
- flow maps;
- transport/route maps;
- projection/camera/world-tour controller;
- playback/scrub/window/cumulative modes;
- event pulse/ripple/fade/trail;
- geographic focus/zoom;
- narrative story steps;
- annotations;
- event selection/tooltips;
- AI-friendly GeoStorySpec.

Example derivations from the same grammar:

- earthquakes;
- Nobel prizes;
- scientific discoveries;
- launches/deployments;
- migrations/trade;
- transport incidents/statuses;
- historical or public-event timelines.

### ConceptMotion integration

- optional chart/GeoStory embedding inside explainer scenes;
- ConceptMotion controls pedagogical sequence;
- `@datapass/charts` owns analytical/geospatial geometry.

---

## V2.1 - Product adoption

### Data Forge

- Forge emits WorkflowSpec;
- Forge emits ConceptMotion transformation/model/lineage scenes;
- Forge emits ChartSpec when analytical preview is useful;
- use shared Workbench/Inspector/Monaco surfaces;
- generated Airflow/Fabric/Lakeflow artifacts link to the same semantic workflow model.

### Challenge trainer

- migrate more existing exercises;
- add original exercises derived from concepts rather than republishing paid training material;
- more language variants;
- more ConceptMotion explanations;
- optional static syntax diagnostics per language.

### Cloud/BI learning sites

- replace ad-hoc DAG/lineage/chart components with shared libraries.

---

## V3.0 - Authoring and scale

Only after the specs and renderers are stable.

Potential work:

- visual spec editor/inspector;
- controlled drag/drop workflow layout editing;
- reusable story/tour authoring;
- Canvas backend for high-volume geo/network scenes;
- temporal force networks;
- advanced hierarchy transitions;
- morph transitions;
- Web Components adapter;
- Python spec wrapper for notebooks;
- universal/editorial Power BI visual if the generated-project approach proves stable.

Avoid implementing these early because they multiply API constraints.

---

## V4+ - Ecosystem/tooling

Possible later capabilities:

- AI prompt-to-spec tooling;
- Chart Doctor / deterministic recommendation engine;
- template marketplace/catalog;
- Power BI packaging automation;
- screenshot/export service;
- presentation/PPTX export adapters;
- shared cloud icon packs and provider presets;
- optional collaboration/versioning tools.

These are not prerequisites for the current foundation.
