# Reference audit — challenge and workflow UIs

This document captures useful lessons from the user-supplied archives and current official product patterns. It is research guidance, not a dependency/vendor list.

## User-supplied ZillaCode archives

Observed useful frontend ideas:

- split problem/editor workspace;
- question list;
- topic/difficulty filtering;
- code starter state;
- local draft persistence;
- flag/progress concepts;
- previous/next navigation.

Observed architecture to avoid for this project:

- backend execution endpoint;
- database/Spark Lambda infrastructure;
- terminal/output surface as a primary V1 feature;
- mixed MUI + Material Tailwind + Tailwind + CodeMirror stack.

The new foundation should use **Fluent + Monaco + ConceptMotion** instead.

## User-supplied LeetCode clone / code-judge archives

Useful ideas:

- dedicated problem-page navbar;
- reusable workspace split;
- local storage hooks;
- separate problem model;
- diff/compare direction.

Avoid carrying forward judge/auth/runtime complexity in Foundation v1.1.

## Existing user trainer

The current trainer already proves that problem + editor + source data + animated concept can work, but too much is visible at the same time. Foundation v1.1 therefore makes ConceptMotion an optional `Visualize` tab and solution/diff separate right-pane modes.

## Official workflow UI patterns reviewed in September 2026

### Apache Airflow 3

Official docs describe a refreshed UI with DAG details tabs including Overview, Grid, Graph, Runs, Tasks, Events, Code and Details. Graph View shows logical task dependencies and can overlay run-specific task state. Grid View shows task state across recent DAG runs. TaskGroups organize complex graphs.

Source:
- https://airflow.apache.org/docs/apache-airflow/stable/ui.html
- https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html

### Microsoft Fabric Data Factory / Azure Data Factory

Official Fabric pipeline-canvas docs describe:

- activity toolbar;
- central canvas;
- node connectors;
- bottom configuration pane;
- success/failure/completion/skip dependency conditions;
- nested ForEach / If / Until / Switch style control activities;
- breadcrumbs for nested context;
- search / zoom / fit / auto-align.

ADF visual authoring similarly uses a canvas plus resource/property/configuration panes.

Sources:
- https://learn.microsoft.com/en-us/fabric/data-factory/pipeline-canvas-experience
- https://learn.microsoft.com/en-us/azure/data-factory/author-visually

### Databricks Lakeflow Jobs

Official docs describe jobs as task graphs, with visual authoring for dependencies and control flow such as branching and for-each, plus task-specific configuration/runtime metadata.

Sources:
- https://docs.databricks.com/aws/en/jobs
- https://docs.databricks.com/aws/en/jobs/configure-task

## Product conclusion

Do not clone any official UI. Extract the shared interaction grammar:

```text
catalog/list -> workflow graph -> selected node inspector -> run/state view -> code/spec view
```

Then render that grammar with the user's restrained Fluent theme and ConceptMotion semantics.
