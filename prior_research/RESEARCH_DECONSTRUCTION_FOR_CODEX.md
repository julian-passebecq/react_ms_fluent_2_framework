# Full research package deconstructed for Codex

This document explains **why the large research package exists, which parts are actually useful, what to learn from each reference project, and what not to copy**.

The FULL archive contains large repositories because they were supplied as raw research material. You do **not** need to understand or load all of them to continue ConceptMotion. This MEDIUM package includes only the high-signal files.

## The mental model

ConceptMotion should not become a clone of any one reference project.

Instead, take one or two strong abstractions from each:

```text
SQLBI Whiteboard  -> semantic object ownership + annotations + export grouping
Draw.io            -> declarative animation + live layout + layout convergence
Mermaid            -> text grammar + parser/db/renderer split + layout QA
Excalidraw         -> durable scene JSON + restore/export + import adapters
Python Diagrams    -> extremely simple diagram-as-code authoring + provider taxonomy
Cloudcraft         -> cloud blueprint object model + snapshot/import/export thinking
React animation    -> small layering/transition implementation ideas only
```

The resulting ConceptMotion architecture should remain its own:

```text
AI / human prompt
      |
      v
semantic spec (cloud / model / lineage / story / sheet)
      |
      +--> validation
      +--> layout
      +--> semantic geometry registry
      +--> annotations
      +--> renderer / animation
      +--> static export / thumbnail
```

The canonical spec is **semantic**, not a list of SVG coordinates.

---

# Priority order

If time is limited, read the references in this order.

| Priority | Reference | Why it matters now |
| --- | --- | --- |
| 1 | Mermaid | strongest direct precedent for cloud/ER grammar + layout validation |
| 1 | Draw.io | strongest direct precedent for live layout and declarative animation |
| 1 | SQLBI Whiteboard | strongest teaching-model precedent: attached annotations, recipes, export |
| 2 | Python Diagrams | strongest authoring-ergonomics and provider-taxonomy precedent |
| 2 | Excalidraw | useful durable scene/import/export model, but do not build an editor |
| 2 | Cloudcraft | useful cloud blueprint and reverse-engineering/export concepts |
| 3 | React Cloud Animation | only useful for lightweight layering / motion lifecycle |
| 3 | React Animated Charts | only useful for small component APIs / simple transitions |
| skip in medium | React Native Animated Charts | browser/D3 project gains very little from it |

---

# 1. Mermaid: the most useful reference for the new generators

Curated files are under:

`reference_essentials/mermaid/`

## What Codex should understand

### A. Architecture diagrams are a small grammar, not an editor

Mermaid's architecture syntax is built around four conceptual pieces:

- **groups**;
- **services**;
- **edges**;
- **junctions**.

Groups can nest. Services belong to groups. Edges can specify which side of a node they leave or enter (`L/R/T/B`). The grammar also supports explicit row/column alignment hints.

That is very close to what ConceptMotion needs for a **cloud diagram generator**.

Do not copy Mermaid's exact syntax. Copy the conceptual economy:

```text
container/group
node/service
edge/flow
junction
layout hint
```

Our cloud spec adds domain information Mermaid does not have strongly enough for this project:

- provider / service kind;
- stage / network / trust boundary semantics;
- flow channel (`data`, `control`, `security`, `admin`);
- animation semantics;
- explanatory annotations.

### B. Parser -> DB -> renderer separation is excellent

Read:

- `packages/mermaid/src/diagrams/architecture/architectureDiagram.ts`
- `architectureDb.ts`
- `architectureTypes.ts`
- `architectureRenderer.ts`

The small `architectureDiagram.ts` composes parser, DB, renderer, and styles. The DB validates identifiers, parent groups, and edges before drawing.

**ConceptMotion adaptation:**

Do the same separation even if initial authoring is JSON/YAML rather than a custom parser:

```text
parse/load -> normalize -> validate semantic graph -> layout -> render
```

Do not mix validation logic into SVG drawing functions.

### C. Port-aware edges are important

Mermaid architecture edges can say which side of each node participates in the connection.

For cloud diagrams, this produces much cleaner routing than letting every edge leave the center.

ConceptMotion should support either:

```json
{ "fromPort": "right", "toPort": "left" }
```

or a higher-level route hint that resolves to ports.

Do not make authors specify ports for every normal diagram. Auto-route by default; allow hints when the layout needs help.

