# Architecture

## Layers

```text
Catalog taxonomy / author prompt / source metadata
                      │
                      ▼
               Scene specification
        metadata + data + deterministic frames
                      │
          ┌───────────┼─────────────┐
          ▼           ▼             ▼
     D3 renderer   Storyboard UI   Paper/cheat UI
          │           │             │
          └───── React application shell ─────┘
```

## Canonical scene v1

```js
{
  version: '1',
  id: 'example',
  title: 'Example',
  subtitle: 'One sentence mental model',
  renderer: 'table-transform',
  data: {
    rows: [...],
    columns: [...]
  },
  code: [
    'line 1',
    'line 2'
  ],
  frames: [
    {
      operation: 'FILTER',
      caption: 'Rows failing the predicate leave the visible result.',
      activeRows: ['r2'],
      visibleRows: ['r1','r3'],
      codeFocus: [1]
    }
  ]
}
```

Bundled v0 scenes remain flat. `normalizeScene()` supports both while the migration is incomplete.

## Renderer contract

A renderer receives:

- normalized scene static data;
- current frame semantic state;
- transition duration;
- a single SVG root owned by D3.

A renderer should not own global application navigation/playback state.

## Stable object identity

When a visual object moves, it needs a stable key independent of its current array position. Example:

```js
[{ id:'row-17', value:8 }, { id:'row-22', value:2 }]
```

After a swap, IDs stay attached to values while positions change. This is the basis for perceptually meaningful D3 transitions.

## Renderer vs theme

A renderer defines geometry/semantics. A theme defines visual language. Do not duplicate a renderer for `social`, `paper`, `dark`, etc.

A true handwritten/paper theme may need layout tokens beyond color:

- grid/ruled background;
- border roughness/dash patterns;
- underline/callout style;
- section density;
- arrow style;
- typography choices using safely available fonts.

## Large-scene boundary

SVG is appropriate for teaching scenes with dozens/hundreds of legible marks. For very large DAGs or datasets, retain the semantic scene/frame model and add Canvas/WebGL rendering instead of forcing SVG.
