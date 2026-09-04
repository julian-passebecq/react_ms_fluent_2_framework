# D3 GeoStory v2 - future design contract

## Why this deserves its own v2 track

Some of the most interesting D3 work in the user's old visualization sites is difficult to reproduce quickly with ordinary BI charting:

- historical earthquake playback;
- Paris/RATP projected transport visualization;
- world event maps;
- route/flow maps;
- camera-guided geographic stories;
- animated time + geography combinations.

These are worth factorizing because the expensive part is not the specific subject (earthquakes, Nobel prizes, launches, incidents, discoveries, migration, etc.). The expensive part is the reusable geometry, temporal state, zoom/camera, interaction and animation.

The future goal is therefore NOT an `EarthquakeMap.js` followed by a separate `NobelMap.js`.

The goal is a small geographic/story grammar that allows AI to generate many derived visualizations mostly by changing data and semantic options.

## Ownership

GeoStory belongs to the future D3 SDK / `@datapass/charts`, not ConceptMotion core.

ConceptMotion may later embed a GeoStory chart inside a teaching sequence, but the geographic renderer owns projections, event layers and high-volume geographic state.

## Proposed conceptual model

```text
GeoStorySpec
|
+-- geography / projection
+-- layers
|   +-- regions
|   +-- event points
|   +-- flows/routes
|   +-- transport/network lines
|   +-- labels
|   +-- annotations
|
+-- temporal model
|   +-- instant
|   +-- cumulative
|   +-- rolling window
|   +-- discrete periods
|
+-- interaction
|   +-- hover/select
|   +-- zoom/pan
|   +-- scrub/play
|   +-- focus region
|
+-- story steps
    +-- focus
    +-- filter
    +-- highlight
    +-- annotate
    +-- zoomTo
    +-- changeProjection
    +-- wait
```

## Suggested data model for temporal events

The exact schema can evolve, but AI-friendly semantics should resemble:

```json
{
  "id": "event-001",
  "longitude": 12.49,
  "latitude": 41.89,
  "time": "2026-01-01",
  "category": "physics",
  "value": 8.2,
  "label": "Example event",
  "group": "optional-series",
  "metadata": {}
}
```

Do not store projected x/y coordinates in source data.

## Suggested geographic layer families

### 1. `eventPoints`

For events located at a point.

Examples:

- earthquakes;
- prizes/birthplaces/institutions;
- launches;
- discoveries;
- public events;
- outages/incidents;
- city events.

Reusable visual behaviors:

- circle/symbol size by magnitude/value;
- color/category encoding;
- pulse/ripple on entry;
- age-based fade;
- cumulative/rolling-window modes;
- labels for selected/top events;
- tooltip/selection;
- clustering or density fallback later for large volumes.

### 2. `flows`

Origin -> destination movement.

Examples:

- flights;
- trade;
- migration;
- logistics;
- data replication;
- cloud-region traffic.

Reuse current `flowMap` path geometry, path reveal, particles and zoom rather than implementing another route animation.

### 3. `networkRoutes`

Projected transit/network topology.

Examples:

- Paris Metro/RATP;
- rail;
- airline routes;
- utility lines;
- simplified city networks.

Reuse path draw and selection behavior.

### 4. `choropleth/regionState`

Region values/statuses by time.

Examples:

- election/non-election public statistics;
- disease/health rates;
- economic values;
- coverage/deployment status;
- climate values.

### 5. `annotation`

- callout;
- event label;
- reference region;
- time milestone;
- narrative note.

## Temporal modes

Factor these once:

### Instant

Only the events in the current frame/period.

### Cumulative

All events up to the current time.

### Rolling window

Events within the most recent N days/years/frames.

### Trails

Recent events remain visible with decreasing opacity.

### Comparison

Compare two periods or categories with stable event identity where possible.

The current D3 SDK `createPlayback()` should remain the common base rather than a new timer per visualization.

## Story/tour controller

A reusable future controller should make guided storytelling possible without bespoke code.

Conceptual API:

```text
focus(target)
filter(predicate)
highlight(targets)
annotate(annotation)
zoomTo(regionOrBounds)
changeProjection(projection)
transitionTo(state)
wait(duration)
```

This can later support:

- click-through story steps;
- scroll-driven stories;
- automatic guided tours;
- ConceptMotion-controlled teaching sequences.

## Projection/camera factorization

V2 should extract reusable geographic camera behavior:

- projection selection;
- projection interpolation when feasible;
- fit world / fit bounds;
- zoom to country/region/city;
- deterministic camera transitions;
- reset/home;
- reduced-motion equivalent that jumps to final state.

## Performance strategy

Start with SVG for editorial-quality event counts.

Do not prematurely build Canvas in Foundation v1.1.

V2 should define thresholds and later allow:

```text
same GeoStorySpec
  -> SVG renderer for normal editorial data volumes
  -> Canvas/WebGL-like backend later for high-volume points
```

Large-data preparation belongs upstream in SQL/Spark/Pandas/Polars. Do not push raw distributed datasets into the browser.

## Power BI relevance

GeoStory is particularly valuable because a custom D3 visual can support interactions that are awkward in standard Power BI visuals.

A future Power BI adapter should map:

- longitude;
- latitude;
- time;
- category;
- value/magnitude;
- label/detail;
- tooltip fields;
- source/target for flows.

Power BI-specific behavior can include:

- selection IDs;
- report filters/highlights;
- native tooltips;
- play/scrub controls inside the visual;
- report-theme or editorial-preset styling.

The geometry/playback must still use the same D3 core as the web version.

## AI authoring target

Future AI request:

> Animate Nobel prizes by decade on a world map. Size marks by count, color by category, keep a five-decade trail, zoom to Europe during the 1920-1950 step, then return to the world view. Give me web and Power BI outputs.

The AI should primarily produce:

- data mapping;
- GeoStorySpec;
- story steps;
- theme/profile;
- Power BI role mapping.

It should not implement projection, playback, zoom, ripple animation and tooltips from scratch.

## Foundation v1.1 requirement

NONE of the GeoStory renderer above needs to be implemented in the current Codex pass.

Foundation v1.1 only needs to avoid architectural decisions that would make this difficult later:

- do not make every visualization React-only;
- keep figure surfaces renderer-neutral;
- keep renderer registries extensible;
- keep semantic theme metadata independent from Fluent implementation;
- keep cleanup/reduced-motion/export lifecycle disciplines consistent.
