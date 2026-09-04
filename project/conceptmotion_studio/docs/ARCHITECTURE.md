# Foundation v1.1 architecture

Foundation v1.1 is a set of contracts between semantic models, SVG rendering, React lifecycle, Fluent application layout, and source-aware content. The Studio is a consumer of those contracts; it is not the library boundary.

## Dependency direction

```text
apps/studio (React + Fluent + Monaco)
  |---> @conceptmotion/core (pure TS)
  |---> @conceptmotion/react ---> @conceptmotion/svg ---> @conceptmotion/core
  |---> @datapass/ui ---> React + Fluent peers
  `---> @datapass/knowledge (pure TS)

legacy src/  --- preserved side-by-side; not imported by the v1.1 packages
```

Allowed package dependencies are deliberately narrow:

- `@conceptmotion/core` and `@datapass/knowledge` have no workspace dependencies and no React, Fluent, Monaco, DOM, fetch, crawler, AI, D3, or host API dependency.
- `@conceptmotion/svg` depends only on `@conceptmotion/core`. It targets the browser SVG DOM but does not depend on React or Fluent.
- `@conceptmotion/react` depends on core and SVG and declares React/React DOM as peers.
- `@datapass/ui` declares React, React DOM and Fluent v9 as peers. It does not import ConceptMotion semantics.
- `apps/studio` may compose every Foundation package. No package imports from the app.

The boundary audit in `scripts/check-boundaries.mjs` enforces the important negative dependencies.

## Semantic pipeline

```text
versioned semantic spec
        |
        v
pure validation / compilation
        |
        +--> SemanticSnapshot --stable entity IDs--> TransitionPlan
        |
        v
renderer input adapter
        |
        v
SVG renderer: mount -> keyed update -> freeze or destroy
        |
        v
thin React host -> renderer-neutral FigureFrame -> Studio surface
```

Semantic specs describe entities, relationships, state, ordering, and intent. Coordinates and SVG details stay in the rendering layer. A row, task, point, or lineage relation keeps its semantic ID when its display position or state changes, allowing transition planning and keyed updates to communicate causality.

## `@conceptmotion/core`

Core provides the framework-independent model:

- semantic entities, snapshots, scene frames and stable-ID transition plans;
- deterministic table filter, stable sort, relational join and action compilation;
- loop and regression frame compilation;
- reusable diagram nodes, groups, ports, edges and reference-integrity validation;
- one provider-neutral `WorkflowSpec`, deterministic cumulative run frames, status-transition validation and presentation preset metadata;
- asset- and column-level `LineageSpec`, including optional statement/change kinds and source spans, without parsing SQL;
- semantic flow kinds with line, marker, motion and non-color-cue metadata;
- semantic icon IDs with registry-owned assets/glyphs and generic fallback chains;
- EN/NO-compatible localized values, deterministic JSON and reusable validation results.

`DiagramLayoutContract` and `WorkflowLayoutContract` are extension interfaces. Concrete SVG layout is owned by the SVG package.

## `@conceptmotion/svg`

SVG provides the framework-independent rendering lifecycle:

```ts
interface SvgRenderer<Input> {
  mount(host: SVGSVGElement, input: Input, options?: RenderOptions): void;
  update(input: Input, options?: RenderOptions): void;
  destroy(): void;
  freeze(options?: FreezeOptions): string;
}
```

`RendererRegistry` supports registration, replacement, removal, family filtering, and typed creation. The default registry contains seven IDs:

| Renderer ID | Family | Input |
| --- | --- | --- |
| `table.transform` | table | A core-compiled table state |
| `table.join` | join | Join spec/result and optional reveal count |
| `algorithm.loop` | loop | Loop spec and compiled frame |
| `statistics.regression` | regression | Regression spec and compiled frame |
| `diagram.flow` | diagram | Diagram spec plus focus/active/failure overlays |
| `lineage.model` | lineage | Lineage spec plus active relations |
| `workflow.topology` | workflow | Workflow topology or compiled run-frame overlay |

Renderers update owned SVG nodes by stable keys. `destroy()` removes renderer-owned nodes and handlers. Reduced motion forces zero transition duration, and `freeze()` returns canonical SVG with sorted attributes and runtime animation state removed by default.

Theme values are renderer-level semantic roles (`surface`, `ink`, `grid`, `accent`, status colors, flow colors, typography, density), not Fluent token imports.

## `@conceptmotion/react`

The React package does not calculate semantic meaning or layout. It:

- mounts, updates, destroys, and exposes an SVG renderer through `RendererHost`;
- resolves a semantic scene to the appropriate default renderer through `ConceptScene`;
- compiles/selects workflow run frames through the SVG adapter and hosts them through `WorkflowScene`;
- follows `prefers-reduced-motion` unless an explicit value is supplied;
- supplies text fallback/error behavior and selection callbacks.

React owns application state. The renderer exclusively owns the SVG subtree for its mounted lifetime.

## `@datapass/ui`

The UI package composes Fluent v9 controls into reusable application structures:

- shell/navigation/header;
- catalog, workbench, split pane and inspector;
- explainer, challenge and workflow shells;
- timeline and code-diagnostic controls;
- Knowledge Atlas navigation, source links and related-content patterns;
- status, feature, version, freshness and change-impact presentation;
- locale provider/toggle and guarded local storage helpers;
- `FigureFrame` and `VisualizationSurface`.

`FigureFrame` owns title, subtitle/takeaway, metadata, toolbar/actions, source/note, text fallback, and layout. Its child is arbitrary React content. The Catalog includes a plain SVG proof so a future chart renderer can use the same frame without importing ConceptMotion.

## `@datapass/knowledge`

Knowledge is a pure metadata package. Stable IDs connect:

```text
SourceRef -> FeatureRef <- ChangeEvent
                 |
                 v
           KnowledgeEntry -> figureIds / challengeIds
                 |
                 v
              ImpactRef
