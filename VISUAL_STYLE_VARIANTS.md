# Visual style variants - professional first, expressive later

## Default

Foundation v1.1 remains professional/light/concise.

Do not redesign the application as a colorful education toy.

## Future renderer style profiles

The user likes occasional visual teaching styles that resemble hand-drawn notes, colored marker diagrams or concise social-media cheat sheets.

Treat this as a renderer/theme profile, not a second component system.

Possible future profiles:

- `professional` - default Fluent/Datapass visual language;
- `editorial` - BBC/Economist/FT-influenced figure framing;
- `sketch` - hand-drawn/whiteboard-like explanatory figures;
- `presentation` - larger type and simplified detail;
- `print` - static/PDF-safe.

## `sketch` principles

If implemented later:

- preserve semantic layout and stable IDs;
- use SVG paths/fonts/underlines/marker highlights to evoke drawing;
- keep text readable and accessible;
- do not depend on real freehand input;
- do not introduce a canvas whiteboard unless a separate product genuinely needs it;
- same scene/spec should be able to switch back to professional style.

## Useful lesson from the Whiteboard reference

The uploaded SQLBI Whiteboard project is a full native drawing product with ink, import/export and replay. That is far beyond this platform's scope.

What is reusable conceptually is:

- replay as semantic time/state;
- SVG as a durable vector format;
- code containers with syntax highlighting;
- export-friendly figures;
- a compact tool surface.

Do not copy its WPF/ink architecture into the web platform.
