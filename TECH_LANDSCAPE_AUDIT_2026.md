# Visualization / interaction technology landscape audit — 2026

**Reviewed:** 2026-09-07  
**Purpose:** decide what Datapass/ConceptMotion/ForgeViz should own, adapt, integrate, benchmark, or deliberately not rebuild.

This is a strategy document, not a dependency shopping list. The project should only add a library when it materially reduces implementation cost or enables a capability that our semantic engines should not own.

---

## 1. Primary conclusion

The modern visualization ecosystem is already extremely strong for:

- ordinary charts;
- declarative data encoding;
- large Canvas/WebGL datasets;
- node editors;
- map rendering;
- generic animation;
- Power BI Vega/Vega-Lite authoring;
- Jupyter web-widget hosting.

Therefore the project should **not** compete on commodity breadth.

Our differentiated scope remains:

1. **ConceptMotion** — semantic technical/educational state: code, rows, cells, joins, algorithms, workflow state, explanations and deterministic teaching choreography.
2. **ForgeViz** — reusable analytical/editorial D3 stories where ordinary chart libraries do not provide the desired narrative state, annotations, motion or bespoke composition.
3. **Datapass / Fluent J** — AI-friendly learning/application composition, source/corpus handling, progress, code, Figure hosting and consumer scaffolding.

A future host may route some visuals to external libraries without changing those ownership boundaries.

---

# 2. Decision matrix

| Technology | What it is best at | What it teaches us | Project decision |
| --- | --- | --- | --- |
| **D3 7.9** | Low-level web-standard visualization, scales/layouts/data joins/transitions | Dynamic bespoke graphics benefit from direct enter/update/exit control; D3 itself recommends higher-level Plot for ordinary charts | **KEEP** as ForgeViz's low-level analytical engine; do not use for application shell or every chart |
| **Observable Plot** | Concise high-level exploratory/standard charts | Commodity charts should be cheap; D3 need not own simple private dashboards | **ROUTE/REFERENCE** for ordinary charts where no differentiated ForgeViz story is needed |
| **Vega-Lite 6.4.x** | Declarative JSON grammar of interactive graphics | Strong schema/compiler/defaults model; concise mark/encoding/transformation composition | **ADAPT concepts, do not clone**; important Power BI/Deneb comparison baseline |
| **Vega** | Lower-level declarative visualization runtime | A general visualization grammar already exists | **DO NOT build another universal Vega** |
| **Apache ECharts 6.x** | Broad chart catalog, responsive defaults, Canvas/SVG, large datasets | Commodity/high-volume chart breadth is already solved; renderer abstraction matters | **USE when appropriate**, especially dashboards/high-volume; do not wrap without value |
| **AntV G2 5.x** | Grammar of visualization + transforms + interaction + enter/update/exit animation | Presentation/animation grammar ideas; good evidence that animation can be data/state driven | **REFERENCE/ADAPT concepts**, not a core dependency now |
| **Apple Swift Charts** | Concise declarative native charts with marks/scales/axes/accessibility | Good API-design benchmark: communicate intent with composable marks and useful defaults | **DESIGN INSPIRATION ONLY**; not a web dependency |
| **D3FC** | D3-style series with shared SVG/Canvas/WebGL APIs | Before writing our own alternate renderer, benchmark a compatible backend | **BENCHMARK FIRST** for dense ForgeViz families |
| **LightningChart JS 9** | Extreme GPU/high-rate data rendering | High-performance specialists exist; agent docs/MCP show AI DX is a product feature | **SPECIALIST OPTION**, not project architecture; commercial/license considerations apply |
| **React Flow / XYFlow 12** | Node-based editors, drag/drop, zoom/pan, editable graphs | Do not implement generic node-editor interaction ourselves | **CONSUMER-ONLY if needed**; never ConceptMotion core dependency by default |
| **Mermaid** | Text-authored diagrams and common graph types | Source-first diagrams are useful and AI-friendly | **REFERENCE/IMPORT/consumer option**; do not replace semantic WorkflowSpec/DiagramSpec |
| **deck.gl** | High-scale WebGL maps/layers/camera/path animation | Serious geo should use a mature map/layer engine; TripsLayer already models animated temporal paths | **FUTURE ADAPTER/BACKEND**, not a custom map engine |
| **Motion for JavaScript** | HTML/SVG/WebGL animation, sequences, scroll/gesture helpers | Useful for host/story choreography; animation API can stay separate from semantic state | **OPTIONAL HOST TOOL**, not ConceptMotion semantic engine |
| **Theatre.js** | Timeline/sequencer/keyframes/playhead authoring | Timeline/tracks/playhead UX is valuable | **BORROW THE MODEL**, avoid making Theatre state canonical |
| **Konva** | Canvas scene graph and interactive drawing/editor apps | Useful for free-form canvas editors, not semantic SVG learning diagrams | **REJECT for current core**; reconsider only for proven free-form editor need |
| **TradingView Lightweight Charts** | Fast financial time-series UI and series markers | Event annotations are a general reusable pattern | **REFERENCE** for ForgeViz `event-time-series`, not finance-specific hard-coding |
| **Grafana annotations** | Operational events over metrics | Same event model works for deployments/incidents/schema changes | **REFERENCE** for generalized event annotations |
| **Power BI Custom Visual SDK** | Native `.pbiviz` hosting and Power BI interactivity | React and D3 are both viable inside custom visuals; host boundary matters | **FUTURE THIN ADAPTER PROOF** |
| **Deneb** | Certified Power BI Vega/Vega-Lite custom visual, JSON editor/schema validation | Baseline competitor for declarative Power BI visuals | **COMPARE BEFORE BUILDING** ForgeViz Power BI work |
| **anywidget** | Portable web widgets in Jupyter/VS Code/Colab/marimo | Framework-neutral JS engines can be reused from notebooks without Python rewrites | **FUTURE THIN ADAPTER**, low priority |
| **Evidence** | Code-driven BI/data products from SQL + Markdown | Source control + code-first authoring is preferable to opaque drag/drop state for our target | **ADOPT PHILOSOPHY**, not necessarily runtime dependency |
| **Pandas Tutor** | Semantic table/dataframe transformation lineage | Input/output row/column/cell correspondence is a powerful teaching abstraction | **CONCEPTUAL INSPIRATION** already reflected in Table Trace |
| **Data Tweening / Datamations** | Semantic micro-operations and animated data transformation | Complex operations can decompose into reusable movement/group/collapse primitives | **CONCEPTUAL INSPIRATION** for ConceptMotion choreography |
| **Learn Git Branching** | Mutable graph/pointer teaching state | Technical systems beyond tables can use semantic state + visual delta | **FUTURE CONSUMER TEST** before adding `graph.state` |

