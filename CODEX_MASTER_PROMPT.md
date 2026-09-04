# CODEX MASTER PROMPT - Datapass Visual Platform Foundation v1.1

You are receiving an existing ConceptMotion Studio prototype, a Fluent-oriented application architecture, Challenge/Workflow/Knowledge workbench requirements, Data Forge integration notes, source/change metadata requirements, and a read-only snapshot of the user's separate D3 visualization SDK.

Your task is to implement the FIRST reusable platform foundation. Do not turn this pass into a rewrite of every project.

## 1. Mission

Build a credible reusable foundation that future products can consume:

- ConceptMotion Studio;
- Data Forge;
- the data-engineering/LeetCode learning site;
- cloud/data architecture learning sites;
- source-aware technical documentation and future generated books;
- future analytical D3/Power BI products.

The key principle is separation of concerns:

```text
Application UI                         Analytical charts (future v2)
React + Fluent 2                       existing D3 SDK / @datapass/charts
        |                                      |
        |                                      |
        +----------- renderer-neutral --------+
                    figure surfaces
                           |
                   ConceptMotion React
                           |
                    ConceptMotion SVG
                           |
                   ConceptMotion Core
```

ConceptMotion explains state, causality, algorithms, data transformations and workflows.
The D3 SDK handles portable analytical/editorial charts and difficult geographic visualizations. It remains a sibling library.

## 2. Non-negotiable architecture

### Application stack

Use:

- React;
- TypeScript for reusable new library code;
- Vite;
- `@fluentui/react-components` (Fluent v9 / Fluent 2);
- Fluent icons;
- Monaco only at the application layer;
- D3 7 for SVG geometry/interpolation/layout where appropriate.

Do not introduce another primary UI system.

### Package direction

Migrate incrementally toward:

```text
packages/
  core/       pure TS, no DOM/React/Fluent/Monaco
  svg/        framework-independent SVG/D3 renderers
  react/      thin React adapter/hooks/components
  ui/         @datapass/ui - Fluent application composites
  knowledge/  @datapass/knowledge - pure TS source/content/change contracts
apps/
  studio/     catalog/workbench/explainer/challenge/workflow/knowledge/spec demos
```

Required dependency direction:

```text
core <- svg <- react <- studio
                  ^        ^
                  |        |
             datapass/ui   knowledge
```

`knowledge` is pure TypeScript and independent of renderer/UI/network concerns.

If moving every file immediately would create risk, stage the migration. The dependency boundaries must nevertheless be real by the end of the pass.

### Core restrictions

`core` MUST NOT import:

- React;
- Fluent;
- Monaco;
- `document`, `window`, SVG DOM APIs;
- application-specific screens.

Core owns semantics, types, validation, state transitions and deterministic compilation only.

## 3. ConceptMotion product behavior that must remain

Do not simplify ConceptMotion into static diagrams.

It exists to support:

- tables whose rows physically move through filter/sort/join/group/dedup/window operations;
- loops with current iteration/pointer/variable state;
- arrays, stacks, queues, trees and graph traversal;
- statistics/ML explanation (for example regression, clustering, distributions, gradient descent);
- DAGs, lineage, star schemas and cloud architecture;
- distinct data-flow semantics for batch, streaming, CDC, control flow and failures;
- orchestration run-state animation;
- play/pause/previous/next/scrub/speed;
- hover/focus/click/pin when they improve understanding;
- reduced-motion equivalents.

Motion must encode meaning. No decorative perpetual movement.

## 4. Stable semantic identity is a v1 priority

The existing prototype has redraw-heavy patterns. Fix the architectural cause.

Required:

- stable IDs for rows, cells, nodes, ports, edges, tasks, annotations and algorithm objects;
- semantic state snapshots;
- state diff/transition planning;
- keyed enter/update/exit where continuity matters;
- deterministic state compilation from the same spec;
- cleanup for timers/transitions/simulations;
- pure testable semantic calculations separated from rendering.

A row that survives a filter is the same semantic row before and after. A task that changes from queued to running is the same task.

## 5. Semantic authoring language

AI-authored scenes must express domain meaning rather than primarily screen coordinates.

Good:

```json
{"action":"filter","target":"orders","predicate":"status == 'late'"}
```