```

`resolveChangeImpact()` joins a change to entries strictly through `featureIds`, then returns sorted, deduplicated entry, figure, and challenge IDs. `computeFreshnessState()` combines verification time, relevant unreviewed changes, and an explicit staleness window. Validation checks referential integrity; serialization is deterministic.

The package never fetches a source. In v1.1 the Studio supplies local official-source references, feature/version/status values, a synthetic change event, and reviewed/unreviewed UI state.

## Shared workflow model

Airflow, Fabric Data Factory, Azure Data Factory, Databricks Lakeflow, and generic presentation use the same `WorkflowSpec`. A preset affects labels/presentation only. Nodes, groups, ports, conditions, data-flow kinds, cumulative run frames, status transitions, and stable IDs remain provider-neutral.

The Studio offers topology, synthetic run explanation, and a Monaco JSON playground. It renders the last valid parsed spec and reports validation errors; it never schedules or executes a pipeline.

## Column-lineage readiness

`LineageSpec` supports stable asset, column, endpoint, and relation IDs plus optional derivation/expression metadata and one-based source spans. The fixture demonstrates source columns feeding copied, derived, joined, and aggregated targets. This is an interchange/rendering boundary, not a SQL parser.

## Locale and accessibility

Core, knowledge, and UI use compatible `LocalizedText` shapes:

```ts
type LocalizedText = string | Partial<Record<'en' | 'no', string>>;
```

Resolution is requested locale, then English, then the first non-empty value, then an empty string. Application chrome and selected copy are localized; code and stable IDs are never translated.

Figures and renderer hosts expose text fallbacks. SVG headings provide accessible names/descriptions, selectable marks receive keyboard handlers, semantic flow kinds include non-color cues, and reduced motion preserves static step/scrub behavior.

## Compatibility boundary

The earlier `src` app, D3 renderers, catalog, scenes, sheets, schemas, examples, and Python helper remain intact. The legacy scene normalizer continues to accept flat scenes and canonical v1 scenes with renderer payload under `data`.

The seven v1.1 renderers are a focused new registry, not an automatic adapter for all 28 legacy renderer families. Migration can continue family by family after the semantic contract proves useful.

## Intentionally outside Foundation v1.1

- pipeline execution or drag/drop authoring;
- universal code execution/judging;
- live source collection, monitoring, notifications, or AI rewriting;
- DAX Formatter and SQL parser service integration;
- Data Forge backend/generator implementation;
- D3 SDK v2, analytical chart grammar, GeoStory/Narrative Story, or Canvas rendering;
- Web Components or Power BI adapter rewrite;
- full content translation.

These remain sibling or future consumer concerns rather than hidden dependencies in the Foundation packages.