---

# 3. D3 / Observable Plot

Official D3 documentation describes D3 as a **low-level toolbox**, not a conventional chart library. It explicitly recommends Observable Plot when the developer does not need D3's low-level control and highlights data joins / enter-update-exit as the mechanism that makes dynamic visualizations powerful.

Sources:

- https://d3js.org/what-is-d3
- https://observablehq.com/plot/

### Implication for ForgeViz

This strongly validates the project's direction:

```text
ordinary chart
    -> Plot / ECharts / Vega-Lite / another mature chart library

bespoke editorial/narrative visualization
    -> ForgeViz + D3
```

ForgeViz should not justify itself by offering another generic bar/line/scatter API. It should justify itself through:

- semantic story state;
- stable identities;
- narrative annotations;
- deterministic scenes;
- unusual composition;
- event-driven time stories;
- transitions a generic dashboard library does not model well;
- portability of the same differentiated StorySpec to web/Power BI/other hosts.

### React + D3 decision

React was not a bad start. D3's own documentation notes that D3 can be paired with React/Vue/Svelte. The correct ownership split is:

- React owns application composition;
- D3 owns selected visualization geometry/state transitions;
- framework-neutral ForgeViz owns the semantic analytical spec;
- do not let both React and D3 compete to own the same DOM subtree without a clear adapter boundary.

---

# 4. Vega / Vega-Lite / Deneb

Vega-Lite describes itself as a **high-level grammar of interactive graphics** with concise declarative JSON, mark/encoding mappings, transforms, layered/multi-view composition and selections.

Source:

- https://vega.github.io/vega-lite/

Current site observed on 2026-09-07: Vega-Lite 6.4.3.

### What to borrow

- schema-first authoring;
- compiler/normalization model;
- good defaults;
- separate high-level authoring from lower-level runtime;
- explicit data transforms and visual encodings;
- online/playground workflow.

### What not to do

Do not create a project-wide generic visualization grammar that competes with Vega/Vega-Lite.

Our JSON grammars should remain semantically bounded:

- Table Trace expresses provenance/transformation relations;
- WorkflowSpec expresses orchestration behavior;
- DiagramSpec expresses architecture/topology;
- ForgeViz StorySpec expresses editorial/narrative analytical scenes.

### Power BI consequence

Deneb is a Microsoft-certified Power BI custom visual that renders Vega/Vega-Lite JSON and includes a spec/config editor with schema validation.

Sources:

- https://deneb.guide/
- https://deneb.guide/docs/next

Therefore a future ForgeViz Power BI adapter must answer:

> What differentiated StorySpec behavior does ForgeViz provide that is meaningfully harder or less natural in Deneb/Vega?

If the answer is "ordinary custom bar/line/scatter," use Deneb instead.

---

# 5. Apache ECharts

Official ECharts documentation currently advertises ECharts 6.x, broad chart coverage, Canvas/SVG switching, progressive rendering and stream loading. The best-practice guide recommends Canvas for larger numbers of elements and notes that SVG and Canvas are abstracted through its underlying renderer.

Sources:

- https://echarts.apache.org/en/
- https://echarts.apache.org/handbook/en/best-practices/canvas-vs-svg/
- https://echarts.apache.org/handbook/en/basics/release-note/v6-feature/

### Decision

Use ECharts directly when a consumer needs:

- commodity dashboards;
- many standard chart families;
- good defaults;
- Canvas scale;
- rapid implementation without differentiated story semantics.

Do not put ECharts behind a Datapass wrapper merely to say the project owns the chart.

ForgeViz can coexist with ECharts because they solve different economics.

---

# 6. AntV G2 and Apple Swift Charts

AntV G2 explicitly models marks, transforms, scales, coordinates, composition, interaction and animation. Its animation system distinguishes enter/update/exit and supports data-driven timing and morphing.

Sources:

- https://g2.antv.antgroup.com/en/manual/introduction/what-is-g2
- https://g2.antv.antgroup.com/en/manual/core/animate/overview

Apple Swift Charts similarly exposes marks, scales, axes and legends as composable building blocks, with accessibility/localization and animation support.

Sources:

- https://developer.apple.com/documentation/Charts
- https://developer.apple.com/documentation/Charts/Creating-a-chart-using-Swift-Charts

### Project lesson

Both reinforce a useful rule:

> **Good visualization APIs describe the communication intent and use defaults intelligently; they do not make every consumer specify low-level geometry.**

For ConceptMotion/ForgeViz, this means presentation options should be constrained semantic controls rather than arbitrary SVG styling fields.

---

# 7. D3FC / Canvas / WebGL / LightningChart

D3FC provides series with parallel SVG, Canvas and WebGL APIs for lines, bars, points, candlesticks, OHLC, heatmaps and more.

Source:

- https://github.com/d3fc/d3fc/tree/master/packages/d3fc-series

This makes D3FC the most sensible first benchmark before writing a custom alternate rendering backend for ForgeViz.

LightningChart demonstrates what an extreme specialist WebGL product can do. Its current public performance material advertises very large data loads and its 2026 v9 release emphasizes multi-threaded streaming and AI-agent tooling/MCP.

Sources:

- https://lightningchart.com/js-charts/performance/
- https://lightningchart.com/news/lightningchart-js-v9-0-0/

### Project decision

Do **not** make 10M points a design target for ConceptMotion. Educational semantics should reduce data to representative state rather than literally render every record.

ForgeViz performance path:

1. establish representative performance fixtures;
2. measure SVG/D3 ceilings;
3. test D3FC Canvas/WebGL for selected families;
4. test ECharts for commodity high-volume cases;
5. only then consider custom Canvas/WebGL architecture.

---

# 8. Node/graph/editor landscape

## React Flow / XYFlow

React Flow provides out-of-the-box node dragging, zoom/pan, selection, edge creation/removal and node-editor primitives.

Source:

- https://reactflow.dev/

Current docs observed: React Flow 12.11.x.

### Decision

Do not add React Flow to ConceptMotion core just because graph editing is hard. If a future **consumer** genuinely needs an editable architecture/pipeline canvas, use React Flow there and compile its result to the project's semantic specs.

ConceptMotion is an explanatory renderer, not a node editor framework.

## Mermaid

Mermaid remains valuable for concise source-authored diagrams. It is appropriate for static documentation and simple diagrams.

The project should not replace WorkflowSpec/DiagramSpec with Mermaid because those specs carry semantic behavior, provider-independent state and deterministic teaching contracts that generic diagram text does not.

