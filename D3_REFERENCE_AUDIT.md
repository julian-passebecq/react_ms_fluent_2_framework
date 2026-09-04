# D3 v7 reference audit for Foundation v1.1

This file summarizes why the supplied D3 SDK snapshot matters to the platform architecture.

## Reference location

`reference_material/d3viz_v7_reference/`

The files are read-only references for this pass.

## Useful existing factorization

### `motion.js`

Already centralizes hard animation behavior:

- reduced-motion detection;
- path drawing;
- zoom/pan;
- playback controls/timer cleanup;
- animated path particles.

This is strong evidence that future animated maps should extend shared primitives, not create one-off animation loops.

### `advanced-patterns.js`

Already centralizes reusable structural patterns:

- bar race;
- force network;
- hierarchy pack;
- flow map.

These are patterns, not subject-specific demos.

### `chart-spec.schema.json`

The canonical spec already separates mark/data/encoding/options from runtime host.

### `exporters.js`

The project already targets web/React/Power BI/notebook environments. The Power BI branch is currently more duplicated than ideal, which is a v2 target.

### `themes.js`

Publisher-inspired visual presets are already separated from chart logic, though v2 should make these more structural than simple palette/font tokens.

## What Foundation v1.1 should learn from it

1. Keep rendering cores framework-independent where practical.
2. Put React at the adapter/product layer.
3. Build semantic specs instead of one-off visualization source files.
4. Factor motion/interaction behaviors once.
5. Keep lifecycle cleanup/reduced motion mandatory.
6. Separate application UI from visualization grammar.
7. Keep runtime adapters thin.

## What Foundation v1.1 should NOT copy

- do not move the D3 chart spec into ConceptMotion core;
- do not duplicate the D3 SDK renderer inside the Studio;
- do not implement a second flow-map engine in ConceptMotion;
- do not use the D3 SDK as an excuse to expand v1.1 scope;
- do not rewrite Power BI generation now.

## Future integration point

The clean future path is:

```text
@dapass/ui FigureFrame / VisualizationSurface
             |
     +-------+--------+
     |                |
ConceptMotion       @datapass/charts
     |                |
 explanatory       analytical/geographic
     +-------+--------+
             |
        product pages
```

ConceptMotion may later orchestrate an embedded chart as one step of an explanation, but the chart SDK remains the owner of chart/geospatial grammar.