### D. Alignment hints are worth adding

Mermaid's `align row` and `align column` solve a real problem: generic layout engines often put logically parallel services at awkward positions.

ConceptMotion cloud/data-model specs should eventually support lightweight constraints such as:

```yaml
layoutHints:
  - { type: row, ids: [sourceA, sourceB, sourceC] }
  - { type: column, ids: [bronze, silver, gold] }
```

This is much better than pixel coordinates.

### E. Layout validation is one of the best things in the whole research package

Read:

`packages/mermaid/src/rendering-util/layout-algorithms/layout-utils/validateLayout.ts`

and:

`docs/community/layout-makers-guide.md`

Mermaid explicitly checks layout problems such as:

- node overlap;
- edge crossing unrelated nodes;
- edge crossing group-title bands;
- detached endpoints;
- non-orthogonal segments when orthogonal routing is expected;
- shared/overlapping edge paths;
- labels colliding with nodes/edges;
- bends too close to arrowheads;
- border hugging.

**ConceptMotion should eventually have a `validateDiagramLayout()` test layer.**

This could be one of our strongest differentiators because AI-generated diagrams need automatic quality checks.

Recommended future checks:

```text
no node overlap
no label clipped
edge endpoint touches intended node
edge does not cross unrelated card
minimum gap between sibling nodes
container encloses descendants
relationship labels do not overlap cards
result remains inside viewBox
```

### F. ER diagrams are useful, but our data model semantics need to go further

Read:

`docs/syntax/entityRelationshipDiagram.md`

Mermaid's ER grammar demonstrates:

- entities;
- attributes;
- crow's-foot cardinality;
- optionality;
- relationship labels.

For ConceptMotion, that is the baseline. We also need BI semantics:

- fact vs dimension vs bridge;
- grain;
- PK/FK/measure/attribute roles;
- active/inactive Power BI relationship;
- single/both filter direction;
- semantic-model badges;
- source -> curated model comparison.

## What NOT to take from Mermaid

- Do not make Mermaid syntax the canonical ConceptMotion format.
- Do not require Mermaid's renderer internals.
- Do not inherit every diagram type.
- Do not use an opaque text grammar where structured JSON/YAML is clearer for AI.

Mermaid can later become an **import adapter**, not the core model.

---

# 2. Draw.io: strongest reference for layout and animation behavior

Curated files:

`reference_essentials/drawio/`

## What Codex should understand

### A. Animation is stored as declarative steps

Read:

`docs/claude/animations.md`

Draw.io stores animation as a `steps` array and supports actions such as:

- show/hide;
- opacity/fade;
- highlight;
- flow;
- style change;
- scroll/viewbox;
- wait;
- parallel steps via `immediate`.

This strongly validates ConceptMotion's Storyboard direction.

The most important idea is not the exact action list. It is this:

> **playback state should be declarative and separate from the saved diagram model.**

Draw.io distinguishes transient playback effects from model-mutating actions. ConceptMotion should keep normal animation **purely transient**: playback must not rewrite the user's semantic spec.

### B. Parallel vs sequential steps should be explicit

ConceptMotion currently thinks mostly in sequential frames.

Later, consider allowing one frame to contain parallel effect channels:

```yaml
step:
  operation: shuffle
  effects:
    - move: [r1, r2, r3]
    - pulse: worker2
    - highlight: codeLine7
```

Do not overcomplicate this until current storyboard contracts stabilize.

### C. Flow animation should be a reusable edge effect

Draw.io treats edge flow as an effect on an existing edge, not as a different topology.

This maps perfectly to ConceptMotion cloud/data-lineage diagrams:

```text
static edge geometry
     +
optional animation state
```

The edge stays the same semantic edge while packets/dashes move over it.

### D. Layout specs and live layout containers are highly relevant

Read:

`docs/claude/layouts.md`

and optionally:

`src/main/webapp/js/diagramly/ElkLayout.js`

Draw.io can store declarative layout specifications and re-run layout when content changes.

The strongest lesson for us is **idempotent layout**:

> If input semantic geometry has not changed, the next layout pass should produce no changes.

Their docs call this a convergence contract because repeated model changes can otherwise create endless layout loops.

For ConceptMotion:

- layout should be a pure or near-pure function;
- running it twice on unchanged normalized input should be stable;
- deterministic seed/order should be used where layout engines are stochastic;
- avoid "write geometry, then correct it" patterns where possible.

