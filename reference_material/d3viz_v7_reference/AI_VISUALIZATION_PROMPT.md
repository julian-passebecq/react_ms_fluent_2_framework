# Prompt for an AI extending D3 Viz Generator

You are extending an existing D3 visualization SDK, not creating isolated one-off demos.

## Goal
Create difficult animated/interactive visualizations quickly by composing the existing canonical chart spec and reusable motion primitives. Preserve the same spec so the chart remains exportable to web/React/notebook targets and can later receive a Power BI-specific adapter.

## Current runtime
- D3.js 7.9.0 (latest published D3 bundle as of September 2026)
- SVG-first browser renderer
- ES modules
- No React dependency in the rendering core

## Existing architecture
`data engine -> canonical chart spec -> D3 renderer -> runtime adapter`

Data engines such as SQL, BigQuery, pandas, Polars, PySpark, Fabric and Databricks should aggregate/filter data before it reaches the browser. Never collect an unbounded Spark table into D3.

## Reuse before creating new code
Read these files first:
- `sandbox/lib/chart-spec.schema.json`
- `sandbox/lib/d3viz-core.js`
- `sandbox/lib/motion.js`
- `sandbox/lib/advanced-patterns.js`
- `sandbox/lib/pattern-catalog.json`
- `sandbox/examples.js`

Do not create a bespoke animation loop if one of these already solves it:
- `drawPath(...)`: route/line reveal with stagger and reduced-motion handling
- `createPlayback(...)`: play/pause + scrubber + discrete temporal frames + cleanup
- `attachZoom(...)`: pointer/touch pan and zoom
- `animatePathParticles(...)`: moving particles along SVG paths

## Implemented hard patterns
- `geoBubble`: temporal event map such as earthquakes
- `metro`: projected transport/network lines with traffic-scaled stations
- `barRace`: ranked temporal transitions
- `force`: draggable/zoomable lineage or dependency network
- `pack`: click-to-zoom hierarchy
- `flowMap`: animated origin-destination flows

## How to add a new visualization
1. Decide whether the request can be represented by an existing mark plus different data/options/theme.
2. If yes, generate only a new spec/example. Do not duplicate renderer code.
3. If a new renderer is genuinely required, identify the reusable interaction primitive first (playback, zoom, brush, path morph, drag, hierarchy drilldown, etc.). Put the primitive in `motion.js` or another behavior module.
4. Implement the new mark in a renderer module and add only a thin dispatch entry in the core.
5. Update the JSON Schema and pattern catalog.
6. Add an illustrative example that demonstrates the hard interaction clearly.
7. Add cleanup for every timer, interval, force simulation or long-running animation.
8. Respect `prefers-reduced-motion`.
9. Keep tooltips and labels readable at 520px minimum width.
10. Run syntax checks and browser QA before pushing.

## Pattern-selection heuristics
- Historical events / incidents / observations over time -> `geoBubble` + playback
- Ranking changes over time -> `barRace`
- DAG / lineage / dependencies / relationships -> `force`
- Nested ownership / cost / taxonomy / file tree -> `pack`
- Flights / logistics / trade / network traffic / replication -> `flowMap`
- Transit topology -> `metro`
- Conventional editorial comparisons -> `line`, `bar`, `dot`, `scatter`

## Next patterns worth implementing
Prioritize reusable behavior, not visual novelty:
1. focus + context / brushable time series (`d3-brush`)
2. animated projection/world tour (`d3-geo` + `d3-zoom`)
3. Sankey flow (`d3-sankey`, kept as an optional extension because it is not in the base d3 bundle)
4. animated treemap / hierarchy transitions
5. scatterplot tour / camera-guided storytelling
6. morphing grouped <-> stacked bars
7. temporal force-directed network
8. Canvas renderer for very large point/network counts

## Quality bar
The point of the project is not to make many charts. It is to make AI able to request something like:

> "Show our Fabric data lineage as an interactive network with source systems, Bronze/Silver/Gold, semantic models and reports. Use newsroom styling, drag/zoom, and export a React version."

and have the AI mostly produce a chart spec and data mapping rather than inventing 200 lines of fragile D3 code.
