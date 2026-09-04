# Data Project Forge V1 — Final Focused Codex Handoff

**Handoff date:** 2026-09-04

This pack supersedes the earlier broad simulator design for V1.

## Product goal

Build a polished web application backed by a strong C#/.NET generator:

> Generate coherent end-to-end data engineering / analytics practice projects from a scenario, including realistic source data, deliberate interview problems, expected Gold/star models, ML/business signal, and code/configuration layers for dbt, Airflow, Fabric/ADF, Databricks and GCP.

The cloud layers are **generated artifacts**, not runtimes that Forge must emulate.

---

# Core architecture

```text
React + TypeScript + Fluent UI + D3
                 |
                 v
          ASP.NET Core API
                 |
                 v
        C# Project Compiler
      /          |          \
Contoso V2   Forge Data    Problem/
generation   extensions    signal engine
      \          |          /
                 v
        Generated datasets
                 |
                 v
        DataModelSpec / KPIs
                 |
       +---------+-----------+----------------+
       |         |           |                |
      dbt     Airflow     Platform         Power BI
                         exporters         handoff
                         /   |   \
                      Fabric DBX  GCP
                 |
                 v
           Project ZIP
```

---

# What to inherit from SQLBI Contoso V2

Preserve the proven ideas:
- .NET 8 generator
- configuration-driven generation
- weighted distributions
- customers/products/stores/orders/order rows
- dates/currencies
- deterministic generation behavior
- performance-oriented day batching
- writer abstraction
- CSV / Parquet / Delta-oriented output.

Extend rather than rewrite.

---

# What Forge adds

## Business extensions
First scenario:
**Retail / Customer Satisfaction**

Add:
- Shipments
- ShipmentEvents
- Returns
- SupportTickets
- Reviews
- optional Inventory / Promotion later.

## Engineering problems
- CDC
- SCD2
- duplicates
- late arrivals
- null/data-quality faults
- schema drift later
- skew later.

## Truth manifest
Record exactly what was deliberately injected.

## Data modeling compiler
A single `DataModelSpec` becomes the source of truth for:
- table/column metadata
- PK/FK relationships
- grain
- star schema
- DDL
- Mermaid ER diagram
- dbt model/source metadata
- semantic-model handoff.

Read:
- `DATA_MODELING_AND_SCHEMA_SPEC.md`
- `data_model_spec.schema.json`
- `examples/retail_star_model.json`

## Generated code layers
- SQL
- PySpark
- dbt
- Dataform
- Airflow DAG
- Fabric/ADF JSON/reference
- Databricks bundle/job/reference
- BigQuery SQL/config
- Power BI semantic handoff.

They are outputs, not required local services.

---

# Frontend

Use:
- React
- TypeScript
- Microsoft Fluent UI
- D3 only where custom visual explanation adds value
- Mermaid for generated static ERD/DAG/architecture documentation
- Monaco for generated code.

The UI should be modern and portfolio-grade, but not a clone of Fabric.

Study the uploaded Microsoft Fabric workload sample for:
- Fluent UI usage
- Lakehouse explorer/tree patterns
- React workload structure
- Fabric integration concepts.

Study the included FabricStack screenshot for:
- restrained white/light design
- search/filter sidebar
- compact cards
- technology/status badges
- strong information hierarchy.

Do not reproduce branding pixel-for-pixel.

---

# Main web pages

## 1. Generate
Choose:
- scenario
- scale
- seed
- problems
- formats
- code layers
- platform exporters.

## 2. Data
Browse:
- generated source tables
- rows/sample
- schema
- problem badges.

## 3. Model
Show:
- operational/source schema
- Gold star schema
- relationships
- grain
- PK/FK
- dimensions/facts
- KPI list.

## 4. Architecture
Simple generated DAG/architecture:
Source -> Bronze -> Silver -> Gold -> BI/ML.

## 5. Code
Tabs:
- SQL
- PySpark
- dbt
- Airflow
- Fabric/ADF
- Databricks
- GCP/Dataform.

## 6. Challenges
Explain deliberately injected issues and starter tasks.
Hide reference solution by default.

## 7. Export
Download generated project ZIP.

---

# First implementation milestone

Do not build every exporter first.

Implement this end-to-end:

1. load `project.example.json`
2. generate core Contoso retail data
3. add Shipment + ShipmentEvent
4. inject duplicate CDC
5. write truth manifest
6. generate `DataModelSpec`
7. generate Mermaid ERD
8. generate one SQL starter/reference solution
9. generate one dbt starter project
10. generate one Airflow DAG
11. generate project ZIP
12. expose through ASP.NET Core
13. build polished React/Fluent UI around it.

Only then broaden Fabric/Databricks/GCP exporters.
