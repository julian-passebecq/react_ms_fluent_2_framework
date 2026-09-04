# Foundation v1.1 API surface

This document describes the implemented root exports of the five Foundation v1.1 workspace packages. All packages are currently private and export TypeScript source for workspace consumption; this is not an npm publication contract.

## Package map

| Import | Runtime boundary | Public entry points |
| --- | --- | --- |
| `@conceptmotion/core` | Pure TypeScript | `@conceptmotion/core` |
| `@conceptmotion/svg` | Browser SVG DOM; no React/Fluent | `@conceptmotion/svg` |
| `@conceptmotion/react` | React adapter | `@conceptmotion/react` |
| `@datapass/ui` | React + Fluent v9 | `@datapass/ui`, `@datapass/ui/styles.css` |
| `@datapass/knowledge` | Pure TypeScript | `@datapass/knowledge` |

Only symbols re-exported by each package's `src/index.ts` are listed. App fixtures and Studio components are not package API.

## `@conceptmotion/core`

Core owns semantic meaning and deterministic compilation. It has no runtime dependencies.

### Semantic entities and transitions

Types:

- `EntityId`, `EntityKind`, `SemanticEntity`, `EntityPosition`, `EntitySnapshot`, `SemanticSnapshot`
- `SemanticFrame`, `SceneSpec`, `CompiledSceneFrame`
- `TransitionKind`, `TransitionChange`, `TransitionPlanItem`, `TransitionPlan`

Functions:

- `createSemanticSnapshot(id, entities, metadata?)` — rejects empty/duplicate entity IDs.
- `compileSceneTimeline(spec)` — adds frame indexes and transition plans.
- `planTransitions(previous, next)` — deterministically reports entering, moving, updating/emphasis-changing, and exiting entities by ID.

### Tables, predicates, and joins

Types:

- `TableCellValue`, `TableColumn`, `TableRow`, `TableData`
- `TableComparisonOperator`, `TableComparisonPredicate`, `TablePredicateGroup`, `TablePredicate`
- `TableSortKey`, `JoinType`, `TableJoinSpec`
- `TableFilterAction`, `TableSortAction`, `TableJoinAction`, `TableAction`
- `CompiledTableState`, `JoinedTableRow`, `JoinResult`

Functions:

- `getTableRowEntityId(tableId, rowId)`, `getTableCellEntityId(tableId, rowId, columnId)`
- `evaluateTablePredicate(row, predicate)`
- `compileTableState(table, snapshotId?)`
- `compileTableFilter(table, predicate, snapshotId?)`
- `compileTableSort(table, by, snapshotId?)` — stable for equal keys.
- `compileTableJoin(spec)` — supports `inner`, `left`, `right`, `full`, `cross`, `semi`, and `anti`.
- `compileTableAction(table, action)`

```ts
import {
  compileTableSort,
  planTransitions,
  type TableData,
} from '@conceptmotion/core';

const orders: TableData = {
  id: 'orders',
  columns: [{ id: 'amount', label: 'Amount' }],
  rows: [
    { id: 'order-17', values: { amount: 80 } },
    { id: 'order-22', values: { amount: 140 } },
  ],
};

const ascending = compileTableSort(orders, [
  { columnId: 'amount', direction: 'asc' },
]);
const descending = compileTableSort(orders, [
  { columnId: 'amount', direction: 'desc' },
]);

const movement = planTransitions(ascending.snapshot, descending.snapshot);
// movement.movingIds contains stable row/cell entity IDs, not array indexes.
```

### Algorithm and statistics scenes

Loop exports:

- `LoopItem`, `CodeLine`, `LoopFrame`, `LoopSceneSpec`, `CompiledLoopFrame`
- `getLoopItemEntityId(sceneId, itemId)`, `compileLoopFrame(spec, frame)`

Regression exports:

- `RegressionPoint`, `RegressionFrame`, `RegressionSceneSpec`, `RegressionPrediction`, `CompiledRegressionFrame`
- `compileRegressionFrame(spec, frame)`

Frame selectors accept a zero-based number or a declared frame ID. Compilers validate stable references and return semantic snapshots.

### Diagrams and layout extension contracts

Types:

