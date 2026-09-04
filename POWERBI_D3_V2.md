# D3 -> Power BI v2 design contract

## Why this is a priority after Foundation v1.1

The user's strongest practical D3 requirement is not only web rendering. It is making sophisticated D3 visuals reusable inside Power BI, including visuals that standard Power BI charts do not express easily (editorial charts, animated maps, network/flow views, etc.).

The current D3 SDK already generates a Power BI starter bundle, but its Power BI branch contains duplicated simplified rendering logic. V2 should correct that architecture before broadening the chart catalog.

## Core rule

There must be ONE chart/geostory renderer.

```text
Web / React data --------------------+
                                     |
Power BI DataView -> PowerBIAdapter -+-> Canonical ChartSpec/GeoStorySpec
                                     |
                                     v
                              SAME D3 renderer
                                     |
                                     v
                                    SVG
```

Do not maintain `WebLineChart` and `PowerBILineChart` as separate implementations.

## Power BI adapter responsibilities

The adapter may own Power BI-specific concerns:

- DataView parsing;
- data roles and mappings;
- selection IDs;
- selection manager / cross filtering;
- highlight state;
- tooltip service integration;
- formatting model;
- report theme/color palette mapping;
- high-contrast behavior;
- viewport/update lifecycle;
- host event integration;
- packaging/project files.

The adapter must NOT own analytical geometry.

## Generated project path - first target

V2 should first make the generator produce a robust developer project bundle:

```text
GeneratedVisual/
  src/visual.ts
  src/settings.ts or equivalent formatting model
  capabilities.json
  pbiviz.json
  package.json
  styles.less/css
  README/INSTALL
```

The output should be packageable with the supported Power BI visuals tooling.

Do not make AppSource certification the first milestone.

## Data roles derived from spec

The chart grammar should be able to derive roles such as:

- category;
- x;
- y/value;
- value2;
- series/legend;
- size;
- detail;
- time;
- longitude;
- latitude;
- source;
- target;
- tooltip fields.

Not every chart uses every role.

## Formatting model derived from semantic options

Expose appropriate groups rather than a generic giant settings dump.

Examples:

### Editorial

- style preset;
- title/subtitle/source visibility;
- direct labels;
- annotation visibility.

### Data colors

- report theme;
- editorial preset;
- accent;
- series overrides;
- highlight.

### Axes/scales

- zero baseline;
- ticks/grid;
- domain overrides where safe;
- number/date format.

### Motion/interaction

- animation on/off;
- speed/duration when relevant;
- playback window for temporal maps;
- reduced-motion behavior.

## Theme modes

Support at least:

1. **Report theme** - respect Power BI theme colors.
2. **Editorial preset** - Economist/BBC/FT-inspired structural preset.
3. **Editorial + report accent** - publisher-like structure while using the report's primary accent.

Do not hard-code trademarked branding or logos.

## Power BI interaction

Where semantically appropriate:

- clicking a mark selects/cross-filters;
- highlight states are reflected in D3 opacity/emphasis;
- tooltips use host-compatible data;
- keyboard focus is possible for meaningful data marks;
- current playback/map selection has a textual/accessible state.

## GeoStory roles

Future temporal map visuals may map:

```text
Latitude
Longitude
Time
Category
Value / magnitude
Label / detail
Tooltip fields
```

Flow maps may additionally map:

```text
Source latitude/longitude
Target latitude/longitude
Flow value
Flow category
```

These roles should produce the same GeoStorySpec that the web renderer consumes.

## Universal visual - later, not first

After generated-project output is reliable, a future single custom visual could expose a `visual type` formatting dropdown and broad data roles.

Example chart types:

- bar/dot/dumbbell;
- line/slope/bump;
- scatter;
- waterfall;
- heatmap;
- small multiples;
- temporal event map;
- flow map.

This is a later optimization, not a prerequisite for V2's first Power BI milestone.

## Foundation v1.1 responsibility

Only prepare the platform by ensuring:

- renderer-neutral FigureFrame/application layout;
- no Power BI APIs in ConceptMotion core;
- semantic theme metadata can map to multiple hosts;
- lower visualization cores are not React-only;
- Data Forge integration contracts can later emit ChartSpec/GeoStorySpec.

Do not implement the Power BI adapter during Foundation v1.1.