### E. Group/container layout is a real first-class problem

Cloud/Fabric diagrams will use nested containers heavily:

- region;
- VNet;
- subnet;
- Fabric stage;
- workspace;
- security boundary.

Draw.io's live layout container work is a warning: nested layout, anchoring, and parent bounds need explicit rules.

For v1, keep this simpler than draw.io:

- 1-3 nesting levels;
- deterministic padding;
- parent bounds derived from children;
- explicit direction per container;
- no arbitrary drag-edit loop required.

## What NOT to take from Draw.io

- no full editor clone;
- no huge shape/sidebar subsystem;
- no mxGraph state model;
- no arbitrary cell style string format;
- no collaboration/undo complexity unless a future editor genuinely needs it.

---

# 3. SQLBI Whiteboard: strongest teaching-interaction reference

Curated files:

`reference_essentials/sqlbi-whiteboard/`

The separate `SQLBI_REFERENCE_NOTES.md` already covers this deeply. The key points are repeated here because they are central.

## What Codex should understand

### A. Stable object IDs + ownership

Read:

- `src/core/model/BoardObjects.cs`
- `src/core/model/BoardDocument.cs`

Whiteboard objects have durable identity. Ink can belong to a specific container.

ConceptMotion should give every important thing a stable semantic ID:

```text
row
node
edge
entity
column
code line/token
chart point
partition bucket
container
```

### B. Annotations should attach to semantic objects

This is probably the single best SQLBI idea for ConceptMotion.

Instead of storing:

```json
{ "circle": { "x": 341, "y": 172 } }
```

store:

```json
{ "type": "circle", "targetId": "fact_sales" }
```

The renderer resolves `fact_sales` geometry on every frame.

That lets the annotation follow the object when layout or animation moves it.

### C. Markdown recipe imports are directly relevant to AI authoring

Read:

- `docs/wimport.md`
- `src/core/import/ImportDocument.cs`

The important lesson is that a recipe can remain readable as normal Markdown while compiling to structured objects.

This supports a future `.concept.md` format.

Do not finalize it before the JSON schemas settle.

### D. Export grouping is relevant to our future multi-surface output

Read:

- `src/core/export/BoardPartitioner.cs`
- `docs/export-decisions.md`

The interesting part is keeping related visual content together when generating pages/slides.

A future ConceptMotion export should understand that:

```text
visual + caption + code + attached annotations
```

is one pedagogical block and should not be split arbitrarily.

### E. DAX parsing code is included as a study reference, not a porting instruction

`src/dax/` is included because DAX code is hard to explain visually.

Study how a language engine can expose structure/classification. For browser ConceptMotion, prefer a smaller browser-compatible tokenizer/parser unless the full grammar is genuinely needed.

## What NOT to take from SQLBI

- WPF;
- Windows capture;
- pen/palm/calligraphy internals;
- installer / shell integration;
- freehand canvas as the primary product.

---

# 4. Python Diagrams: strongest authoring ergonomics precedent

Curated files:

`reference_essentials/python-diagrams/`

## What Codex should understand

### A. The API is intentionally tiny

The project succeeds because the user can express architecture through a small mental model:

- `Diagram`;
- `Cluster`;
- `Node`;
- `Edge`;
- direction;
- provider-specific node classes.

This is a very good precedent for ConceptMotion's optional Python/TypeScript authoring API.

Potential future Python ergonomics:

```python
with CloudDiagram("Sales platform") as d:
    with Container("Fabric"):
        source = DataSource("ERP")
        lake = Lakehouse("Sales Lakehouse")
        model = SemanticModel("Sales")
        report = PowerBI("Executive Report")

    source >> Flow("ingest", animate="packets") >> lake >> model >> report
```

The Python builder should compile to canonical ConceptMotion JSON. It should **not** render by itself.

### B. Provider taxonomy is valuable

The selected Azure modules show a clean provider namespace split:

- analytics;
- compute;
- database;
- devops;
- identity;
- integration;
- ML;
- network;
- security;
- storage;
- web.

This is useful for our icon/node registry.

Do not copy all provider icons blindly. Instead, build a normalized registry:

```text
canonical kind        provider aliases
---------------------------------------
database              azure.sql-database
pipeline              fabric.pipeline / azure.data-factory
notebook              fabric.notebook / databricks.notebook
object-storage        azure.storage / generic.object-storage
semantic-model        powerbi.semantic-model
```

