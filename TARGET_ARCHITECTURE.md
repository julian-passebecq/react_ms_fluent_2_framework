# Target architecture

## Architectural intent

ConceptMotion is not a replacement for React, Fluent, D3, Mermaid or ordinary chart libraries. It is the missing **semantic explanatory-motion layer** that can be embedded in modern applications.

```text
Application / website
        |
        +-----------------------------+
        |                             |
  @datapass/ui                 app-specific UI
   (Fluent 2)                        |
        |                             |
        +-------------+---------------+
                      |
            @conceptmotion/react
                      |
             @conceptmotion/svg
                      |
             @conceptmotion/core
```

## Package responsibilities

### `@conceptmotion/core`
Pure TypeScript. No DOM, React or Fluent.

Owns:

- canonical scene schema/types;
- entities and stable IDs;
- semantic actions;
- frame/timeline compilation;
- transition planning/state diffing;
- deterministic semantic state;
- annotation targeting;
- validation and limits;
- theme/preset metadata contracts;
- serialization/import/export of specs.

### `@conceptmotion/svg`
Framework-independent SVG/D3 layer.

Owns:

- geometry/layout primitives;
- tables/rows/cells;
- nodes/containers/ports;
- edges/routes/markers;
- chart marks useful for explanation;
- keyed render/update behavior;
- flow overlays/particles;
- SVG freeze/export;
- renderer registry organized by family.

D3 should primarily provide scales, shapes, interpolation, hierarchy/graph utilities and keyed DOM transitions where useful.

### `@conceptmotion/react`
Thin integration.

Owns:

- `<ConceptScene>`;
- lifecycle bridge to SVG renderer;
- `useConceptTimeline`;
- `useSceneSelection`;
- playback state hooks;
- accessible React wrappers;
- React error boundaries/fallbacks.

It should not contain the core geometry/semantics.

### `@datapass/ui`
Fluent-based product composites.

Owns only recurring application composition, never ConceptMotion semantics.

## Studio app

The Studio is a consumer and showcase. It may import all packages, but packages must not import from the Studio.

## Future adapters

Later, without changing core semantics:

```text
@conceptmotion/web-component
@conceptmotion/powerbi
@conceptmotion/export
```

These are deliberately outside v1 scope.
