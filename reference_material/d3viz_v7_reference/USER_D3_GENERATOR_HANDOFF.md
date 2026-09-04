# D3 Visualization Generator — Project Handoff

## 1. What the user asked for

The starting point was an existing D3.js website containing recovered/legacy visualization experiments, including:

- Economist-inspired graphics
- earthquake visualization
- Paris RATP / metro visualization
- recovered old D3/DataVis.fr examples
- various experimental charts

The existing website was useful as an archive/showcase but was not sufficiently structured or reusable.

The user wanted to transform the idea into something substantially more useful:

> Build a robust D3.js visualization generator/library that can create editorial-quality charts and reuse the same visualization across React websites, Power BI custom visuals, Microsoft Fabric notebooks, Databricks notebooks, Jupyter notebooks, and potentially BigQuery environments.

The user specifically wanted:

- Economist-style visualization examples
- BBC-style visualization examples
- preservation of the useful earthquake and RATP legacy examples
- a generator rather than only a chart gallery
- reusable D3.js components
- possible Power BI custom visual generation
- React integration
- notebook generation
- compatibility with data prepared using:
  - pandas
  - Polars
  - PySpark
  - Databricks
  - Microsoft Fabric
  - potentially BigQuery

The broader question was also architectural:

> Should this become a React library, a D3 library, a Power BI generator, a notebook generator, or something else?

---

# 2. Architectural decision

The important decision was **not to make React the core library**.

Instead, the system was designed around this abstraction:

```text
DATA / DATA ENGINE
        ↓
CANONICAL CHART SPEC
        ↓
D3 RENDERING ENGINE
        ↓
PLATFORM ADAPTER
        ↓
React / Power BI / Fabric / Databricks / Jupyter / HTML / SVG

```

This means the reusable intellectual core is:

1. a platform-independent visualization specification;
2. a D3 renderer;
3. editorial style/theme definitions;
4. exporters/adapters.

React is only one possible host.

Power BI is another host.

A notebook is another host.

This is much more reusable than creating separate implementations for every platform.

---

# 3. What was reused

## Existing D3 website

Repository:

```text
julian-passebecq/d3siteeco

```

Existing site:

```text
https://d3ecosite.netlify.app/

```

The existing `/sandbox/` contained a large D3 recovery project.

It already included:

- D3 7.9
- legacy DataVis.fr reconstruction
- RATP data
- earthquake data
- recovered visualization assets
- synthetic fallback datasets
- several archived D3 examples

The useful datasets/assets were preserved rather than discarded.

In particular:

### RATP

Existing GeoJSON-like data included:

```text
sandbox/data/ratp/stations.json
sandbox/data/ratp/lines.json

```

These contain:

- station coordinates
- traffic
- metro line identifiers
- line colors
- geographic LineStrings

The new generator uses this material as a reusable geographic/network visualization example.

### Earthquakes

Existing data included:

```text
sandbox/data/geo/earthquakes-dummy.geojson

```

The old project already implemented an animated historical earthquake concept.

That concept was preserved but incorporated into the generator architecture.

---

# 4. BBC material supplied by the user

The user supplied BBC visualization repositories and documentation, especially the BBC `bbplot` / R graphics cookbook.

The most useful architectural lesson from BBC was that their visualization system separated:

```text
bbc_style()

```

from:

```text
finalise_plot()

```

In other words:

```text
DATA
  ↓
CHART
  ↓
STYLE SYSTEM
  ↓
EXPORT / FINALISATION

```

That strongly supported building the D3 project around a reusable theme system rather than hard-coding BBC styling into individual charts.

Useful BBC conventions extracted conceptually included:

- strong title hierarchy
- left-aligned editorial titles
- restrained gridlines
- minimal chart furniture
- direct labels instead of legends where practical
- explicit source footer
- controlled typography
- editorial color palettes
- small multiples
- annotations
- conditional highlighting
- standardized export dimensions

The BBC source material contained examples for:

- line charts
- multiple lines
- bar charts
- stacked bars
- grouped bars
- dumbbell plots
- histograms
- annotations
- facets
- legends
- axis treatments