### C. Context-manager clusters are elegant, but JSON remains canonical

Use Python for authoring convenience. Keep the canonical spec portable and language-neutral.

## What NOT to take

- Graphviz as a hard runtime dependency;
- icon files as the semantic model;
- Python-only authoring;
- provider taxonomy as a substitute for our cross-cloud canonical kinds.

---

# 5. Excalidraw: useful scene durability and import/export ideas

Curated files:

`reference_essentials/excalidraw/`

## What Codex should understand

### A. Scene data and application state are separated

Read:

`dev-docs/docs/codebase/json-schema.mdx`

Excalidraw stores:

- elements;
- appState;
- files.

ConceptMotion should preserve a similar separation:

```text
semantic lesson/spec
render/view preferences
external assets
```

Do not pollute a cloud/data-model semantic spec with UI state such as selected tab, zoom, or open panel.

### B. Restore/normalization is treated as a first-class operation

Read:

`api/utils/restore.mdx`

Imported/old scene data is normalized before use.

ConceptMotion should eventually have explicit migrations:

```text
load spec
-> detect version
-> migrate
-> normalize defaults
-> validate references
-> render
```

This matters because the scene schema is already evolving.

### C. Export is a function of elements + app state + dimensions

Read:

`api/utils/export.mdx`

For ConceptMotion, static export should similarly be a deterministic operation over a scene, style preset, and output dimensions.

### D. Mermaid-to-Excalidraw shows a useful importer strategy

The converter uses both:

- rendered SVG geometry;
- parsed Mermaid semantic structure.

This is a useful lesson for future import adapters: geometry alone loses relationships; syntax alone may not give final placement.

ConceptMotion should prefer semantic import first, then use external layout geometry only when needed.

### E. Frames show that containment/order can affect rendering

The small frames doc is a reminder that groups/containers need explicit ordering rules.

## What NOT to take

- full drawing editor;
- raw element JSON as our canonical semantic model;
- collaboration model;
- hand-drawn look as the default technical style.

---

# 6. Cloudcraft: useful cloud blueprint data model

Curated files:

`reference_essentials/cloudcraft-go/`

## What Codex should understand

### A. A cloud diagram can be represented as a blueprint with heterogeneous object collections

`BlueprintData` includes concepts like:

- theme;
- projection;
- grid;
- groups;
- nodes;
- icons;
- surfaces;
- connectors;
- edges;
- text;
- disabled layers.

This confirms that our cloud scene will likely need several classes of object, not only nodes and edges.

Our v1 should stay simpler:

```text
containers
nodes
edges
annotations
legend
layoutHints
```

Add `surfaces`/arbitrary objects only when real examples require them.

### B. Snapshot/import/export is strategically useful

Cloudcraft supports programmatic diagrams and snapshotting a cloud account into a blueprint.

Long-term ConceptMotion opportunity:

```text
Azure/Fabric metadata
   -> adapter
   -> ConceptMotion cloud spec
   -> diagram
   -> annotated explanation
```

This is much more valuable than a drag-and-drop editor for this user's AI-first workflow.

### C. Export dimensions and formats belong outside semantic topology

Cloudcraft export parameters reinforce the separation of content from presentation/export settings.

## What NOT to take