- `DiagramDirection`, `DiagramDensity`, `DiagramLayoutSpec`
- `DiagramPort`, `DiagramNode`, `DiagramGroup`, `DiagramEndpoint`, `DiagramEdge`, `DiagramSpec`
- `DiagramLayoutNode`, `DiagramRoutePoint`, `DiagramLayoutResult`, `DiagramLayoutContract`

Function:

- `validateDiagramSpec(input)` — checks shapes, unique IDs, ports/endpoints, group ownership/cycles, layout references, localized text, and flow kinds.

`DiagramLayoutContract` is an interface for future deterministic layout providers; core does not ship a concrete layout engine.

### Workflows

Types:

- `WorkflowPreset`, `WorkflowDependencyCondition`, `WorkflowStatus`
- `WorkflowSchedule`, `WorkflowNode`, `WorkflowGroup`, `WorkflowEdge`
- `WorkflowTaskState`, `WorkflowRunFrame`, `WorkflowRun`, `WorkflowOverlay`, `WorkflowSpec`
- `CompiledWorkflowRunFrame`
- `WorkflowLayoutGroup`, `WorkflowLayoutResult`, `WorkflowLayoutOptions`, `WorkflowLayoutContract`

Functions:

- `isWorkflowStatus(value)`
- `isWorkflowStatusTransitionAllowed(from, to)`
- `getWorkflowEdgeId(edge, index?)` — uses an explicit edge ID or derives one from stable endpoint/condition values.
- `validateWorkflowSpec(input)`, `assertValidWorkflowSpec(input)`
- `compileWorkflowRunFrame(spec, runId, frame)` — accumulates partial frame states from the initial `pending` state and returns a snapshot/transition.
- `compileWorkflowRun(spec, runId)`

`WorkflowPreset` is `'generic' | 'airflow' | 'fabric-data-factory' | 'azure-data-factory' | 'databricks-lakeflow'`. Presets are presentation metadata; they do not change workflow semantics.

```ts
import {
  compileWorkflowRunFrame,
  validateWorkflowSpec,
  type WorkflowSpec,
} from '@conceptmotion/core';

const spec: WorkflowSpec = {
  kind: 'workflow',
  version: '1',
  id: 'daily-load',
  title: 'Daily load',
  nodes: [
    { id: 'extract', label: 'Extract' },
    { id: 'load', label: 'Load' },
  ],
  edges: [{ from: 'extract', to: 'load', condition: 'success' }],
  runs: [{
    id: 'demo',
    frames: [
      { id: 'running-extract', states: { extract: { status: 'running' } } },
      {
        id: 'running-load',
        states: {
          extract: { status: 'success' },
          load: { status: 'running' },
        },
      },
    ],
  }],
};

if (!validateWorkflowSpec(spec).valid) throw new Error('Invalid workflow');
const frame = compileWorkflowRunFrame(spec, 'demo', 'running-load');
```

### Lineage

Types:

- `SourcePosition`, `SourceSpan`
- `LineageColumn`, `LineageAsset`, `LineageEndpoint`
- `LineageStatementType`, `LineageChangeType`, `LineageRelation`, `LineageSpec`

Functions:

- `getLineagePortId(endpoint)` — creates an encoded asset- or column-port ID.
- `validateLineageSpec(input)`, `assertValidLineageSpec(input)` — validate asset/column/relation references and optional one-based source spans.

These contracts accept parser-like output but do not parse SQL.

### Flow and icons

Flow exports:

- `FlowKind`, `LegacyFlowKind`, `FlowChannel`, `FlowLinePattern`, `FlowMarker`, `FlowMotion`, `FlowKindSemantics`
- `FLOW_KIND_SEMANTICS`
- `normalizeFlowKind(kind)`, `isFlowKind(value)`, `getFlowKindSemantics(kind)`

The legacy aliases `batch`, `stream`, and `error` normalize to `data-batch`, `data-stream`, and `failure`.

Icon exports:

- `IconRef`, `ResolvedIconRef`, `IconResolver`, `IconRegistryOptions`
- `DEFAULT_ICON_REFS`, `SemanticIconRegistry`
- `createIconRegistry(entries?, options?)`, `resolveIcon(id, resolver?)`

`SemanticIconRegistry` exposes `register`, `has`, `list`, and `resolve`. Registry entries own any asset/glyph reference; semantic specs store only `iconId`.

### Locale, JSON, and validation

