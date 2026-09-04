# Visual explanation references

Reviewed/updated: 2026-09-04.

These sources informed interaction patterns, teaching structure or domain semantics. They are **references only**; no external visual assets are bundled/copied.

## How to use this list

- **Authoritative semantics**: prefer official documentation/specifications when implementing a concept.
- **Teaching precedent**: use visual/article sites to study interaction and explanatory structure, not as a source of engine truth.
- **User-supplied references**: see `user-reference-notes.md` for the Instagram video/paper layouts described from the attachments.

## Runtime architecture / object continuity

### D3 official — React integration and keyed data joins
https://d3js.org/getting-started

https://d3js.org/d3-selection/joining

**Authoritative library guidance.** D3 selection/transition modules mutate DOM, so isolate them behind a React ref/effect boundary. Keyed data joins preserve object identity across enter/update/exit and are the preferred basis for meaningful movement. This directly motivates replacing `resetLayer()` in motion-heavy renderers.

## Interaction / teaching philosophy

### Bret Victor — Explorable Explanations
https://worrydream.com/ExplorableExplanations/

Use for: product philosophy. Interaction should help the reader explore a phenomenon or assumption, rather than add a decorative widget.

### Seeing Theory — Brown University
https://seeing-theory.brown.edu/

Use for: statistics/probability interaction precedent. Good example of D3-based explanatory controls and direct manipulation.

### TensorFlow Playground
https://playground.tensorflow.org/

Source code: https://github.com/tensorflow/playground

Use for: parameter controls + live neural behavior + step/play/reset in one learning surface. It is explicitly an interactive D3/TypeScript neural-network visualization.

### Distill — Feature Visualization
https://distill.pub/2017/feature-visualization/

Use for: publication-quality integration of prose, visual evidence and interaction in ML explanations.

### Python Tutor
https://pythontutor.com/

Use for: synchronized code execution + variables/objects/data structures/stack frames. Strong precedent for step-by-step program-state visualization.

### VisuAlgo
https://visualgo.org/

Use for: reusable algorithm/data-structure animation patterns, stepping and custom inputs.

## SQL / database internals

### SQL Window Functions Visualized — Medium
https://medium.com/learning-sql/sql-window-function-visualized-fff1927f00f2

Use for: teaching precedent. Especially relevant to showing how the window is constructed, moves and calculates for a current row.

### SQL JOIN Visualizer — Doses of Data
https://dosesofdata.com/sql-joins-explained/

Use for: recent interactive join precedent. Concrete source tables and output preservation rules are more effective than Venn diagrams alone.

### Database Indexing Visualized — Medium
https://neeteshraj.medium.com/database-indexing-visualized-why-your-query-takes-5-seconds-78afc91fe79e

Use for: visual scan-vs-index/B-tree teaching precedent. Verify engine-specific storage claims elsewhere.

### B-tree first-principles article — Medium
https://medium.com/@rajpg16/how-database-indexing-works-from-scratch-with-a-b-tree-example-0966c053a7b1

Use for: conceptual scan-vs-tree explanation.

## DAX / Power BI

### SQLBI — Filter context in DAX explained visually
https://www.sqlbi.com/articles/filter-context-in-dax-explained-visually/

Use for: high-value DAX teaching model. Represents filter context as explicit visible value sets and demonstrates add/remove/replace behavior under CALCULATE.

### SQLBI — Row context and filter context
https://www.sqlbi.com/articles/row-context-and-filter-context-in-dax/

Use for: context definitions and relationship between row/filter context.

### Microsoft Learn — star schema and Power BI
https://learn.microsoft.com/en-us/power-bi/guidance/star-schema

**Authoritative guidance** for Power BI model design. Use for dimensions vs facts, grain, surrogate keys, SCD, role-playing dimensions and related patterns.

### Microsoft Learn — model relationships
https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-relationships-understand

**Authoritative guidance** for relationship filter propagation and model behavior.

## Data engineering / distributed systems

### Spark Shuffle visual guide — Medium
https://medium.com/towards-data-engineering/why-your-spark-job-is-slow-a-visual-guide-to-the-shuffle-7da8bcde9184

Use for: teaching precedent. Makes invisible row/network redistribution visible.

### Spark Shuffle & Partitioning — Medium
https://chakshu-salgotra.medium.com/spark-shuffle-partitioning-under-the-hood-of-a-wide-transformation-521907cd5f1c

Use for: additional visual/wording precedent. Verify engine behavior against current Spark/Databricks docs before publishing exact claims.

## Orchestration

### Apache Airflow — DAG concepts
https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html

**Authoritative semantics** for task dependencies, control flow, branching and trigger rules.

### Apache Airflow — UI overview
https://airflow.apache.org/docs/apache-airflow/stable/ui.html

Use for: product reference. Graph view, Grid view, run-specific task states and failure diagnostics suggest useful visual-debugging surfaces.

## Modeling

### Kimball dimensional modeling techniques
https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/

Use as canonical taxonomy for grain, fact-table types, SCDs, conformed dimensions and special-purpose dimensional patterns.

## Parquet / storage

### Apache Parquet — Concepts
https://parquet.apache.org/docs/concepts/

**Authoritative semantics.** File → row groups → column chunks → pages. This hierarchy should drive the storage renderer.

### Apache Parquet — File format
https://parquet.apache.org/docs/file-format/

Use for the file/footer/column-chunk physical layout.

### Apache Parquet — Column chunks
https://parquet.apache.org/docs/file-format/data-pages/columnchunks/

Use for page organization, dictionary/data pages and skip-oriented metadata.

### Apache Parquet — Page index
https://parquet.apache.org/docs/file-format/pageindex/

Use for selective page skipping/index visualization.

### Delta Lake transaction log protocol overview
https://delta.io/blog/2023-07-07-delta-lake-transaction-log-protocol/

Use for snapshot/log/data-file mental model. For protocol-level details, prefer official Delta protocol specification when implementing a precise scene.

## Algorithm interaction precedents

### Sort & Visualize
https://sortandvisualize.com/

Use for: compare/swap playback precedent.

### DSA Visualizer project
https://github.com/Akuma-01/dsa-visualizer

Use for: step/action/code synchronization precedent.

## Design synthesis

The useful visual surfaces are not interchangeable:

1. **Storyboard** — moving state + operation + synchronized code.
2. **Interactive explainer** — parameters/direct manipulation change the model/geometry.
3. **Paper/handwritten sheet** — dense definition/formula/mechanism/example structure.
4. **Cross-language sheet** — one semantic action shown in several tools/languages.
5. **Catalogue** — exhaustive discoverability even before every concept has a live scene.

The project should reuse semantic content across those surfaces instead of hard-coding separate sites for each style.
