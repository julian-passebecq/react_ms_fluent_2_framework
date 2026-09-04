# SQLBI Whiteboard reference notes for ConceptMotion

The user supplied the full SQLBI Whiteboard source. In this MEDIUM handoff, selected high-signal files are included under `reference_essentials/sqlbi-whiteboard/`; the complete repository remains available only in the FULL research package. The selected source retains the MIT license.

SQLBI Whiteboard is not the product we are building. It is a native Windows 11 teaching canvas. The value is in its interaction/model abstractions.

## Most useful concepts to study

### 1. Stable board objects and semantic IDs

Useful files:

- `src/SQLBI.Whiteboard.Core/Model/BoardObjects.cs`
- `src/SQLBI.Whiteboard.Core/Model/BoardDocument.cs`

The core model represents board items as objects with stable GUIDs, z-index, bounds, and specialized types. Ink strokes can optionally hold a `ContainerId`.

ConceptMotion adaptation:

- every moving row/node/link/code-line/chart mark should have a stable semantic ID;
- annotations should target those IDs, not absolute pixels;
- target geometry should be resolved at render time;
- scene-global annotations should remain in scene coordinates.

This directly supports object continuity and AI-authored annotations.

### 2. Attached ink follows a container

Useful file:

- `src/SQLBI.Whiteboard.Core/Model/BoardObjects.cs`

`InkStrokeObject` can be attached to a container. `TransformWithContainer` transforms the attached stroke when its container moves/resizes.

ConceptMotion adaptation:

Do not implement freehand ink first. Implement semantic annotations first:

- circle target;
- underline target;
- highlighter band;
- arrow/callout from one target to another;
- label/note anchored to a target;
- temporary focus/laser trail.

The key invariant is ownership: if an annotation belongs to a single semantic object, it follows that object across frames.

### 3. Command history / undo

Useful file:

- `src/SQLBI.Whiteboard.Core/Commands/CommandHistory.cs`

ConceptMotion adaptation:

If an authoring studio is added, edits to scenes/annotations should be command-based so undo/redo is reliable. Playback itself should remain deterministic frame navigation, not command history.

### 4. Markdown recipe import

Useful files:

- `docs/wimport.md`
- `src/SQLBI.Whiteboard.Core/Import/ImportDocument.cs`
- `src/SQLBI.Whiteboard.Core/Import/ImportCatalog.cs`
- `docs/samples/contoso-workshop.wimport`

`.wimport` is intentionally normal Markdown with a small grammar that builds containers. It avoids explicit coordinates and remains readable in GitHub/VS Code.

ConceptMotion adaptation:

Consider a `.concept.md` compiler where an AI/human can author a concept with normal Markdown sections plus fenced semantic blocks. Keep the file readable without ConceptMotion. Do not require pixel coordinates.

Possible future example:

```md
# SQL LEFT JOIN

## Mental model
Keep every row from the left table.

## Data
```json concept-data
{ ... }
```

## Story
```yaml concept-frames
- operation: MATCH
  focusIds: [customer-2, order-8]
- operation: NULL_EXTEND
  focusIds: [customer-3]
```

## Code
```sql
SELECT ...
```
```

Do not finalize this grammar until the canonical JSON schema is stable.

### 5. Code as a first-class container

Useful files:

- `src/SQLBI.Whiteboard.Dax/`
- `src/SQLBI.Whiteboard.SqlServer/SqlServerLanguageEngine.cs`
- guide section on Text, SQL, and DAX.

ConceptMotion adaptation:

The Storyboard code panel should be a proper semantic component with:

- language/dialect metadata;
- stable line/token IDs;
- formatting;
- synchronized `codeFocus`;
- annotations anchored to clauses/tokens;
- readable display mode separate from editing mode.

Do not port the C# DAX/SQL parser unless there is a strong reason. Prefer browser-compatible formatters/parsers or a smaller teaching-oriented tokenizer.

### 6. Live -> freeze -> annotate state model

Useful guide/source areas:

- guide section `LiveView`;
- WPF LiveView implementation in the application source.

ConceptMotion adaptation:

Potential future feature: import a real artifact (query plan JSON, table sample, dataframe schema, DAG definition, screenshot), freeze it into deterministic source state, then build a lesson/annotations around that snapshot.

This should be data-source adapters, not Windows screen capture.

### 7. Automatic export partitioning

Useful files:

- `src/SQLBI.Whiteboard.Core/Export/BoardPartitioner.cs`
- `docs/export.md`
- `docs/export-decisions.md`
- `src/SQLBI.Whiteboard.Export/PdfDocumentWriter.cs`
- `src/SQLBI.Whiteboard.Export/PptxDeckWriter.cs`

`BoardPartitioner` groups containers with linked strokes and splits the board across the widest empty bands.

ConceptMotion adaptation:

A future exporter can group each explanation block (visual + code + caption + annotation) and produce slide/page/card layouts without slicing through related content. Reimplement for browser/DOM/SVG layout rather than porting the C# geometry code.

### 8. Board thumbnail / contact sheet

Useful files:

- `src/SQLBI.Whiteboard.ThumbnailHandler/`
- guide section about saved-board previews.

ConceptMotion adaptation:

Every catalogue concept should eventually have a generated representative thumbnail. A contact-sheet/grid is much easier to browse than title-only cards.

### 9. Small UI around the teaching surface

Useful guide idea:

The whiteboard keeps the drawing toolbar deliberately small and pushes secondary settings into Preferences.

ConceptMotion adaptation:

Do not cover the visualization with framework controls. Keep primary controls close to the scene (play/step/speed/theme/parameter), put authoring/debug settings elsewhere.

## What NOT to port

These are product-specific and should not become ConceptMotion requirements:

- WPF application architecture;
- Windows capture APIs / LiveView implementation;
- pen-pressure plumbing;
- palm rejection;
- installer/MSIX/WiX infrastructure;
- shell thumbnail COM integration;
- calligraphy physics;
- Windows-only input handling.

Use them only as references if ConceptMotion later gains a dedicated authoring canvas.

## Licensing

The supplied repository includes:

`MIT License - Copyright (c) 2026 SQLBI Corp.`

If any source code is copied or substantially derived, preserve the license/copyright notice. Architectural ideas can be independently reimplemented; that is the preferred path.

## Recommended first experiment

Add a tiny annotation grammar to one existing moving table scene:

1. target the current row by semantic ID;
2. draw a translucent highlight band behind it;
3. anchor an arrow from the row key to the synchronized SQL clause;
4. move to the next frame;
5. verify both annotations resolve against the new target geometry without storing new pixel coordinates.

If that works cleanly, generalize annotation resolvers for table rows, DAG nodes, code lines, partition buckets, chart marks, and result rows.