These were used primarily as **design-system references**, not copied as R code.

---

# 5. Economist material supplied by the user

The user supplied several Economist-related repositories and datasets including examples around:

- GDP per hour
- baby names
- Ukraine casualty estimates
- Big Mac data
- Economist chart reproductions
- Graphic Detail data
- other Economist datasets

These were useful for two separate purposes.

## A. Editorial design reference

Economist graphics informed:

- red accent usage
- typography hierarchy
- direct annotation
- restrained axes
- compact source/footer treatment
- comparison-oriented visual storytelling

## B. Actual datasets

Instead of filling every showcase with artificial values, selected Economist datasets were incorporated into real examples where practical.

Examples include:

- GDP/hour visualization
- Big Mac comparison example

The goal was not to clone Economist branding exactly, but to reproduce the **editorial visualization grammar**.

---

# 6. What had to be developed specifically for this project

A large portion of the useful system did not already exist and had to be designed.

## 6.1 Canonical chart specification

A common visualization object was created.

Conceptually:

```js
{
  version: "1.0",

  mark: "line",

  theme: "economist",

  title: "...",
  subtitle: "...",
  source: "...",

  width: 900,
  height: 560,

  data: [...],

  encoding: {
    x: {
      field: "date",
      type: "temporal"
    },

    y: {
      field: "value",
      type: "quantitative"
    },

    series: {
      field: "country",
      type: "nominal"
    }
  },

  options: {
    animate: true,
    directLabels: true
  }
}

```

This is probably the most important part of the project.

It allows the renderer and export targets to evolve independently.

A formal JSON Schema was also created:

```text
sandbox/lib/chart-spec.schema.json

```

That creates the possibility of later supporting:

- AI-generated chart specs
- validation
- autocomplete
- external API generation
- Python wrappers
- CLI generation
- chart templates
- saved visual recipes

---

# 6.2 D3 rendering engine

A reusable rendering layer was created:

```text
sandbox/lib/d3viz-core.js

```

It is based on:

```text
D3.js 7.9

```

The rendering engine interprets the chart specification rather than having a completely separate script for every example.

Current mark families include approximately:

```text
line
bar
scatter
comparison / dot-type charts
metro / network geography
geo bubble / animated geography

```

The goal is to expand this into a proper chart grammar.

---

# 6.3 Theme system

A reusable editorial theme layer was implemented:

```text
sandbox/lib/themes.js

```

Initial themes:

```text
Economist-inspired
BBC-inspired
Newsroom / neutral

```

Themes define things such as:

```text
background
foreground
muted text
gridlines
accent
categorical colors
font stack
line weights
spacing

```

This is deliberately independent from chart logic.

That means one chart can be rendered as:

```text
Economist
BBC
neutral corporate
Power BI-like
Financial Times-like
custom organization theme

```

without rewriting the chart itself.

---

# 6.4 Generator Studio UI

A new generator interface was created under:

```text
/sandbox/

```

rather than simply displaying static examples.

The interface allows editing:

- visualization example
- title
- subtitle
- source
- theme
- accent color
- mark type
- X field
- Y field
- series field
- animations
- direct labels

The visualization is re-rendered interactively.

---

# 6.5 CSV / JSON import

A small data ingestion interface was added.

Users can paste:

```text
CSV

```

or:

```json
[
  {
    "category": "...",
    "value": 12
  }
]

```

The generator performs basic schema inference for:

```text
quantitative
temporal
nominal

```

and chooses a reasonable first visualization.

This is currently lightweight inference, not a full recommendation engine.

---

# 6.6 Platform exporters

This required substantial custom work.

The same chart specification can generate outputs for several environments.

## React

Generates a React-oriented D3 component.

The React integration pattern is approximately:

```text
React component
   ↓
ref
   ↓
useEffect
   ↓
D3 renderer

```

React owns lifecycle and layout.

D3 owns the visualization.

The core renderer is intentionally not React-specific.

---

## Standalone HTML

Generates a self-contained HTML visualization.

