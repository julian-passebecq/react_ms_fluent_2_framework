# Target architecture

## Architectural intent

This platform is not a replacement for React, Fluent, D3, Monaco, Mermaid or Power BI. It creates reusable contracts between them.

```text
                         PRODUCT APPLICATIONS
   ConceptMotion Studio | Challenge Trainer | Knowledge Atlas | Data Forge | future sites
                                  |
                    +-------------+-------------+
                    |                           |
              @datapass/ui                 @datapass/knowledge + app data
              Fluent 2 shell                    |
                    |                           |
                    +-------------+-------------+
                                  |
                     renderer-neutral FigureFrame
                                  |
                    +-------------+-------------+
                    |                           |
            ConceptMotion React       future @datapass/charts React/host
                    |                           |
             ConceptMotion SVG         D3 analytical/geostory renderer
                    |                           |
             ConceptMotion Core          canonical ChartSpec
                    |                           |
                    +-------------+-------------+
                                  |
                       runtime/product adapters
                         Web / Power BI / etc.
```

In Foundation v1.1, implement the left side plus the renderer-neutral surface and the pure source/content/change metadata package. The right-side D3 SDK evolution and live source monitoring are future work.

## Package responsibilities

### `@conceptmotion/core`

Pure TypeScript. No DOM, React, Fluent, Monaco or Power BI APIs.

Owns:

- canonical scene/workflow schema/types;
- entities and stable IDs;
- semantic actions;
- frame/timeline compilation;
- transition planning/state diffing;
- deterministic semantic state;
- annotations;
- workflow/DAG run-state semantics;
- validation and reference integrity;
- serialization/import/export of specs;
- locale-neutral semantic content values.

### `@conceptmotion/svg`

Framework-independent SVG/D3 layer.

Owns:

- geometry/layout primitives;
- tables/rows/cells;
- algorithm structures;
- nodes/containers/ports;
- edges/routes/markers;
- workflow groups/nested containers;
- keyed render/update behavior;
- flow overlays/particles;
- workflow run-state overlays;
- SVG freeze/export;
- renderer registry organized by family;
- renderer cleanup lifecycle.

D3 primarily supplies scales, shapes, interpolation, hierarchy/graph utilities and keyed DOM transitions.

### `@conceptmotion/react`

Thin React integration.

Owns:

- `<ConceptScene>`;
- `<WorkflowScene>` facade if useful;
- lifecycle bridge to SVG renderer;
- timeline/playback hooks;
- selection hooks;
- accessible React wrappers/fallbacks;
- error boundary/fallback behavior.

It should not own semantic calculations or geometry.

### `@datapass/ui`

Fluent-based application composites.

Owns:

- AppShell/TopBar/SideNav/PageHeader;
- Catalog/Workbench/Explainer/Challenge compositions;
- Workflow Workbench shell;
- FigureFrame/VisualizationSurface;
- Inspector/SplitPane/BottomPanel patterns;
- Timeline control composition;
- generic states;
- locale provider/toggle and application strings.

It does not own ConceptMotion semantics or D3 chart grammar.

### `@datapass/knowledge`

Pure TypeScript. No React, DOM, Fluent, network crawling or AI calls.

Owns:

- `KnowledgeEntry`;
- `SourceRef`;
- `FeatureRef`;
- `ChangeEvent`;
- `ImpactRef`;
- freshness/status metadata;
- localized metadata values compatible with the platform locale contract;
- deterministic feature-ID based impact resolution;
- validation/serialization.

The Studio/Knowledge Atlas consumes this package using local fixtures in v1.1. Live collectors are future work.

### `@datapass/charts` - FUTURE V2

Existing D3 SDK evolves into a sibling package/repo.

Owns:

- canonical ChartSpec;
- analytical/editorial chart grammar;
- geospatial/GeoStory grammar;
- chart themes/profiles;
- D3 rendering core;
- web/React/notebook adapters;
- first-class Power BI adapter/generator.

Do not implement this package in Foundation v1.1.

## Studio app

The Studio is a consumer/showcase.

It demonstrates:

- Catalog;
- Explainer;
- generic visual Workbench;
- Challenge Workbench;
- Orchestration Workbench;
- Knowledge Atlas;
- JSON spec playground;
- bilingual application chrome;
- renderer-neutral FigureFrame contract.

The Studio may import all Foundation v1.1 packages. Packages must never import from Studio.

## Renderer-neutral figure contract

A product page should not need different layout architecture for ConceptMotion vs a future D3 analytical chart.

`FigureFrame` / `VisualizationSurface` should accept arbitrary children/render targets while owning application-level framing:

```text
Title
Subtitle / takeaway
Toolbar slot
--------------------------------
Renderer content (ConceptMotion or future chart)
--------------------------------
Source / note / accessible fallback
```

This prevents future D3 v2 integration from causing another page redesign.

## Theme architecture

Do not force visualization cores to import Fluent token objects.

Use semantic visual roles at the boundary:

```text
surface
ink
muted
border/grid
accent
categorical palette
success/warning/error/info
font family/scale
density
```

The app can map Fluent theme values to these roles.

ConceptMotion and the future chart SDK may have richer renderer-specific theme options while remaining compatible conceptually.

## Locale architecture

Application layer owns the active locale.

Recommended content contract:

```ts
type Locale = 'en' | 'no';
type LocalizedText = string | Partial<Record<Locale, string>>;
```

Resolution rule:

1. requested locale;
2. English;
3. first available string;
4. empty string.

Code/identifiers remain unchanged.

## Consumers

### Data Forge

Consumes later:

- `@datapass/ui`;
- ConceptMotion data transformation/model/lineage/workflow visuals;
- Monaco for generated code/specs;
- future `@datapass/charts` for analytical previews;
- `@datapass/knowledge` where generated docs/source/version metadata are useful.

Data Forge stays a separate product.

### Challenge trainer

Consumes:

- Challenge Workbench;
- Monaco;
- optional ConceptMotion Visualize scenes.

It may remain English-only for many exercises even though the shell supports EN/NO.

### Existing D3 ecosystem

Remains separate in v1. Future integration occurs through renderer-neutral figure surfaces and semantic theme/metadata conventions.

## Future adapters

Possible later adapters without changing semantic cores:

```text
@conceptmotion/web-component
@conceptmotion/export
@datapass/charts/powerbi
@datapass/charts/notebook
```

These are outside v1.1 scope.
