# Shared UI components - `@datapass/ui`

Do not wrap every Fluent primitive. Build only recurring contextual compositions used across ConceptMotion Studio, Data Forge, challenge training and future technical sites.

## Foundation shell

- `AppShell`
- `TopBar`
- `SideNav`
- `PageHeader`
- `BreadcrumbTrail`
- `LocaleProvider`
- `LanguageToggle`

## Catalog

- `CatalogShell`
- `SearchFilterBar`
- `FilterGroup`
- `EntityCard`
- `StatusBadge`
- `ProgressStatus`

## Workbench

- `Workbench`
- `SplitPane`
- `InspectorPanel`
- `BottomPanel`
- `CanvasToolbar`
- `ZoomControls`

## Renderer-neutral figures / explanation

- `FigureFrame`
- `VisualizationSurface` (may be merged with FigureFrame if one component is cleaner)
- `FigureHeader`
- `SourceNote`
- `AnnotationPanel`
- `TimelineControls`
- `StateInspector`

IMPORTANT: the figure surface must not assume ConceptMotion is the only renderer. It must be able to host future `@datapass/charts` content without another layout rewrite.

The frame owns product-level metadata and slots; the renderer owns geometry/animation.

## Challenge Workbench

- `ChallengeShell`
- `ChallengeHeader`
- `ChallengeDescriptionPanel`
- `ChallengeModeTabs`
- `CodeWorkspace`
- `SolutionPanel`
- `CodeComparePanel`
- `HintStepper`
- `ChallengeProgressControls`

Monaco integration belongs here/application-level, not in ConceptMotion core.

## Orchestration Workbench

- `WorkflowWorkbenchShell`
- `WorkflowModeTabs`
- `WorkflowInspectorPanel`
- `RunSelector`
- `RunStateLegend`
- `SpecPlaygroundPanel`

The actual DAG/pipeline canvas is ConceptMotion renderer functionality, not a Fluent component.

## Generic states

- `EmptyState`
- `ErrorState`
- `LoadingState`

## Knowledge Atlas

- `KnowledgeShell`
- `DocsNavigation`
- `OnThisPage`
- `KnowledgeHeader`
- `SourceList`
- `OfficialLink`
- `FeatureStatusBadge`
- `FreshnessBadge`
- `VersionBadge`
- `ChangeImpactPanel`
- `RelatedKnowledge`

Keep these compact and compositional. Do not build a CMS inside `@datapass/ui`.

## Five reusable page archetypes

1. **Catalog** - discovery/search/filter.
2. **Workbench** - canvas + navigation + inspector.
3. **Explainer** - concise narrative + large visualization.
4. **Challenge Workbench** - problem + optional Visualize/Hints + code/solution/diff.
5. **Knowledge Atlas** - source-aware technical documentation with interactive figures and freshness/status metadata.

## Design rules

- Prefer Fluent primitive directly when no contextual composition is needed.
- Keep components controlled or predictably stateful.
- Keep visual density compact.
- Support keyboard focus and phone layouts.
- Avoid giant hero sections by default.
- Use one restrained accent rather than multiple decorative gradients.
- Keep the locale toggle compact and optional per application/page.

## What not to put here

- D3 geometry;
- scene semantics;
- chart grammar;
- workflow scheduling semantics;
- Power BI host APIs;
- cloud/data-model business logic;
- wrapper components around every Fluent primitive;
- project-specific page content;
- source collectors/crawlers;
- product-specific change detection logic.
