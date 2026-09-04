# D3 SDK v2 bridge and roadmap

## Status

The user already has a separate D3 visualization SDK/generator under the D3 ecosystem project. The supplied v7 snapshot is reference material in:

`reference_material/d3viz_v7_reference/`

Foundation v1.1 must not absorb or rewrite it.

## What already exists in the D3 SDK

The v7 reference includes a useful factorization direction:

### Motion primitives

- `createPlayback()` - time playback/scrub/timer cleanup/reduced-motion behavior;
- `drawPath()` - reusable stroke/path reveal;
- `attachZoom()` - zoom/pan behavior;
- `animatePathParticles()` - movement along paths.

### Structural marks/patterns

- `geoBubble` - temporal geographic events;
- `metro` - projected transport/network topology;
- `barRace` - ranking over time;
- `force` - relationship/network visualization;
- `pack` - hierarchical quantitative visualization;
- `flowMap` - origin-destination geographic movement;
- conventional line/bar/dot/scatter marks.

### Cross-runtime intent

The SDK already targets:

- standalone web;
- React;
- Power BI generation;
- Fabric;
- Databricks;
- Jupyter;
- BigQuery/notebook patterns.

This architecture is worth preserving.

## Critical future correction

The current Power BI exporter contains its own simplified chart rendering logic. That duplicates the web D3 renderer and violates the desired abstraction.

V2 must move toward:

```text
Power BI DataView
       |
       v
PowerBIAdapter
       |
       v
Canonical ChartSpec
       |
       v
SAME D3 renderer used by web/React
       |
       v
SVG inside Power BI custom visual host
```

Power BI-specific code should adapt:

- data roles;
- DataView;
- selection IDs;
- tooltips;
- formatting model;
- high contrast;
- host events.

It should not reimplement bar/line/scatter geometry.

## What Foundation v1.1 must do to prepare

Only these compatibility steps belong in V1:

### 1. Renderer-neutral figure composition

`@datapass/ui` FigureFrame/VisualizationSurface must host arbitrary visualization renderers rather than assuming ConceptMotion.

### 2. Semantic visual metadata

Use a shared conceptual contract for:

- title;
- subtitle;
- takeaway;
- source;
- note;
- units;
- accessibility summary;
- action/export slots.

Do not force a direct package dependency between ConceptMotion core and the D3 SDK.

### 3. Theme compatibility by semantics

Both systems should be able to map semantic concepts such as:

- surface;
- ink;
- muted;
- grid/border;
- accent;
- categorical palette;
- status colors;
- density/typography profile.

Do not make D3 core depend on Fluent tokens. The application can map between them.

### 4. Renderer registry extensibility

ConceptMotion SVG rendering should be split by family/registry so future chart embedding does not require editing a monolithic renderer switch.

### 5. Lifecycle discipline

All renderers should follow comparable expectations:

- mount;
- update;
- cleanup;
- responsive sizing;
- reduced motion;
- export/freeze when supported.

For detailed Power BI requirements, also read `POWERBI_D3_V2.md`.

## D3 v2 priorities

When V2 starts, prioritize abstraction quality over number of examples.

### Editorial chart grammar

Add:

- annotations;
- facets/small multiples;
- highlights;
- layers;
- reference lines/bands;
- direct labels;
- format grammar;
- basic transforms.

Then add a limited high-value set of chart families.

### AI-first authoring

The AI should usually generate a spec, not D3 implementation code.

Good future request:

> Show yearly Nobel prizes by category on a world map, animate by decade, zoom to Europe in step 2, highlight physics in step 3, and give me a Power BI version.

The AI should primarily produce:

- dataset mapping;
- `GeoStorySpec`;
- theme;
- story steps;
- Power BI role mapping if needed.

It should not invent playback/zoom/projection/particles again.

### Cross-runtime compatibility matrix

Every new pattern should state whether it works in:

- web;
- React;
- Power BI;
- notebook HTML;
- SVG export;
- reduced motion.

If a target is unsupported, say so rather than silently substituting an unrelated chart.

## Do not do in Foundation v1.1

- do not copy the D3 renderer into ConceptMotion;
- do not rewrite the Power BI generator;
- do not implement GeoStory;
- do not expand to dozens of chart families;
- do not make React mandatory for the D3 core;
- do not put Power BI APIs in ConceptMotion core.