```json
{"action":"join","left":"orders.customer_id","right":"customers.id","joinType":"left"}
```

```json
{"action":"flow","from":"bronze","to":"silver","flowKind":"stream"}
```

```json
{"action":"setTaskState","task":"transform_sales","state":"running"}
```

Coordinates may exist as optional hints/overrides, but they must not be the primary grammar for ordinary scenes.

## 6. Diagram infrastructure to implement

Replace bespoke cloud/DAG SVGs with reusable primitives:

- node type registry;
- group/container/boundary nodes;
- ports/anchors;
- deterministic layout contract;
- edge routing contract;
- markers/arrowheads;
- labels/badges/state indicators;
- selection/focus/hover state;
- animated overlays/particles tied to semantic flows;
- status transitions;
- textual fallback summaries.

### Required flow kinds

At minimum support semantically distinct:

- `data-batch`;
- `data-stream`;
- `cdc`;
- `control`;
- `success`;
- `failure`;
- `completion`;
- `skip`.

Do not distinguish them by color alone. Use line style, markers, motion/pattern and labels as appropriate.

## 7. Workflow/orchestration model

Build ONE generic WorkflowSpec and ONE workflow semantic engine.

Provider-oriented presentation presets may resemble:

- Airflow DAG graph/grid concepts;
- Microsoft Fabric / Azure Data Factory pipeline canvas concepts;
- Databricks Lakeflow Jobs task graph concepts.

Do not fork the semantic model per provider.

Required concepts:

- tasks/activities;
- task groups/nested containers;
- dependencies;
- dependency condition;
- deterministic run states;
- queued/running/success/failed/retry/skipped/upstream-failed as applicable;
- branch/fan-out/fan-in;
- selected task inspector;
- nested-group focus + breadcrumb;
- playback through a synthetic run;
- topology-only mode;
- JSON validation.

No actual orchestration execution/deployment.

## 8. Challenge Workbench

Build the shared LeetCode-like learning shell, but keep it deliberately simpler than the existing overloaded trainer.

### Left pane

Tabs:

- Description;
- Visualize;
- Hints;
- Notes if useful.

Initial view should be Description, not a permanently visible animation.

### Right pane

Modes:

- Code;
- Solution;
- Compare.

Use Monaco for learner draft, read-only solution and diff.

### Required v1 behavior

- problem title/domain/difficulty/tags;
- schema/input/example/expected output;
- starter code;
- local draft persistence;
- reset starter code;
- optional ConceptMotion scene in Visualize;
- progressive hints;
- reveal reference solution;
- Monaco diff learner vs reference;
- mastered/flag/review status persisted locally;
- problem next/previous;
- problem catalog/search/filter.

### Languages to model

The content model must be capable of variants for:

- Python;
- pandas;
- PySpark;
- SQL;
- T-SQL;
- BigQuery SQL;
- DAX;
- C# / Tabular Editor scenarios;
- PowerShell;
- Bash/Linux basics.

Not every challenge needs every language.

### Explicitly no runtime

Do NOT build:

- arbitrary code execution;
- remote judge;
- database runtime;
- Spark backend;
- terminal;
- containers for execution.

Editor diagnostics may offer syntax assistance where available, but the UI must never imply syntax checks prove semantic correctness.

## 9. Fluent 2 application UI

Use Fluent primitives instead of rebuilding controls.

Shared contextual composites may include:

- AppShell;
- TopBar;
- SideNav;
- PageHeader;
- CatalogShell;
- SearchFilterBar;
- Workbench/SplitPane;
- InspectorPanel;
- FigureFrame / VisualizationSurface;
- TimelineControls;
- ChallengeShell;
- WorkflowWorkbenchShell;
- SpecPlaygroundPanel;
- language toggle;
- KnowledgeShell / DocsNavigation / OnThisPage / source-status-freshness composites.

Do NOT wrap every Fluent Button/Input/Tab/Menu just to create an abstraction.

### Visual direction

Use a restrained custom theme influenced by the user's portfolio/FabricStack organization:

- light background;
- compact controls;
- subtle neutral borders;
- little or no shadow;
- one restrained accent;
- strong alignment;
- concise content;
- immediate useful interface rather than giant hero sections.

