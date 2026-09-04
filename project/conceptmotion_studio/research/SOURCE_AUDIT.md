# Source and provenance audit

Reviewed: 2026-09-04

This document tells the next agent what material informed ConceptMotion Studio and what level of trust to assign to it. It is intentionally stricter than a bibliography: **visual inspiration is not semantic authority**.

## Provenance classes

| Class | Meaning | How it may be used |
| --- | --- | --- |
| A — official/specification | Vendor/project documentation or format specification | Engine semantics, terminology, supported behavior. Still check version when syntax is version-sensitive. |
| B — specialist/reference | Established specialist teaching source | Mental models and explanations; cross-check engine-specific claims. |
| C — visual precedent | Interactive article/demo/project | Interaction grammar, pacing, layout and pedagogy only. Do not copy assets or assume every technical simplification is literal engine behavior. |
| U — user reference | Images/video supplied in the ChatGPT conversation | Product requirements and visual patterns. Raw media is deliberately not bundled; descriptive notes only. |

## Architecture / visualization sources

### D3 official documentation — A

- https://d3js.org/getting-started
- https://d3js.org/d3-selection/joining

Used for:

- keeping D3 as the geometry/data-join/transition engine;
- using a React `ref`/effect boundary when D3 selections/transitions mutate DOM;
- prioritizing keyed joins and stable IDs for object continuity rather than redraw-by-index.

This source strongly supports the biggest renderer refactor still pending: many current renderers call `resetLayer()` and therefore do not yet exploit object constancy as well as the project should.

### React official documentation — A

- https://react.dev/reference/react/useEffect

Used for the shell/imperative-renderer boundary and cleanup expectations. React owns application state; D3 owns the contained SVG subtree.

### Bret Victor — Explorable Explanations — C

- https://worrydream.com/ExplorableExplanations/

Used for product philosophy: interaction should expose causality/assumptions, not merely decorate prose.

### Seeing Theory — C

- https://seeing-theory.brown.edu/

Used as a statistics/probability interaction precedent: direct manipulation, small focused chapters and visual feedback.

### TensorFlow Playground — C

- https://playground.tensorflow.org/
- https://github.com/tensorflow/playground

Used for parameter-driven ML explanations where changing an input should visibly change a decision boundary/model state.

### Python Tutor — C

- https://pythontutor.com/

Used for synchronized code + runtime state + stepping. This is one of the closest precedents to the Storyboard surface.

### VisuAlgo — C

- https://visualgo.org/

Used for algorithm stepping, state emphasis and data-structure visual conventions.

### Distill — C

- https://distill.pub/2017/feature-visualization/

Used for publication-quality integration of prose, figures and interaction in ML explanations.

## SQL / query / indexing sources

### SQL Window Functions Visualized — C

- https://medium.com/learning-sql/sql-window-function-visualized-fff1927f00f2

Used for the requirement that a window lesson should show **construction, movement and calculation for the current row**, not only window syntax.

### Doses of Data SQL JOIN Visualizer — C

- https://dosesofdata.com/sql-joins-explained/

Used for concrete-table join teaching rather than Venn diagrams alone. ConceptMotion's join renderer should go one step further and build the output table row-by-row.

### Database indexing visual articles — C

- https://neeteshraj.medium.com/database-indexing-visualized-why-your-query-takes-5-seconds-78afc91fe79e
- https://medium.com/@rajpg16/how-database-indexing-works-from-scratch-with-a-b-tree-example-0966c053a7b1

Used for visual scan-vs-tree teaching patterns only. SQL Server/BigQuery/DuckDB physical internals must be verified against engine documentation before a scene claims literal behavior.

## DAX / Power BI sources

### Microsoft Learn — star schema — A

- https://learn.microsoft.com/en-us/power-bi/guidance/star-schema

Used for facts vs dimensions, consistent fact grain, surrogate keys, snowflake dimensions, role-playing dimensions, SCD Type 1/2 and factless fact tables in the Power BI context.

### Microsoft Learn — relationships — A

- https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-relationships-understand

Used for filter propagation/cardinality concepts in semantic models.

### SQLBI — filter context explained visually — B

