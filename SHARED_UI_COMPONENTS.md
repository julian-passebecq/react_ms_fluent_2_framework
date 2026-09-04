# Shared UI components — `@datapass/ui`

The shared UI layer is intentionally small.

## P0 composites

### Shell/navigation
- `AppShell`
- `TopBar`
- `SideNav`
- `PageHeader`

### Catalog
- `CatalogShell`
- `SearchFilterBar`
- `FilterGroup`
- `EntityCard`
- `ImplementationBadge`

### Workbench
- `Workbench`
- `SplitPane`
- `InspectorPanel`
- `BottomPanel`
- `PropertiesSection`

### Figure/editorial
- `FigureFrame`
- `FigureHeader`
- `FigureLegend`
- `SourceNote`
- `AnnotationCallout`

### Learning/motion
- `TimelineControls`
- `StepIndicator`
- `CodePanel`
- `StateInspector`

### States
- `EmptyState`
- `ErrorState`
- `LoadingState`

## What not to put here

- D3 geometry;
- scene semantics;
- cloud/data-model business logic;
- wrapper components around every Fluent primitive;
- project-specific page content.