## Potential `graph.state`

The Git diagrams and Learn Git Branching suggest a possible future semantic family:

```text
nodes
edges
pointers
groups/zones
tokens
```

with operations such as pointer movement, edge creation/removal and token movement.

But this should be introduced **only if a Git/system-state consumer proves DiagramSpec + current scene semantics are insufficient**.

---

# 9. Motion / Theatre / Konva

## Motion for JavaScript

Motion's current JavaScript API supports HTML/SVG animation, transforms, paths, sequences, values and WebGL objects. It can serve as a compact host/page choreography layer.

Source:

- https://motion.dev/docs/animate

### Decision

Use Motion only where it reduces host/story choreography code. ConceptMotion/ForgeViz remain authoritative for **what semantic state changed**.

```text
semantic engine
    -> what changed

Motion / D3 / WAAPI
    -> optional interpolation / presentation
```

ConceptMotion Table Trace currently uses the browser Web Animations API directly and does not need Motion merely for dependency fashion.

## Theatre.js

Theatre's sequence editor/playhead/keyframe model is useful inspiration for future StorySpec editing.

Source:

- https://www.theatrejs.com/docs/latest/manual/sequences

Borrow:

- tracks;
- keyframes;
- playhead;
- labeled timing;
- grouped property editing.

Do not make Theatre project state the canonical source. The canonical source remains versionable JSON/specs.

## Konva

Konva is a strong Canvas scene-graph/editor library. It becomes useful for drag/drop or free-form drawing apps.

Decision: **not current core**. The project is not building Figma/Excalidraw.

---

# 10. Geospatial landscape

## deck.gl

Deck.gl provides WebGL layers, camera transitions and temporal path animation. `TripsLayer` already exposes a `currentTime` playhead and trail behavior for animated paths.

Sources:

- https://deck.gl/docs/developer-guide/animations-and-transitions
- https://deck.gl/docs/api-reference/geo-layers/trips-layer

### Decision

Future serious geo architecture should be:

```text
ForgeViz StorySpec / semantic event-time data
        -> geo adapter
        -> deck.gl (+ MapLibre/appropriate basemap host)
```

not a bespoke Datapass map renderer with custom camera/layer infrastructure.

Small bounded schematic maps may remain SVG/D3 when appropriate.

### Deferred geo flagships

- earthquake time story;
- flood/city progression;
- actor/movie geographic movement;
- other temporal path stories.

These are **examples to validate reusable geo/time/story primitives**, not separate engines.

---

# 11. Finance / event annotation pattern

TradingView Lightweight Charts supports semantic markers attached to time-series points. Grafana similarly uses annotations to overlay deployments, alerts and other events on metrics.

Sources:

- https://tradingview.github.io/lightweight-charts/tutorials/how_to/series-markers
- Grafana annotation documentation / examples

### Project decision: generalized `event-time-series`

Do not create a finance-only Yahoo-style renderer. Create a reusable event annotation model that can support:

### Finance

```text
price
  ^ earnings
       ^ rate decision
             ^ product launch
```

### BI

```text
KPI
  ^ campaign
       ^ pricing change
             ^ acquisition
```

### Data engineering

```text
pipeline latency
  ^ deployment
       ^ schema change
             ^ incident
```

### DataForge Learn

```text
job duration
  ^ cache enabled
       ^ skew introduced
             ^ repartition
```

This is a high-value ForgeViz P1 capability because it expresses evidence/story relationships rather than another generic line chart.

---

# 12. Power BI landscape

Microsoft officially supports custom Power BI visuals and provides a React-based visual tutorial. React is therefore **not** a blocker. The custom-visual host boundary is `.pbiviz`/Power BI's visual API, not the Datapass application shell.

Sources:

- https://learn.microsoft.com/en-us/power-bi/developer/visuals/
- https://learn.microsoft.com/en-us/power-bi/developer/visuals/create-react-visual

### Proposed future architecture

```text
Power BI DataView
      -> adapter
      -> ForgeViz VisualizationSpec / StorySpec
      -> framework-neutral renderer
      -> Power BI visual host element
```

Do not embed the whole Datapass router/app shell in Power BI.

### Decision gate against Deneb

Before building a generalized adapter, implement **one differentiated proof** and compare:

- authoring effort;
- bundle/runtime constraints;
- Power BI selection/tooltips/interactivity;
- export/certification constraints;
- what ForgeViz adds beyond Vega/Vega-Lite/Deneb.