- https://www.sqlbi.com/articles/filter-context-in-dax-explained-visually/
- https://www.sqlbi.com/articles/row-context-and-filter-context-in-dax/

Used for the DAX visual grammar: make the current filter context explicit and show CALCULATE as transformations that add/remove/replace filters. The existing DAX scene has a pure `daxEffectiveFilters()` helper because renderer and semantic state previously disagreed about `REMOVEFILTERS`.

## Data engineering / orchestration / storage sources

### Apache Airflow stable documentation — A

- https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/
- https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/overview.html
- https://airflow.apache.org/docs/apache-airflow/stable/ui.html

Used for DAG/task dependency semantics, upstream readiness, branching/trigger rules, XCom scope, pools/concurrency and the idea of graph/grid views as complementary runtime-debugging surfaces. Airflow versioning matters; re-check stable docs before encoding version-specific UI or scheduler claims.

### Apache Parquet documentation — A

- https://parquet.apache.org/docs/concepts/
- https://parquet.apache.org/docs/file-format/
- https://parquet.apache.org/docs/file-format/data-pages/columnchunks/
- https://parquet.apache.org/docs/file-format/pageindex/

Used for the storage hierarchy: **file → row groups → column chunks → pages**, plus skip-oriented metadata/page indexes. This should drive a future storage renderer instead of generic database-cylinder icons.

### Spark shuffle visual guides — C

- https://medium.com/towards-data-engineering/why-your-spark-job-is-slow-a-visual-guide-to-the-shuffle-7da8bcde9184
- https://chakshu-salgotra.medium.com/spark-shuffle-partitioning-under-the-hood-of-a-wide-transformation-521907cd5f1c

Used for teaching precedent: show records physically regrouping by partition key and make network movement visible. Exact Spark behavior should be checked against current Apache Spark/Databricks documentation before publication.

### Kimball dimensional modeling techniques — B

- https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/

Used as the catalogue taxonomy for grain, fact-table types, SCDs, conformed/role-playing dimensions and related dimensional patterns.

## User-supplied references — U

Described in detail in `research/user-reference-notes.md`.

The most important supplied moving-table/algorithm video is a Bubble Sort social-media animation. The reusable behavior extracted from it is:

1. a stable row of boxed values;
2. the currently compared adjacent pair is explicitly marked;
3. the operation is named (`COMPARE` or `SWAP`);
4. on swap, the **same values visibly exchange horizontal position**;
5. settled/final values become visually distinct;
6. line-numbered code remains visible beneath the data;
7. exactly the relevant code line(s) are highlighted for the same semantic step;
8. data state + operation + code focus advance as one timeline;
9. time/space complexity remains visible as supporting metadata;
10. the final frame shows the algorithm invariant/result, not an arbitrary stop point.

This is why the project distinguishes **Storyboard** from a generic animated chart. The point is causal synchronization, not motion for its own sake.

Other supplied images informed the handwritten/paper surface:

- ruled-paper VS Code shortcut map with branch lines and boxed shortcuts;
- Random Forest, Decision Tree and Logistic Regression notebook pages with a repeatable template: *what it is → key formula → when to use → mechanism/architecture → example/chart*;
- Seaborn hub/spoke explainer mixing clean typography with hand-drawn supporting diagrams;
- Python list diagram showing positive and negative indexing around the same boxes.

## What was NOT copied

- No Instagram screenshots/video frames are stored in this ZIP.
- No creator logos/handles/branding are bundled.
- No external article illustrations are bundled.
- No source page is reproduced verbatim beyond short identifiers/URLs.
- The code/scene data was authored for this project.

## Content confidence / verification policy for Codex

Before promoting a catalogue item from `PLANNED` to `LIVE`:

1. identify the semantic authority for the topic;
2. write the invariant in plain language;
3. isolate semantic calculations into pure functions where practical;
4. add invariant tests before drawing the scene;
5. clearly label conceptual approximations (for example a generic B-tree) versus literal engine behavior;
6. verify dialect/version-sensitive syntax from official docs;
7. use visual precedents only to improve pedagogy/interaction;
8. do not copy visual assets or distinctive branded composition.