Useful for:

- Netlify
- static websites
- iframe embedding
- demos
- documentation
- notebook HTML output

---

## Power BI

A Power BI custom visual developer scaffold/generator was added.

It is based on the modern Power BI visual architecture rather than the old 2017 D3 visual extension.

The current direction is:

```text
pbiviz
TypeScript
capabilities.json
D3
Power BI dataView

```

Generated material includes the conceptual pieces required to transform Power BI's data model into the common D3 chart specification.

Important:

This is currently a **developer starter generator**, not yet a universal production-ready AppSource visual.

Additional Power BI-specific work would still be needed.

---

## Microsoft Fabric

Fabric notebook code generation was added.

The generated code pattern is essentially:

```text
PySpark / pandas data
        ↓
convert to rows
        ↓
chart spec
        ↓
HTML + D3
        ↓
displayHTML()

```

Fabric is therefore a very appropriate deployment target.

---

## Databricks

Databricks notebook generation follows a similar pattern:

```text
Spark DataFrame
   ↓
limited / aggregated rows
   ↓
D3 spec
   ↓
HTML
   ↓
displayHTML()

```

The important rule is that D3 should not process distributed datasets itself.

Spark should perform:

```text
aggregation
filtering
windowing
sampling
ranking

```

before the result reaches D3.

---

## Jupyter

Jupyter-compatible Python/HTML generation was added.

This allows:

```text
pandas
Polars
other Python pipelines

```

to create data and send it into the same D3 visualization engine.

---

## BigQuery notebook pattern

A BigQuery / notebook-oriented exporter was also included.

The intended architecture is:

```text
SQL / BigQuery
      ↓
DataFrame
      ↓
chart spec
      ↓
D3 HTML

```

Again, BigQuery does the computation.

D3 does the rendering.

---

# 6.7 Data adapters

Adapter snippets were created for:

```text
pandas
Polars
PySpark

```

The idea is intentionally simple.

### pandas

```python
rows = df.to_dict(orient="records")

```

### Polars

```python
rows = df.to_dicts()

```

### PySpark

The Spark DataFrame should first be reduced:

```python
result = (
    df
    .groupBy(...)
    .agg(...)
    .orderBy(...)
    .limit(...)
)

```

Then:

```python
rows = [row.asDict(recursive=True) for row in result.collect()]

```

The generator then replaces:

```python
spec["data"]

```

with those rows.

---

# 6.8 SVG and PNG export

The browser generator supports chart export to:

```text
SVG
PNG

```

SVG is serialized directly from the D3 DOM.

PNG is generated through:

```text
SVG
 ↓
Image
 ↓
Canvas
 ↓
PNG Blob

```

---

# 7. Why D3 was retained

D3 remains highly useful because it solves a different problem from Power BI, React, Spark, or Fabric.

D3 provides primitives for:

```text
scales
axes
shapes
geography
hierarchies
transitions
interactions
layout algorithms
SVG manipulation
data joins

```

React is an application framework.

Spark is a distributed data processor.

Power BI is an analytics platform.

Fabric and Databricks are data/analytics platforms.

They are complementary rather than substitutes.

Therefore:

```text
PySpark + D3

```

makes sense.

So does:

```text
Power BI + D3

```

and:

```text
React + D3

```

---

# 8. What should be built next

The project should now evolve into a small visualization framework rather than accumulating one-off demos.

## Priority 1 — Expand the mark grammar

Add reusable primitives for:

```text
area
stacked bar
grouped bar
dumbbell
slope graph
histogram
density
box plot
heatmap
calendar heatmap
small multiples
choropleth
symbol map
Sankey
network
force layout
treemap
circle packing
sunburst
timeline
Gantt
waterfall
bullet chart
sparkline
ridge plot
bump chart
beeswarm
hexbin
violin plot

```

Do not implement them as isolated scripts.

Each should consume the same chart spec.

---

# 9. More advanced editorial functionality

Editorial charts are often distinguished less by chart geometry than by annotation.

The library therefore needs a strong annotation grammar.

Example:

```js
annotations: [
  {
    type: "label",
    x: "2024-01-01",
    y: 72,
    text: "Inflation begins falling"
  },

  {
    type: "rule",
    x: "2023-02-24"
  }
]

```

Useful annotation types:

```text
label
callout
arrow
rule
band
highlight
region
event
reference line
forecast area
confidence interval

```

This would make the generator much closer to actual Economist/BBC graphics.

---

# 10. Data transformation grammar

A major improvement would be letting the chart spec describe lightweight transformations.

For example:

```js
transform: [
  {
    type: "filter",
    field: "country",
    values: ["Norway", "Sweden"]
  },

  {
    type: "sort",
    field: "value",
    order: "descending"
  }
]

```

Possible transforms:

```text
filter
sort
aggregate
group
rank
rolling average
percentage change
cumulative
bin
normalize
pivot
fold
top N

```

For large data, these transformations should preferably be translated to:

```text
SQL
pandas
Polars
PySpark

```

rather than executed entirely in the browser.

---

# 11. Power BI work still needed

For a serious Power BI generator, the following should be implemented.

## Power BI data roles

Automatically generate:

```text
capabilities.json

```

from the D3 chart encoding.

Example:

```text
x → category
y → measure
series → legend
size → measure
color → category/measure

```

## Selection support

Implement Power BI:

```text
selectionManager
selectionId
cross-filtering
highlighting

```

so clicking a D3 element filters other Power BI visuals.

## Native tooltip support

Use Power BI's tooltip service rather than custom HTML tooltips.

## Formatting pane

Generate formatting settings automatically from the chart spec:

```text
colors
fonts
axes
labels
titles
animation
legend
annotations

```

## Packaging

Eventually:

```text
Generate project
↓
npm install
↓
pbiviz package
↓
.pbiviz

```

This would turn the website into a genuine:

> D3 → Power BI Custom Visual Generator

That could be a strong standalone project.

---

# 12. Potential Python package

A thin Python client could eventually be built.

For example:

```python
from d3viz import Chart

chart = (
    Chart(df)
    .line(x="date", y="sales", series="region")
    .theme("economist")
    .title("Sales have accelerated")
)

chart.show()

```

Internally Python should **not recreate D3**.

It should generate the JSON chart specification.

Conceptually:

```text
Python API
   ↓
JSON chart spec
   ↓
JavaScript D3 engine

```

This would work well in:

```text
Jupyter
Fabric
Databricks
VS Code notebooks
possibly Streamlit

```

---

# 13. Potential npm package

The JavaScript core could eventually become something like:

```text
@d3viz/core
@d3viz/themes
@d3viz/react
@d3viz/powerbi
@d3viz/export

```

Example:

```js
import { renderChart } from "@d3viz/core";
import { economist } from "@d3viz/themes";

```

Then:

```js
renderChart(container, spec);

```

This is preferable to making the entire website the library.

---

# 14. What would have been useful to have from the start

Several things would have made development considerably easier.

## 14.1 Exact Power BI target

It would help to know whether the desired Power BI result is:

```text
A. code examples only
B. downloadable pbiviz source
C. automatically compiled .pbiviz
D. AppSource-compliant visual
E. one universal visual
F. a generator creating one visual project per chart

```

These imply significantly different architectures.

The current implementation assumes approximately:

```text
developer generator / project starter

```

rather than a finished universal commercial visual.

---

# 14.2 A recent working Power BI custom visual repository

The old D3 visual article supplied by the user was historically useful, but based on:

```text
D3 3.5
ES5
old Power BI custom visual APIs

```

A modern working repository using:

```text
pbiviz
TypeScript
current Power BI API
D3 v7
formatting model
selection manager

```

would have accelerated Power BI integration substantially.

---

# 14.3 Desired output examples

It would have helped to receive about 10–20 exact visual references representing the desired quality.

For example:

```text
5 Economist charts
5 BBC charts
5 Power BI charts
5 unusual D3 interactives

```

For each reference it would be useful to identify:

```text
what should be copied:
- spacing
- typography
- interaction
- annotation
- axes
- animation
- responsive behavior

```

This would make the theme system much more systematic.

---

# 14.4 Original high-quality datasets

For the legacy DataVis examples, some original datasets were unavailable and had previously been reconstructed or replaced with samples.

Examples include parts of:

```text
earthquake history
RATP historical datasets
other archived DataVis examples

```

Having the exact source datasets would allow the showcase to be both visually and historically accurate.

---

# 14.5 Licensing requirements

For a reusable library it is important to establish how closely publisher styles may be reproduced.

A safer production model is:

```text
"Economist-inspired"
"BBC-inspired"
"newsroom"

```

rather than distributing publisher trademarks/logos as if they were official themes.

A proper licensing review would be useful before publishing a package broadly.

---

# 14.6 Automated visual regression testing

For visualization libraries, standard unit testing is insufficient.

A strong setup would include:

```text
Playwright
+
browser screenshots
+
pixel comparison

```

for combinations such as:

```text
chart × theme × viewport

```

Example:

```text
line × economist × desktop
line × economist × mobile
line × BBC × desktop
bar × BBC × mobile
metro × newsroom × desktop

```

This would be extremely valuable.

---

# 14.7 More reusable datasets

It would help to maintain a small repository of canonical test datasets:

```text
timeseries.csv
categorical.csv
multi-series.csv
geographic.geojson
network.json
hierarchy.json
distribution.csv
financial.csv

```

Then each visualization can be tested consistently.

---

# 15. Recommended long-term repository structure

A cleaner future repository could become:

```text
d3viz/
│
├── packages/
│   ├── core/
│   │   ├── renderer
│   │   ├── scales
│   │   ├── marks
│   │   ├── annotations
│   │   └── schema
│   │
│   ├── themes/
│   │   ├── economist
│   │   ├── bbc
│   │   └── newsroom
│   │
│   ├── react/
│   ├── powerbi/
│   ├── notebook/
│   └── exporters/
│
├── apps/
│   └── studio/
│
├── examples/
│   ├── economist/
│   ├── bbc/
│   ├── datavis/
│   └── powerbi/
│
├── datasets/
│
├── tests/
│
└── docs/

```

---

# 16. Most important design principle

Do **not** build:

```text
EconomistLineChart.js
BBCLineChart.js
PowerBILineChart.js
FabricLineChart.js
ReactLineChart.js

```

That will become impossible to maintain.

Build:

```text
Line mark
+
theme
+
chart spec
+
runtime adapter

```

so:

```text
same data
+
same spec
+
different theme/runtime

```

produces the required result.

---

# 17. Final conceptual model

The project should ultimately behave approximately like this:

```text
                    ┌──────────────┐
                    │ CSV / JSON   │
                    └──────┬───────┘
                           │
      ┌────────────────────┼────────────────────┐
      │                    │                    │
   pandas                Polars              PySpark
      │                    │                    │
      └────────────────────┼────────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ D3 Chart Spec   │
                  │ JSON Schema     │
                  └────────┬────────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
          MARKS         THEMES      ANNOTATIONS
             │             │             │
             └─────────────┼─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ D3 Renderer │
                    └──────┬──────┘
                           │
       ┌───────────┬───────┼───────┬────────────┐
       ▼           ▼       ▼       ▼            ▼
     React      Power BI  Fabric Databricks   Jupyter
       │           │       │       │            │
       └───────────┴───────┼───────┴────────────┘
                           │
                           ▼
                   SVG / PNG / HTML

```

That is the direction that should be preserved in future work.

---

# Current implementation

The current implementation was pushed directly to:

```text
julian-passebecq/d3siteeco

```

Main generator:

```text
/sandbox/

```

Important files:

```text
sandbox/generator.js
sandbox/examples.js
sandbox/lib/d3viz-core.js
sandbox/lib/themes.js
sandbox/lib/exporters.js
sandbox/lib/chart-spec.schema.json

```

The repository still contains the earlier recovered D3/DataVis assets and data, allowing future work to reuse them instead of starting from zero.