The colorful Fluent marketing homepage is a quality reference, not the default aesthetic.

## 10. Renderer-neutral figure surfaces - IMPORTANT FOR V2

Foundation v1.1 must not assume every figure is ConceptMotion.

`FigureFrame` / `VisualizationSurface` must be able to host arbitrary renderer content while still providing:

- title;
- subtitle;
- takeaway/annotation metadata;
- source/note;
- accessible fallback;
- responsive sizing;
- export action slot;
- toolbar/action slot.

This is the bridge that will later host `@datapass/charts` (the separate D3 chart SDK) without redesigning application pages.

Do not import the D3 SDK into v1 unless a tiny reference-only adapter is truly necessary. Prefer architecture readiness over scope expansion.

## 11. Renderer registry extensibility

Split the renderer registry by family and make registration/extensibility explicit.

The SVG package should not require editing one giant switch every time a new renderer family is added.

A future v2 must be able to add families such as chart/geostory integration without rewriting the core registry.

Keep this lightweight. Do not build a plugin marketplace.

## 12. Editorial figure contract

Figures should use BBC/Economist-like discipline:

- message-first title where useful;
- concise subtitle;
- direct labels where possible;
- minimal grid/chrome;
- restrained context color;
- annotations near the object they explain;
- explicit units;
- source/note footer;
- no gratuitous 3D/gradients.

This is an editorial grammar influence, not a trademark clone.

## 13. EN/NO language infrastructure

Implement small i18n now so future products do not need another shell refactor.

Required:

- `LocaleProvider` or equivalent;
- supported locales `en` and `no`;
- local persistence;
- reusable compact toggle similar in spirit to the user's portfolio;
- localized application strings;
- optional localized content values with English fallback;
- toggle visibility configurable by app/page.

Do not attempt to translate the entire challenge catalog or all technical content.

Challenges may hide the toggle if no Norwegian content exists.

Never translate code, identifiers or technology names.

## 14. Spec playground

Use Monaco to create a small JSON playground for ConceptMotion scene/workflow specs.

Required:

- validation;
- readable validation messages;
- live preview after valid changes (debounced is fine);
- reset example;
- copy/export JSON;
- no drag/drop authoring.

## 15. Required v1 gold surfaces

Implement/polish these to a convincing standard:

1. Table filter/sort - rows preserve identity.
2. Join fan-out - stable rows visibly connect/duplicate into output.
3. Programming loop - code/current iteration/variable state synchronized.
4. Statistics/ML explainer - one real example.
5. Cloud/data pipeline - Source -> Bronze -> Silver -> Gold -> BI with meaningful flow kinds.
6. Data model/lineage - nodes, ports, routed edges, selection.
7. Airflow-style workflow run - generic WorkflowSpec.
8. Fabric/ADF-style pipeline - same workflow semantic engine.
9. Lakeflow-oriented workflow - same workflow semantic engine.
10. Challenge demo - preferably a SQL join/window problem with optional ConceptMotion visualization and Monaco compare.
11. Catalog + Workbench + Explainer + Challenge shell.
12. JSON spec playground.
13. One bilingual application-chrome demonstration.
14. Knowledge Atlas demo - source-linked article, embedded ConceptMotion figure, version/status/verified metadata and local ChangeEvent -> needs-review state.
15. Column-level lineage demo - fixture-driven parsed lineage JSON compiled/rendered without implementing a SQL parser.

Do not expand to hundreds of scenes before these are good.

## 16. D3 SDK boundary - DO NOT IMPLEMENT V2 NOW

The supplied D3 v7 reference proves a separate SDK direction. It already factorizes hard D3 behaviors including playback, path draw, zoom and particles, plus advanced patterns such as bar race, force graph, hierarchy packing and flow maps.

Foundation v1.1 must NOT rewrite or absorb this SDK.

The future v2 will handle:

- editorial chart grammar expansion;
- same-renderer Power BI adapter;
- annotations/facets/highlights;
- geographic event/story grammar;
- projection/world-tour controller;
- temporal incident/event maps;
- flow maps;
- publisher-inspired structural presets;
- chart doctor/recommendation logic;
- eventual ConceptMotion chart embedding.