- Cloudcraft API coupling;
- account credentials/scanning in the core renderer;
- proprietary blueprint schema as our own schema;
- AWS breadth just because the SDK has it (the user's priority is Azure/Fabric/Data/BI).

---

# 7. React Cloud Animation: low priority, one useful idea

Curated files:

`reference_essentials/react-cloud-animation/`

Useful only for:

- independent animation overlay layer;
- `pointer-events: none` for decorative motion;
- theme-controlled motion state;
- fade-in/fade-out lifecycle;
- simple CSS animation classes.

For ConceptMotion, translate this into **edge animation overlays**, not moving cloud pictures.

Useful pattern:

```text
base semantic geometry remains stable
+
separate non-interactive animation overlay
```

Do not use continuous moving clouds in technical diagrams. They are decorative and would violate ConceptMotion's animation rule.

---

# 8. React Animated Charts: low priority

Curated files:

`reference_essentials/react-animated-charts/`

The useful lesson is simply that small reusable visual components can expose a tiny prop surface and animate changed geometry with CSS/SVG transitions.

The implementation is not sophisticated enough to guide our renderer architecture.

Do not use index-based identity as a model for ConceptMotion. Stable semantic IDs remain mandatory.

---

# 9. React Native Animated Charts: intentionally excluded from MEDIUM

The FULL research archive contains it.

It is low value for the current browser-first React/D3 project because much of the repository concerns mobile project scaffolding and native app examples.

Only inspect it if ConceptMotion later targets React Native/mobile-native rendering.

---

# What these references collectively imply for ConceptMotion

## 1. Keep canonical specs semantic

Good:

```yaml
nodes:
  - id: lakehouse
    type: lakehouse
    container: fabric
edges:
  - from: ingest
    to: lakehouse
    channel: data
    animation: packets
```

Bad:

```yaml
rectangles:
  - x: 419
    y: 222
line:
  - x1: 500
    y1: 260
```

Pixel geometry belongs to layout output, not author input.

## 2. Add an internal geometry registry

After layout, every semantic target should resolve to geometry:

```ts
geometry.get('lakehouse')
geometry.get('fact_sales.ProductKey')
geometry.get('edge:ingest->lakehouse')
geometry.get('code-line:7')
```

This enables:

- annotations;
- animation;
- hit testing;
- export;
- layout validation;
- synchronized code.

## 3. Layout and render must be separate

Recommended pipeline:

```text
spec
-> normalize
-> semantic validation
-> layout graph
-> layout validation
-> geometry registry
-> D3 render
-> animation overlay
-> annotation overlay
```

## 4. Layout should be deterministic and validated

Borrow the spirit of Draw.io convergence and Mermaid layout validation.

Tests should eventually assert:

- same normalized spec -> same geometry (within tolerance);
- no overlap;
- no detached edge endpoints;
- no invalid references;
- containers enclose children;
- labels stay readable.

## 5. Build provider aliases on top of canonical node kinds

Do not make the renderer understand 200 Azure product names directly.

Use:

```text
canonical renderer kind
      ^
      |
provider registry / icon alias
```

Example:

```json
{
  "kind": "pipeline",
  "provider": "fabric",
  "icon": "fabric.data-factory",
  "label": "Data Factory pipeline"
}
```

## 6. The public frontend should be a gallery/playground, not an editor

References reinforce this:

- Python Diagrams succeeds as code-first authoring;
- Mermaid succeeds as text-first authoring;
- Draw.io/Excalidraw show how much complexity a real editor introduces.

The right near-term public website is:

- searchable gallery;
- generator documentation;
- live examples;
- copyable specs;
- theme/export preview;
- optional JSON/YAML playground later.

## 7. Import adapters are higher value than a visual editor

Potential adapters, in priority order:

1. Mermaid flow/architecture/ER;
2. simple SQL schema metadata;
3. Power BI/Fabric semantic model metadata;
4. Airflow DAG definition;
5. draw.io/MxGraph subset;
6. Azure/Fabric resource inventory.

All adapters should compile to ConceptMotion canonical specs.

---

# Recommended next implementation sequence after reading the research

Do not implement everything at once.

## Phase 1 - prove the generator foundation

1. Split existing renderer code.
2. Add geometry registry.
3. Add annotation target resolver.
4. Implement cloud layout with containers + nodes + edges.
5. Implement star-schema model layout.
6. Implement simple lineage layout.
7. Add deterministic layout smoke tests.

## Phase 2 - improve diagram quality

1. Add port-aware edge routing.
2. Add row/column alignment hints.
3. Add layout validation.
4. Add legends and semantic layer labels.
5. Add packet/marching-line flow overlay.

## Phase 3 - authoring and interoperability

1. YAML/JSON authoring helpers.
2. `.concept.md` compiler experiment.
3. Python builder API inspired by Diagrams.
4. Mermaid import adapter.
5. semantic-model / Fabric metadata adapters.

## Phase 4 - public showcase

1. generator gallery;
2. live examples;
3. copy-spec buttons;
4. shareable deep links;
5. SVG/PNG export;
6. thumbnails/contact sheets.

---

# Final warning to Codex

The FULL research package is useful because it shows many mature solutions, but it can also derail the project.

Do not spend days reading whole repositories.

Use the curated files to answer specific architectural questions. The goal is not "integrate Draw.io + Mermaid + Excalidraw + SQLBI". The goal is:

> **build a small, coherent, AI-first technical visual grammar that learns the best abstractions from them.**