Locale exports:

- `SUPPORTED_LOCALES`, `Locale`, `LocalizedText`
- `isLocalizedText(value)`, `resolveLocalizedText(value, locale?)`

JSON exports:

- `JsonPrimitive`, `JsonValue`
- `toCanonicalJsonValue(value)`, `serializeDeterministic(value, space?)`, `parseJson<T>(source)`

Validation exports:

- `ValidationSeverity`, `ValidationIssue`, `ValidationResult`
- `createValidationResult(issues)`, `validationError(code, path, message)`, `validationWarning(code, path, message)`, `formatValidationIssues(result)`

## `@conceptmotion/svg`

SVG owns layout, browser-SVG lifecycle, renderer registration, semantic visual roles, and deterministic export. It depends only on core.

### Renderer lifecycle and registry

Types/classes:

- `RendererViewport`, `RenderOptions`, `FreezeOptions`
- `SvgRenderer`, `SvgRendererFactory`, `RendererRegistration`, `AnyRendererRegistration`
- `Point`, `Rect`, `PositionedEntity`
- `BaseSvgRenderer`, `RendererRegistry`

Registry functions:

- `createRendererRegistry(registrations?)`
- `registerDefaultRendererFamilies(registry)`
- `createDefaultRendererRegistry()`

`RendererRegistry` exposes `register`, `replace`, `unregister`, `has`, `create`, `get`, `ids`, and `entries`; `ids`/`entries` optionally filter by family.

`RenderOptions` supports `width`, `height`, partial semantic `theme`, `reducedMotion`, `transitionDurationMs`, `selectedId`, `onSelect`, and `locale` (`en` or `no`).

```ts
import {
  createDefaultRendererRegistry,
  type TableRendererInput,
} from '@conceptmotion/svg';

export function renderTable(
  host: SVGSVGElement,
  first: TableRendererInput,
  next: TableRendererInput,
) {
  const registry = createDefaultRendererRegistry();
  const renderer = registry.create<TableRendererInput>('table.transform');
  renderer.mount(host, first, { width: 960, reducedMotion: true });
  renderer.update(next);
  const portableSvg = renderer.freeze();
  renderer.destroy();
  return portableSvg;
}
```

### Scene adapters

Types:

- `TableSvgSceneSpec`, `JoinSvgSceneSpec`, `DiagramSvgFrame`, `DiagramSvgSceneSpec`
- `LineageSvgFrame`, `LineageSvgSceneSpec`, `SvgSceneSpec`, `ResolvedSvgScene`

Functions:

- `rendererIdForScene(spec)`
- `resolveSvgScene(spec, frameIndex?, parameter?)`

`resolveSvgScene` clamps the requested frame and delegates semantic compilation to core. Its scene union maps to six ConceptMotion renderer IDs; workflow has its own adapter below.

### Default renderer exports

| Renderer | Public symbols |
| --- | --- |
| Diagram | `DiagramRendererInput`, `DiagramRenderer`, `diagramRendererRegistration`, `registerDiagramRenderers` |
| Join | `JoinRendererInput`, `JoinRenderer`, `joinRendererRegistration`, `registerJoinRenderers` |
| Lineage | `LineageRendererInput`, `LineageRenderer`, `lineageRendererRegistration`, `registerLineageRenderers` |
| Loop | `LoopRendererInput`, `LoopRenderer`, `loopRendererRegistration`, `registerLoopRenderers` |
| Regression | `RegressionRendererInput`, `RegressionRenderer`, `regressionRendererRegistration`, `registerRegressionRenderers` |
| Table | `TableRendererInput`, `TableRenderer`, `tableRendererRegistration`, `registerTableRenderers` |
| Workflow | `WorkflowRenderMode`, `WorkflowRendererInput`, `ResolveWorkflowRendererInputOptions`, `resolveWorkflowRendererInput`, `WorkflowRenderer`, `workflowRendererRegistration`, `registerWorkflowRenderers` |

The registered IDs are `diagram.flow`, `table.join`, `lineage.model`, `algorithm.loop`, `statistics.regression`, `table.transform`, and `workflow.topology`.

### SVG, layout, flow, theme, and freeze helpers

Surface/DOM exports:

- `SVG_NS`, `SvgSurface`
- `svgElement`, `setAttributes`, `setText`, `setSvgTransform`, `round`
- `createSurface`, `updateSurface`, `applyThemeAttributes`
- `ensureChild`, `keyedChildren`, `rectContains`, `setAccessibleText`

Layout exports:

- `LayoutDirection`, `LayoutNode`, `LayoutEdge`, `LayeredLayoutOptions`
- `layoutLayeredGraph`, `edgeAnchor`, `routeOrthogonal`

Flow/theme/freeze exports:

- `FlowVisualStyle`, `flowVisualStyle`, `ensureFlowMarkers`
- `SemanticTheme`, `defaultSemanticTheme`, `resolveSemanticTheme`
- `freezeSvgElement(host, options?)`

DOM helpers are public low-level primitives. Most application consumers should use a renderer or the React adapter instead.

## `@conceptmotion/react`

The React package exports:

- `RendererHostProps`, `RendererHost`
- `ConceptSceneProps`, `ConceptScene`
- `WorkflowSceneProps`, `WorkflowScene`
- `useReducedMotion(explicit?)`

`RendererHost` creates a registered renderer, mounts it into one SVG element, forwards updates, destroys it on cleanup, and exposes optional selection, fallback, and `onRendererReady` hooks. `ConceptScene` adapts `SvgSceneSpec`; `WorkflowScene` adapts `WorkflowSpec` and its run/topology modes.

```tsx
import { ConceptScene } from '@conceptmotion/react';
import type { SvgSceneSpec } from '@conceptmotion/svg';
import { FigureFrame } from '@datapass/ui';

export function LessonFigure({ spec }: { spec: SvgSceneSpec }) {
  return (
    <FigureFrame
      title="Stable semantic entities"
      fallback={<p>The text alternative for this lesson.</p>}
    >
      <ConceptScene spec={spec} frameIndex={1} ariaLabel="Lesson state" />
    </FigureFrame>
  );
}
```

`FigureFrame` already supplies `VisualizationSurface`; consumers should not nest another one around `ConceptScene`.

## `@datapass/ui`

The UI entry imports its stylesheet and exports reusable Fluent v9 composites.

### Theme and locale

- `datapassBrandVariants`, `datapassLightTheme`
- `supportedLocales`, `Locale`, `LocalizedText`, `LocaleStorage`, `CommonUiStringKey`
- `commonUiStrings`, `DEFAULT_LOCALE_STORAGE_KEY`
- `isLocale`, `normalizeLocale`, `resolveLocalizedText`, `readStoredLocale`, `writeStoredLocale`
- `LocaleContextValue`, `LocaleProviderProps`, `LocaleProvider`
- `useLocale`, `useLocalizedText`
- `LanguageToggleProps`, `LanguageToggle`

The locale resolution order is requested locale, English, first non-empty translation, then empty string. Storage helpers tolerate unavailable or throwing storage.

### Shells and layout

- `AppShellProps`, `AppShell`; `TopBarProps`, `TopBar`; `SideNavProps`, `SideNav`; `PageHeaderProps`, `PageHeader`
- `CatalogShellProps`, `CatalogShell`; `SearchFilterBarProps`, `SearchFilterBar`
- `ExplainerShellProps`, `ExplainerShell`
- `WorkbenchProps`, `Workbench`; `SplitPaneProps`, `SplitPane`; `InspectorPanelProps`, `InspectorPanel`
- `ChallengeShellProps`, `ChallengeShell`
- `WorkflowWorkbenchShellProps`, `WorkflowWorkbenchShell`

These components arrange slots and landmarks. They do not import or calculate ConceptMotion semantics.

### Figures and timeline

- `AccessibleFallbackMode`
- `VisualizationSurfaceProps`, `VisualizationSurface`
- `SourceNoteProps`, `SourceNote`
- `FigureFrameProps`, `FigureFrame`
- `TimelineControlLabels`, `TimelineControlsProps`, `TimelineControls`

`FigureFrame` accepts arbitrary renderer children plus title, subtitle/takeaway, metadata, toolbar/actions, export action, source/note, and a visible/details/visually-hidden text fallback.

### Status, diagnostics, and knowledge UI

Status exports:

