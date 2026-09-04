# Data model / entity / lineage generator brief

This pass also adds a second major generator family: **clean data modeling diagrams** and **table/entity visualizations**.

The user wants something easier than Mermaid for:

- star schema;
- snowflake / semantic model;
- operational ERD-lite;
- table/entity cards with fields and keys;
- SQL lineage / pipeline lineage;
- bronze / silver / gold mapping;
- source-to-semantic-model explanations.

The objective is clarity, not ultra-sophisticated CASE-tool behavior.

## V1 output types

### 1. Simple table/entity diagram

For a handful of tables and relationships.

Use cases:

- explain a star schema;
- show an order model vs transformed analytics model;
- explain one fact table and surrounding dimensions;
- compare source ERP tables to curated BI tables.

### 2. Column-aware entity card

Entity box should be able to show:

- table name;
- business role/subtitle;
- PK / FK / measure / attribute markers;
- data type (optional toggle);
- hidden / technical columns (optional collapsed section);
- grain note;
- optional row-count / freshness badges.

### 3. Semantic model / BI model

Must support concepts relevant to Power BI / Fabric / modern BI:

- fact and dimension tables;
- one-to-many relationships;
- role-playing dimensions;
- bridge tables / many-to-many;
- date table;
- measure group / KPI notes;
- row-level-security note;
- aggregation table or import/direct-lake style badge.

### 4. Lineage diagram

Need a simple lineage generator for:

- source table -> staging -> curated -> semantic model -> report;
- SQL transform chains;
- dbt/Fabric pipeline-like asset flow;
- notebook / stored procedure / view / table relationships.

This can reuse existing DAG/flow renderer logic where possible.

## Canonical data model spec example

```yaml
kind: data-model
layout: star
entities:
  - id: fact_sales
    type: fact
    name: Sales
    subtitle: Daily sales transactions
    grain: One row per order line
    columns:
      - { name: SalesKey, role: pk, dataType: int }
      - { name: DateKey, role: fk, ref: dim_date.DateKey }
      - { name: ProductKey, role: fk, ref: dim_product.ProductKey }
      - { name: StoreKey, role: fk, ref: dim_store.StoreKey }
      - { name: CustomerKey, role: fk, ref: dim_customer.CustomerKey }
      - { name: SalesAmount, role: measure, dataType: decimal }
  - id: dim_product
    type: dimension
    name: Products
    columns:
      - { name: ProductKey, role: pk, dataType: int }
      - { name: ProductName, role: attribute, dataType: string }
      - { name: Category, role: attribute, dataType: string }
relationships:
  - from: fact_sales.DateKey
    to: dim_date.DateKey
    cardinality: many-to-one
    filterDirection: single
  - from: fact_sales.ProductKey
    to: dim_product.ProductKey
    cardinality: many-to-one
```

## Clean visual defaults

- Fact table centered or visually dominant.
- Dimension tables around it for star schemas.
- Consistent card widths.
- Light background.
- Thin connectors with arrowheads only when direction matters.
- Distinct fill for fact vs dimension vs bridge vs calculated/semantic entities.
- Optional layer colors: source / bronze / silver / gold / semantic / reporting.

## Relationship semantics

Need support for:

- one-to-many;
- many-to-one;
- many-to-many (bridge);
- optional vs mandatory;
- active vs inactive relationship;
- single vs both-direction filter (for semantic models);
- label on relationship if needed.

## Entity/table renderer features

- compact mode: table names only;
- normal mode: key columns + important fields;
- full mode: full visible schema subset;
- compare mode: source schema on left, curated model on right;
- transformation callouts between source and target entities.

## Lineage generator spec example

```yaml
kind: lineage
layout: left-to-right
assets:
  - { id: raw_orders, type: table, layer: bronze, label: raw.orders }
  - { id: stg_orders, type: sql-model, layer: silver, label: stg_orders }
  - { id: fct_sales, type: table, layer: gold, label: fct_sales }
  - { id: semantic_sales, type: semantic-model, layer: semantic, label: Sales Model }
  - { id: report_exec, type: report, layer: report, label: Executive Sales Report }
flows:
  - { from: raw_orders, to: stg_orders, label: cleanse + rename }
  - { from: stg_orders, to: fct_sales, label: join + aggregate }
  - { from: fct_sales, to: semantic_sales, label: import/direct lake }
  - { from: semantic_sales, to: report_exec, label: visuals + measures }
```

## Reuse opportunities from current project

ConceptMotion already contains:

- table-oriented renderers;
- join renderers;
- DAG/pipeline semantics;
- cheat-sheet surfaces for SQL, Power BI, Kimball.

Codex should reuse those foundations rather than creating a separate disconnected mini-app.

## Suggested renderer families

1. `dataModelRenderer`
   - fact/dimension/bridge/entity cards and relationships.
2. `tableEntityRenderer`
   - detailed field list view.
3. `lineageRenderer`
   - pipeline/dataflow asset lineage.
4. `semanticModelRenderer`
   - Power BI / Fabric focused relationships, measures and model notes.
5. `schemaDiffRenderer`
   - source-to-target comparison.

## Non-goals for v1

- complete database reverse engineering;
- pixel-perfect ERD editing;
- huge schema auto-layout for hundreds of tables;
- every UML/IDEF1X feature.

The library should instead excel at **small-to-medium clear explanatory models**.
