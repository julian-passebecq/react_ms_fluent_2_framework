# Portfolio-grade Frontend Specification

## Goal

The website should immediately communicate:

> C# data generator + modern data engineering project compiler.

It should look professional enough to use as a résumé portfolio project.

---

# Visual language

Use:
- Microsoft Fluent UI
- light theme by default
- white / very light gray background
- restrained Fabric-inspired teal accents
- proper spacing
- subtle borders
- compact status badges.

Do not make the page look like an exact Microsoft-owned product.

---

# FabricStack screenshot inspiration

The user supplied `references/fabricstack_ui_reference.png`.

Useful patterns:

## Search + filters + cards

The screenshot uses:
- persistent category filters on the left
- a large search box
- a simple sort control
- card grid
- small badges
- short descriptions
- dense but readable information.

Use this pattern for:

### Scenario gallery

Filters:
- Domain
- Difficulty
- Platform
- Problems
- ML / BI
- Format.

Cards:
- Customer Satisfaction
- Churn
- Demand Forecast
- Late Delivery
- Finance/P&L later.

Badges:
`Fabric` `Databricks` `GCP` `dbt` `Airflow` `Senior`

This is a better landing page than a complicated architecture editor.

## Exporter catalog

A second card-grid can show generated artifacts:

- T-SQL
- PySpark
- dbt
- Airflow
- Dataform
- Fabric
- Databricks
- BigQuery
- Power BI handoff.

Each card states:
- what it generates
- native/reference status
- selected/not selected.

---

# Main app layout

```text
Top bar:
Data Project Forge | project name | Generate | Download

Left navigation:
Generate
Data
Model
Architecture
Code
Challenges
Export

Main panel:
context-specific content
```

Avoid 20 navigation entries.

---

# Generate page

Use grouped cards/controls:

```text
Scenario
  Retail / Customer Satisfaction

Scale
  100k | 1M | 10M

Engineering problems
  [x] CDC
  [x] SCD2
  [x] duplicates
  [x] late arrivals

Outputs
  [x] Parquet
  [x] Delta

Code layers
  [x] SQL
  [x] PySpark
  [x] dbt
  [x] Airflow

Platforms
  [x] Fabric
  [x] Databricks
  [x] BigQuery

[Generate Project]
```

---

# Data page

Use a Fabric-like explorer pattern inspired by the supplied workload sample.

Left tree:

```text
Source
  customers
  orders
  order_lines
  shipments
  reviews
Bronze
Silver
Gold
```

When a table is selected:

```text
Overview | Schema | Preview | Problems
```

This pattern is directly useful from the supplied Fabric Lakehouse Explorer example, which groups tables by schema and uses a collapsible tree with selected state.

Do not copy the whole sample UI; reimplement the pattern with current Fluent components.

---

# Model page

Top toggle:

```text
[Source Model] [Gold Star Model] [Semantic Model]
```

Center:
interactive ER/star diagram.

Right inspector:
- table type
- grain
- business key
- surrogate key
- SCD
- row estimate
- relationships.

Below:
- model checks
- KPI catalog.

---

# Architecture page

Keep simple:

```text
Sources -> Bronze -> Silver -> Gold -> Power BI
                              \-> ML
```

Click a stage to show generated code/artifacts.

Do not build a drag-drop Data Factory clone.

---

# Code page

Tabs:

```text
SQL | PySpark | dbt | Airflow | Fabric | Databricks | GCP
```

Monaco viewer/editor.

Default mode is read/copy, not execution.

---

# Challenges page

Cards:

```text
CDC deduplication
SCD2 history
Late-arriving records
Join fanout
```

Each:
- problem statement
- source tables
- expected output contract
- starter file
- Hint
- Reveal reference solution.

---

# Subtle animation

Allowed:
- card hover
- generation progress
- D3 row transformations
- DAG highlight
- table relationship emphasis.

Avoid:
- decorative cloud background behind core work UI
- heavy continuous animation
- mobile-style animated charts.

The uploaded cloud-animation repo is therefore not a core dependency.
