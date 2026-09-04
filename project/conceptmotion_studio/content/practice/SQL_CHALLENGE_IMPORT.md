# SQL challenge-pack integration

The uploaded exercise packs are kept as a **separate imported challenge collection** so they do not disturb the 94-drill guided core curriculum.

## Deduplication

The repeated Window Functions archives were duplicate copies and are represented once. The repeated CASE WHEN archive is also represented once.

## Imported challenge concepts

60 distinct challenge concepts are organized into:

- Cross Joins
- Inner Joins
- Left Joins
- Full Outer Joins
- Self Joins
- GROUP BY + HAVING
- CASE WHEN
- GROUPING SETS / ROLLUP / CUBE
- Window Functions

## v1.3 dialect policy

The site no longer treats the T-SQL adaptation as the only version. Each imported challenge can be practiced in:

1. Microsoft T-SQL
2. DuckDB / source style
3. BigQuery GoogleSQL

Most core relational syntax is portable. When the engines differ, the trainer highlights the difference rather than forcing artificial divergence. Examples include:

- T-SQL CTE/subquery filtering versus DuckDB/BigQuery `QUALIFY`
- `DATEADD` versus DuckDB interval arithmetic versus BigQuery `DATE_ADD`
- SQL Server type names versus BigQuery types
- BigQuery-specific ARRAY / STRUCT / UNNEST patterns (covered in the separate Multi-Engine Lab)

Solutions are hidden until Solution or Compare is opened. Draft code is persisted separately for each SQL dialect.

## pandas / PySpark extension

The source packs also contain pandas-style teaching material. Rather than duplicating all 60 imported SQL exercises, v1.3 adds a dedicated Multi-Engine Data Lab where the same transformation can be rewritten in pandas and PySpark, alongside SQL engines. This makes the relationship between SQL windows/grouping/joins and DataFrame operations explicit.
