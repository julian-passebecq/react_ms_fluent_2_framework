# Fluent 2 integration guidance

## Package choice

Use modern Fluent React v9 via `@fluentui/react-components` rather than legacy Office UI Fabric React or Fabric Core for the new Studio.

The supplied Fluent source snapshot shows the suite package as `@fluentui/react-components` and includes the modern v9 components, theme/provider, motion, nav, table, tabs, drawer, tooltip, etc.

## Theme

Create a custom `datapassLightTheme` derived from Fluent tokens. Keep brand color restrained. Do not manually override every component with unrelated CSS.

## Useful Fluent components

Likely useful in v1:

- `FluentProvider`
- `Button`
- `Input` / `SearchBox` equivalent available in installed suite
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
- `Tree` or `Nav` where appropriate
- `Skeleton`
- `MessageBar`

Use the exact current API after installing the selected Fluent version; do not copy legacy examples from `office-ui-fabric-react`.

## Charts

If `@fluentui/react-charts` is used, keep it outside ConceptMotion core and use it for standard chart needs only. ConceptMotion should not become a wrapper around Fluent Charts.
