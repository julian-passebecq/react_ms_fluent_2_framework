# ConceptMotion product contract

ConceptMotion is a semantic visual-explanation library for technical and data concepts.

## It is responsible for

- interactive explanatory figures;
- stable object identity through state changes;
- semantic timelines/actions;
- table transformations;
- algorithm/programming state;
- statistics/ML explanations;
- cloud/data flow explanations;
- lineage/data models;
- orchestration DAG/pipeline topology and simulated run state;
- deterministic static freeze/export;
- provider-independent structured specs that AI/tools can author;
- optional localized explanatory text values where inexpensive.

## It is not responsible for

- replacing React;
- replacing Fluent;
- replacing Monaco;
- generic form/navigation controls;
- actual code execution/judging;
- actual Airflow/Fabric/ADF/Databricks execution;
- universal free-form diagram editing;
- becoming a wrapper around every chart library;
- owning the general analytical/editorial chart grammar;
- owning the future D3 GeoStory/world-map grammar;
- owning Power BI host APIs.

General analytical charts, temporal world maps and Power BI chart generation belong to the sibling D3 SDK / future `@datapass/charts` track. ConceptMotion may later embed those outputs inside a teaching sequence.

## Primary web product composition

```text
Fluent application shell
        +
@conceptmotion/react
        +
@conceptmotion/svg
        +
@conceptmotion/core
```

Challenge/spec code surfaces may additionally use Monaco at the application layer.

## Visual promise

The default output should be:

- serious;
- concise;
- modern;
- editorially disciplined;
- explainable without motion;
- richer with meaningful motion;
- accessible;
- reusable across multiple applications.
