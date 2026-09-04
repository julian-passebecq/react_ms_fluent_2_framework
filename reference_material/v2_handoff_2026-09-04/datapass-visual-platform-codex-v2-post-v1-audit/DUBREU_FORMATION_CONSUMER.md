# Dubreu Formation — V2 reference consumer

## Why this consumer matters

Dubreu Formation is the first serious validation that the framework is more than a component demo.

It combines:

- documentation/lesson content;
- notebook imports;
- Monaco;
- ConceptMotion;
- tables and static outputs;
- challenges/hints/solutions;
- QCM/progress;
- runtime launchers;
- source/provenance.

If this app requires another custom design system, the framework has failed.

## Product principle

**Do not reproduce Jupyter/Deepnote UI.**

The source notebook is an authoring/import format. The website should be a structured Fluent learning experience.

Target flow:

```text
Learn concept
    |
see compact example
    |
visual explanation when useful
    |
Try in Monaco
    |
Hint
    |
Reveal solution
    |
Compare diff
    |
QCM / mark mastered
```

## Proposed information architecture

```text
Dubreu Formation
|
+-- Python
|   +-- imported Python/Notion lessons
|   +-- lists / dictionaries / functions / pandas
|
+-- SQL Course
|   +-- Manual / database / context
|   +-- First query
|   +-- Conditions
|   +-- Functions
|   +-- Group operations
|   +-- Multiple tables
|   +-- Combining queries
|   +-- Summary
|   +-- Bonus exercises
|   +-- Corrections
|
+-- SQL Advanced
|   +-- Cross joins
|   +-- Inner joins
|   +-- Left joins
|   +-- Full outer joins
|   +-- Self joins
|   +-- GroupBy / HAVING / CTE
|   +-- CASE WHEN
|   +-- GROUPING SETS / ROLLUP / CUBE
|   +-- Window functions / LAG / ranking / QUALIFY
|   +-- optional Select Star SQL material with license attribution
|
+-- PySpark
|   +-- setup/foundations
|   +-- I/O
|   +-- transformations
|   +-- Spark SQL patterns
|   +-- performance
|   +-- MLlib
|   +-- streaming
|   +-- graph processing
|   +-- Delta Lake
|
+-- Practice
    +-- challenges
    +-- QCM
    +-- review queue
    +-- progress
```

## PySpark behavior

PySpark is **display-only in the site** for V2.

A PySpark lesson may contain:

- explanatory prose;
- code;
- saved output/table;
- Spark architecture/partition/shuffle ConceptMotion figure;
- QCM;
- external runtime launcher;
- download original notebook.

A PySpark code cell must visually state when it is not executable in-site.

Recommended actions:

```text
[Copy code] [Download notebook] [Open runtime guidance]
```

Optional configured external actions may include Colab or Databricks. Do not iframe or proxy Spark execution.

## SQL/Python UX

SQL and Python lessons should get the richest in-site pedagogy even without runtime execution.

### SQL

Useful ConceptMotion mappings:

- `WHERE` -> rows filtered sequentially;
- `ORDER BY` -> stable row movement;
- `GROUP BY` -> rows move into groups then aggregate;
- `INNER/LEFT/FULL/CROSS/SELF JOIN` -> match/fanout/unmatched row semantics;
- `CASE WHEN` -> row-by-row branch classification;
- `HAVING` -> grouped output filtering;
- `WINDOW` -> moving/partition frame over rows;
- `ROW_NUMBER/RANK/DENSE_RANK` -> ranking state;
- `LAG/LEAD` -> pointer/reference to neighboring row;
- `ROLLUP/CUBE/GROUPING SETS` -> aggregation hierarchy.

### Python

Useful ConceptMotion mappings:

- list iteration;
- dictionary key/value lookup;
- filtering/comprehensions;
- function arguments/return;
- pandas filter/sort/groupby/join;
- current loop index/pointer;
- before/after dataframe transformations.

Do not animate ordinary prose merely because animation exists.

## Lesson layout

Desktop reference layout:

```text
+---------------------------------------------------------------+
| breadcrumb / course / module / progress                       |
+-------------------------------+-------------------------------+
| Lesson                        | Practice                      |
|                               |                               |
| Objective                     | Monaco                        |
| Explanation                   |                               |
| compact source example        | [Hint] [Reveal] [Compare]    |
|                               |                               |
| Figure / input-output table   | local status                  |
+-------------------------------+-------------------------------+
| source / attribution / original notebook / next lesson        |
+---------------------------------------------------------------+
```

On mobile, stack content before practice and preserve the existing no-horizontal-overflow gate.

## Course content should not be hard-coded into components

Create content data/import outputs. Components receive `CourseSpec`, `LessonSpec`, `NotebookSpec`, `FigureSpec` and challenge/assessment references.

## Select Star SQL

The supplied source states:

- prose: CC BY-SA 4.0;
- code/datasets: CC0.

If included publicly, preserve attribution and share-alike requirements for adapted prose. Prefer using its datasets/code/exercise ideas with correct license metadata rather than silently copying its presentation.

## Definition of success

A learner should prefer the Dubreu web interface over opening the raw notebook for learning/review, while still being able to download/open the original source when they need a real runtime.
