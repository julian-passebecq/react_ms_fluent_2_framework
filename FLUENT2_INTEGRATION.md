# Fluent 2 integration guidance

## Package choice

Use modern Fluent React v9 via `@fluentui/react-components` rather than legacy Office UI Fabric React or Fabric Core for the new Studio.

The supplied Fluent source snapshot includes the modern v9 components, theme/provider, nav, table, tabs, drawer, tooltip and related primitives.

## Theme

Create a custom `datapassLightTheme` derived from Fluent tokens. Keep brand color restrained. Do not manually override every component with unrelated CSS.

Desired application expression:

- light/neutral surfaces;
- thin boundaries;
- minimal shadows;
- compact controls;
- strong hierarchy;
- one restrained accent;
- more like the supplied portfolio + FabricStack organization than the Fluent marketing homepage.

## Useful Fluent components

Likely useful in v1:

- `FluentProvider`
- `Button`
- `Input` / search input
- `TabList` / `Tab`
- `Card`
- `Drawer`
- `Menu`
- `Tooltip`
- `Badge`
- `Table`
- `Field`
- `Switch`
- `Slider`
- `Toolbar`
- `Tree` / `Nav` if appropriate
- `Breadcrumb`
- `Skeleton`
- `MessageBar`

Use the exact current API after installing the selected Fluent version; do not copy legacy examples from `office-ui-fabric-react`.

## Challenge UI

Fluent owns:

- challenge navigation;
- tabs;
- filter/search controls;
- status/progress actions;
- drawers/panels;
- tooltips and messages.

Monaco owns editing and diff. ConceptMotion owns the visual explanation.

## Workflow UI

Fluent owns:

- canvas toolbar;
- run selector;
- mode tabs;
- inspector/configuration pane;
- breadcrumb for nested container focus;
- badges/legends;
- spec editor shell.

ConceptMotion/D3 owns the DAG/pipeline graph, layout, run overlays and data/control-flow animation.

## Charts

If `@fluentui/react-charts` is used, keep it outside ConceptMotion core and use it for standard chart needs only. ConceptMotion should not become a wrapper around Fluent Charts.

## Renderer-neutral figure framing

Fluent owns the surrounding figure/product chrome (header, actions, tabs, inspector, source/note presentation). It must not own D3 geometry.

`FigureFrame` / `VisualizationSurface` should be usable by:

- ConceptMotion SVG/React today;
- the future D3 analytical/GeoStory SDK in v2;
- ordinary Fluent React Charts when a conventional dashboard chart is sufficient.

## Locale toggle

Use a compact Fluent control for EN/NO application locale. It should be optional per page/application and persist the selected locale. Do not translate code or technology identifiers.