If Deneb already solves the visual cleanly, prefer Deneb.

---

# 13. Jupyter / Python landscape

`anywidget` defines a portable standard/toolset for reusable web-based widgets and supports Jupyter, JupyterLab, Colab, VS Code, marimo and other environments.

Source:

- https://docs.anywidget.dev/

### Decision

Jupyter support does not require rewriting ForgeViz/ConceptMotion in Python.

Potential future adapter:

```python
from vizforge_widget import VizForge
VizForge(spec=spec)
```

where the Python layer hosts the existing JS engine.

Low priority compared with Power BI and web consumers.

---

# 14. BI-as-code / Evidence

Evidence describes itself as a code-driven alternative to drag-and-drop BI and generates data products from SQL/Markdown/source files.

Source:

- https://docs.evidence.dev/

This strongly supports the project's source-first direction:

```text
source / JSON / Markdown
    -> validation
    -> compile/render
    -> live preview
    -> version control
```

The Visual Lab should not introduce hidden editor state as a second source of truth. UI controls may modify JSON, but the resulting source remains canonical.

---

# 15. Educational transformation references

## Pandas Tutor

Pandas Tutor's useful idea is not its visual style. The important concept is semantic correspondence across:

- table;
- row;
- column;
- cell;
- series/index/scalar;

with relationships such as use/map/drop.

Source repository:

- https://github.com/SamLau95/pandas_tutor

ConceptMotion Table Trace already extends this direction with a general relation vocabulary and motion derivation.

## Data Tweening / Datamations

Useful principle:

> complex data transformations can decompose into small semantic visual operations rather than requiring one renderer per API verb.

This directly supports Table Trace's `use/map/drop/create/derive/group` model.

## Learn Git Branching

Useful principle:

> a system can be explained by mutating semantic graph/pointer state and rendering the delta.

Use it as future evidence for Git/state lessons, not as authorization for another graph engine.

---

# 16. AI / coding-agent developer experience

A notable 2026 market signal is LightningChart's explicit agent tooling: updated agent docs, MCP support and an agent skill in its v9 release.

The project does **not** need to copy MCP immediately, but it reinforces that AI developer experience must be a product surface rather than an afterthought.

Minimum Datapass/ConceptMotion/ForgeViz AI pack should include:

```text
AGENTS.md / quickstart
capabilities.json
examples/index.json
schemas/
structured validators
simple targeted commands
```

Example capability response:

```text
intent: explain SQL LEFT JOIN
engine: ConceptMotion
family: table.trace or table.join
canonical examples: ...
supports: stable rows, fan-out, null extension, code focus
avoid: ForgeViz, React Flow
```

A coding AI should not need to read the complete V1–V4 historical record just to discover a renderer.

---

# 17. Rendering-scale policy

Do not use "maximum data points" marketing numbers as the framework architecture metric.

Different problems require different representations:

### ConceptMotion

Educational state. Prefer a compact semantically representative subset.

### ForgeViz

Editorial/analytical storytelling. SVG is useful for semantics/export until measured scale says otherwise.

### High-volume dashboard

Use ECharts/D3FC/LightningChart or another specialist if the problem is genuinely high-volume rendering.

### Large geo

Use deck.gl or another mature WebGL map/layer engine.

The project should route to the correct engine instead of forcing one renderer to win every benchmark.

---

# 18. Final architecture recommendation

```text
DATAPASS / FLUENT J
application + learning + content + code + progress + Figure host

             |
      semantic visual intent
             |
     +-------+---------+
     |                 |
CONCEPTMOTION       FORGEVIZ
technical teaching  editorial analytical stories
semantic SVG        D3 geometry/story state
     |                 |
     +--------+--------+
              |
      specialist adapters when proven
      ECharts / D3FC / deck.gl / Power BI / anywidget
```

### Do not build

- a universal graph grammar;
- a universal chart grammar;
- a map engine;
- a node editor;
- a Canvas/WebGL renderer without evidence;
- a BI platform;
- an observability platform;
- a universal execution environment.

### Do build/improve

- semantic teaching grammars;
- deterministic story state;
- JSON-first authoring;
- canonical fixtures;
- AI capability discovery;
- cross-repository packages;
- differentiated editorial stories;
- thin adapters to mature specialist ecosystems.

That is the route that maximizes the value of the work already completed while reducing future implementation cost.