Read `D3_SDK_V2_BRIDGE_AND_ROADMAP.md` and `D3_GEOSTORY_V2.md` and ensure v1 extension points do not block that future.

## 17. Data Forge boundary

Data Forge is a downstream consumer.

Do not build its backend/generator in this pass.

Prepare reusable contracts so Forge can later provide:

- generated WorkflowSpec;
- ConceptMotion scenes for transformations/data models/lineage;
- future ChartSpec from the D3 SDK;
- shared Fluent workbench UI.

## 17A. Knowledge Atlas and source/change foundation - v1.1

Read `V1_1_DELTA.md`, `KNOWLEDGE_ATLAS.md` and `CONTENT_AND_CHANGE_CONTRACT.md`.

Implement a fifth reusable application archetype: **Knowledge Atlas**. It must be a professional source-aware documentation/reference page, not a blog/CMS.

Required v1.1 behavior:

- create `@datapass/knowledge` as pure TypeScript if practical, otherwise a clearly isolated future-package module with identical dependency rules;
- model/validate `KnowledgeEntry`, `SourceRef`, `FeatureRef`, `ChangeEvent`, `ImpactRef`, and freshness/status metadata;
- deterministic fixture-only change impact resolution using stable feature IDs;
- Knowledge Atlas Studio demo with local data, official source links, status/version/verified metadata, optional EN/NO prose, embedded `FigureFrame`, and a visible needs-review state after a local ChangeEvent;
- extend lineage semantics for optional column-level source/target/derivation metadata and render one fixture-driven example;
- keep a clean optional diagnostics/analysis output slot in Challenge Workbench for future static/external code tools;
- establish the semantic icon registry/resolver boundary in `ICON_REGISTRY_CONTRACT.md` so specs reference stable icon IDs instead of file paths.

Do NOT implement source collection, web crawling, RSS, notifications, DAX network formatting, SQL parsing, AI update classification or automatic book rewriting.

`FUTURE_NARRATIVE_STORY_AND_GEOSTORY.md` and the narrative JSON schema are V2 references only. Do not implement article/film/world-map storytelling now.

## 18. Testing requirements

At minimum:

### Unit/semantic

- filter/sort/join state compilation;
- stable identity;
- transition planning;
- workflow validation/reference integrity;
- workflow run-state progression;
- flow-kind semantics;
- locale fallback/persistence helpers where pure logic exists.

### Browser/runtime

- all required gold surfaces render;
- play/pause/step/scrub;
- challenge reveal/diff/local persistence;
- workflow topology/playback/inspector;
- spec playground validation/preview;
- EN/NO shell toggle;
- reduced-motion mode;
- keyboard focus;
- desktop and phone smoke;
- no page-level horizontal overflow;
- Knowledge Atlas navigation/source/freshness display;
- deterministic ChangeEvent impact resolution;
- column-lineage fixture rendering.

### Build

- lockfile committed;
- production build passes;
- no broken local imports;
- deterministic SVG freeze/export where required.

Use screenshot/visual regression testing if practical. If unavailable, document the limitation honestly.

## 19. Scope guardrails

Do NOT build in this pass:

- D3 SDK v2;
- world-map story framework;
- Power BI custom visual overhaul;
- universal analytical chart library;
- actual code execution;
- pipeline runtimes;
- drag/drop pipeline designer;
- free-form whiteboard;
- Web Components adapter;
- Canvas renderer;
- universal Power BI visual;
- complete Python package;
- every old-site migration;
- all 186+ ConceptMotion scenes;
- live news/doc monitoring or crawling;
- automatic AI documentation rewriting;
- DAX Formatter service calls;
- SQL parser integration;
- article/movie narrative-map renderer;
- freehand/whiteboard editor.

## 20. Required deliverables

Before finishing, create:

- `V1_TEST_REPORT.md` with actual commands/results;
- `V1_AUDIT_SELF_REVIEW.md` with known limitations;
- `V1_MIGRATION_LOG.md`;
- `V1_API_SURFACE.md`;
- updated README and architecture docs;
- working production build.

The objective is not maximum feature count.

The objective is a stable, reusable visual-learning platform foundation that makes the next D3/Power BI/Data Forge work easier rather than harder.