- `StatusTone`, `StatusBadgeProps`, `StatusBadge`
- `ProductStatus`, `FeatureStatusBadgeProps`, `FeatureStatusBadge`
- `VersionBadgeProps`, `VersionBadge`
- `FreshnessState`, `FreshnessBadgeProps`, `FreshnessBadge`
- `ChangeImpactPanelProps`, `ChangeImpactPanel`

Diagnostics exports:

- `DiagnosticSeverity`, `CodeDiagnostic`, `CodeDiagnosticsProps`, `CodeDiagnostics`

Knowledge UI exports:

- `KnowledgeShellProps`, `KnowledgeShell`
- `DocsNavigationProps`, `DocsNavigation`; `OnThisPageProps`, `OnThisPage`
- `KnowledgeHeaderProps`, `KnowledgeHeader`
- `OfficialLinkProps`, `OfficialLink`
- `SourceListItem`, `SourceListProps`, `SourceList`
- `RelatedKnowledgeProps`, `RelatedKnowledge`

The UI status unions intentionally mirror knowledge-package values without adding a dependency from UI to knowledge.

## `@datapass/knowledge`

Knowledge is pure TypeScript and never reads a network source.

### Contracts

- `Authority`, `ProductStatus`, `FreshnessState`
- `ChangeKind`, `ChangeSeverity`, `ImpactState`
- `SourceRef`, `FeatureRef`, `KnowledgeEntry`, `ChangeEvent`, `ImpactRef`, `KnowledgeDataset`

Stable `sourceId` and `featureIds` are the join keys. Prose is not parsed to infer impact.

### Impact and freshness

- `ResolveChangeImpactOptions`
- `resolveChangeImpact(change, entries, options?)`
- `resolveChangeImpacts(changes, entries)`
- `FreshnessOptions`
- `computeFreshnessState(entry, changes?, options?)`

Impact output is sorted and deduplicated. Freshness is `needs-review` when a relevant unreviewed change is newer than verification; otherwise it is `unknown`, `stale`, or `current` according to verification data and `staleAfterDays`.

```ts
import {
  computeFreshnessState,
  resolveChangeImpact,
  type ChangeEvent,
  type KnowledgeEntry,
} from '@datapass/knowledge';

const entry: KnowledgeEntry = {
  id: 'knowledge.runtime',
  slug: 'runtime',
  title: 'Runtime guidance',
  featureIds: ['fabric.runtime'],
  figureIds: ['figure.runtime'],
  verifiedAt: '2026-07-15T09:00:00Z',
};

const change: ChangeEvent = {
  id: 'change.runtime-2',
  sourceId: 'source.fabric.runtime',
  detectedAt: '2026-08-20T10:30:00Z',
  title: 'Runtime guidance changed',
  kind: 'version',
  severity: 'review',
  featureIds: ['fabric.runtime'],
};

const impact = resolveChangeImpact(change, [entry]);
const freshness = computeFreshnessState(entry, [change], {
  now: '2026-09-04T12:00:00Z',
});
// impact.knowledgeEntryIds -> ['knowledge.runtime']
// freshness === 'needs-review'
```

### Validation, serialization, and locale

Validation exports:

- `KnowledgeValidationSeverity`, `KnowledgeValidationIssue`, `KnowledgeValidationResult`
- `validateSourceRef`, `validateFeatureRef`, `validateKnowledgeEntry`, `validateChangeEvent`, `validateImpactRef`, `validateKnowledgeDataset`
- `formatKnowledgeValidationIssues`, `assertValidKnowledgeDataset`

Serialization exports:

- `serializeKnowledgeDataset(dataset, space?)`
- `parseKnowledgeDataset(source)`

Locale exports:

- `SUPPORTED_LOCALES`, `Locale`, `LocalizedText`
- `isLocalizedText`, `resolveLocalizedText`

Serialization validates first and emits canonical key order. Parsing wraps JSON syntax errors and enforces dataset reference integrity.

## Non-API boundaries

The following are demonstrations or future extension points, not Foundation v1.1 package APIs:

- `apps/studio/src/data/*` fixtures and route/page components;
- the preserved legacy `src` modules and their 28-family renderer switch;
- live source collectors, alerts, AI rewriting, DAX/SQL services, and code execution;
- Data Forge generator/backend;
- D3 SDK v2, GeoStory/Narrative Story, analytical chart grammar, Canvas/WebGL, Web Components, and Power BI adapters.
