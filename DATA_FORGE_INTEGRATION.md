# Data Forge integration contract

Data Forge is a major consumer of this foundation but is not implemented in this pass.

## What Forge should consume later

### Shared application UI

- Fluent-based AppShell / Workbench / Inspector / Catalog patterns;
- Monaco code/spec panels where generated SQL/PySpark/dbt/Airflow/JSON is shown.

### ConceptMotion visuals

- data-profile/distribution previews;
- table transformations;
- star-schema/data-model diagrams;
- lineage;
- Source -> Bronze -> Silver -> Gold -> BI flow;
- CDC/SCD2 explanations;
- orchestration workflows and run-state training views.

## Orchestration gap in the existing Forge handoff

The current Data Forge v1 handoff already includes:

- generated Airflow DAG output;
- Fabric/ADF reference output;
- Databricks reference output;
- Mermaid architecture/DAG ideas;
- lightweight D3 DAG/architecture ideas as later work.

It does **not** yet define a reusable official-product-like interactive pipeline/DAG learning surface. Foundation v1.1 fills that gap with a generic `WorkflowSpec` and Orchestration Workbench.

A later platform v2 may also let Forge emit canonical D3 `ChartSpec` / GeoStory specs for analytical previews and Power BI custom-visual generation. Do not implement that D3/Power BI layer in the current pass.

Forge should later render its generated workflow metadata using that shared workflow renderer rather than inventing another DAG canvas.

## Important separation

Forge generates realistic project artifacts. ConceptMotion explains/visualizes them.

```text
Data Forge ProjectSpec / generated manifest
             |
             +-> Airflow Python / Fabric reference / Databricks output
             |
             +-> generic ConceptMotion WorkflowSpec
             |           |
             |           +-> Airflow preset
             |           +-> Fabric/ADF preset
             |           +-> Lakeflow preset
             |
             +-> future canonical ChartSpec / GeoStorySpec
                         |
                         +-> @datapass/charts web/React
                         +-> @datapass/charts Power BI adapter
```

No actual pipeline execution is needed for this integration. Future SQL-parser adapters may emit column-lineage metadata into the same shared lineage specification, but Foundation v1.1 uses fixtures only.
