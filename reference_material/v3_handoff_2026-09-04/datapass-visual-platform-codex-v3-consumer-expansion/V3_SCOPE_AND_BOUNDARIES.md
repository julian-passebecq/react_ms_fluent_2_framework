# V3 scope and boundaries

## V3 mission

Turn Foundation V2 into a small ecosystem of real, distinct applications while keeping one semantic/visual foundation.

V3 is a **big development pass**. V4 and V5 are explicitly reserved for consolidation, API tightening, performance, deeper factorization and polish after the consumer pressure reveals the right boundaries.

## Required V3 applications / surfaces

1. **Formation** — course-first Python/SQL/PySpark learning consumer; rename/evolve the V2 reference app.
2. **Code Sandbox** — full data-engineering coding/practice application, informed by `julian-passebecq/leetcodedataeng`.
3. **Code Interview** — separate interview-focused application using assessment/progress/figure primitives.
4. **Algorithm Atlas** — visual mental-model application consolidating reusable algorithm/data/SQL/ML explainers.
5. **Architecture Atlas** — semantic architecture explorer informed by `julian-passebecq/architectureweb`.
6. **Pilot Center** — personal/local project command center with project galaxy and structured sticky notes.
7. **Visual Sandbox** — Studio route for directly testing production semantic specs and Figure renderers.

A standalone public Project Hub may be generated cheaply from the same registry if it does not jeopardize the required work.

## Required shared improvements

- hosted CI visual regression fix;
- canonical shared public Project Registry + private local overlay boundary;
- deterministic radial/hub diagram layout provider;
- challenge/practice content contract sufficient for Code Sandbox and Code Interview;
- selected migration of high-value visuals from existing apps into ConceptMotion/Figure;
- stronger coverage accounting for pure V2 packages;
- codified professional technical visual profile without creating a theme framework.

## Out of scope for V3

Do **not** build:

- Spark execution or Spark Connect backend;
- Jupyter kernels/JupyterLab;
- universal remote code judge;
- required FastAPI backend;
- required Streamlit frontend;
- auth/accounts/cloud database;
- Gmail/LinkedIn/news/stock integrations;
- CMS/no-code app builder/plugin marketplace;
- D3 analytical SDK v2 / Power BI renderer rewrite;
- GeoStory/map narrative framework;
- Data Forge rewrite;
- live knowledge crawling/AI monitoring;
- npm package publication unless required by a concrete consumer build.

Optional in-browser DuckDB/Pyodide execution remains deferred unless **all** required V3 work and hosted CI are green and the implementation is isolated behind an adapter. Do not make V3 completion depend on it.

## Architecture invariant

```text
semantic/content spec
       ↓
shared compiler / renderer / UI package
       ↓
consumer composition
```

Never:

```text
consumer-specific bespoke D3/React behavior
       ↓
copy/paste to next consumer
```
