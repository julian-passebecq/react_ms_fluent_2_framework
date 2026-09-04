# Orchestration Workbench — DAG and pipeline learning UI

## Purpose

Build a reusable interactive visual surface for **learning, explaining and previewing** orchestration workflows without running Airflow, Fabric/ADF or Databricks.

This is feasible and intentionally much smaller than implementing actual pipeline engines.

The workbench renders a semantic workflow spec, lets the user inspect nodes/edges/groups, animates a simulated run, and optionally edits the JSON/YAML specification. Fluent provides the surrounding application UI; ConceptMotion/D3 provides the workflow canvas and semantic motion.

## Do not build separate products per vendor

Implement one generic semantic workflow model and renderer primitives. Add presentation presets/adapters for:

- `airflow`
- `fabric-data-factory`
- `azure-data-factory`
- `databricks-lakeflow`
- `generic`

The preset may change node chrome, labels, icon mapping and which inspector fields are emphasized. It must not fork the core scene/run model.

## Three modes

### 1. Topology

Explain the logical graph:

- task/activity nodes;
- dependencies;
- branching/fan-out/fan-in;
- task groups / nested containers;
- assets/data products when present;
- schedule/trigger metadata.

### 2. Run explanation

Animate a deterministic simulated run:

```text
queued -> running -> success
                   -> failed -> retrying -> running -> success
                   -> skipped
                   -> upstream_failed
```

The current state should be understandable without animation.

### 3. Spec playground

Lightweight authoring only:

- Monaco JSON editor (YAML optional if a dependency is justified);
- schema validation;
- live preview after valid changes;
- example presets;
- copy/download spec;
- reset.

No drag/drop pipeline builder in Foundation v1.1.

## Provider-inspired behavior to capture

### Airflow-inspired

- DAG Graph View: task dependencies and run-specific task state;
- Grid concept: task x recent-run state matrix can be a later/secondary view;
- TaskGroups / nested grouping;
- selected task inspector;
- run selector;
- code/spec tab concept;
- explicit state/retry/skip semantics.

Do not clone Airflow pixel-for-pixel or reproduce proprietary/brand assets unnecessarily.

### Fabric / Azure Data Factory-inspired

- activity toolbar/search concept;
- central pipeline canvas;
- selected activity configuration/inspector pane;
- dependency connector semantics:
  - success
  - failure
  - completion
  - skip;
- nested/control activities such as ForEach, If, Until, Switch;
- breadcrumb when focusing a nested container;
- zoom, fit and auto-layout controls;
- parameters/variables metadata.

### Databricks Lakeflow-inspired

- task dependency graph;
- task types such as notebook, pipeline, dbt, Python, SQL;
- branching and for-each control-flow representation;
- task compute/runtime metadata in inspector;
- selected run/task status overlay.

Again: visual inspiration and semantic equivalence, not a branded clone.

## Canvas primitives

Required reusable primitives:

- `WorkflowNode`;
- `WorkflowGroup` / `NestedContainer`;
- `Port` / dependency connector;
- routed `WorkflowEdge`;
- `RunStatusBadge`;
- `DurationBadge`;
- `Trigger/ScheduleBadge`;
- `TaskInspector` data contract;
- `Breadcrumb` for nested context;
- zoom/fit/center controls;
- deterministic auto-layout;
- focus/pin/selection;
- current-run overlay;
- optional asset/data-flow overlay.

## Dependency semantics

Do not use color alone.

```text
success      solid arrow + success marker
failure      distinct dashed/error marker
completion   alternate double/neutral marker
skip         dotted/skip marker
control      control-flow pattern
asset/data   separate data-flow style
```

Actual styling may use color as a secondary cue.

## Run simulation

Run animation is deterministic from the spec/timeline. It does not schedule or execute external code.

Useful teaching scenarios:

1. linear ETL;
2. fan-out + fan-in;
3. failure path;
4. retry then success;
5. skipped branch;
6. conditional branch;
7. nested ForEach / task group;
8. upstream failure blocking downstream;
9. data asset produced/consumed overlay;
10. batch vs streaming data flow alongside orchestration control flow.

## Relationship to cloud/data-flow diagrams

Do not conflate two graph types:

- **orchestration graph** = dependencies/control state;
- **data-flow/lineage graph** = movement/derivation of data.

ConceptMotion should be able to overlay or juxtapose them when pedagogically useful.

Example:

```text
CONTROL:   Copy -> Transform -> Publish
DATA:      Source => Bronze => Silver => Warehouse
```

This distinction is important in Airflow, Fabric/ADF and Lakeflow explanations.

## Fluent 2 responsibility

Fluent is appropriate for:

- top toolbar;
- tabs/modes;
- buttons;
- dropdowns;
- search;
- status badges;
- inspector forms;
- drawer/panel;
- breadcrumbs;
- accordions/trees;
- message bars;
- dialogs;
- theme/accessibility.

ConceptMotion owns the SVG/D3 graph itself.

## Foundation v1.1 scope

Required:

- generic workflow spec;
- deterministic graph layout;
- Airflow preset demo;
- Fabric/ADF preset demo;
- Lakeflow preset demo using the same model;
- run state animation;
- success/failure/completion/skip edge semantics;
- nested group/container demo;
- JSON spec playground;
- static SVG freeze/export;
- keyboard and reduced-motion support.

Not required:

- real Airflow parsing/execution;
- actual ADF/Fabric deployment;
- actual Databricks Jobs API;
- drag/drop authoring;
- credentials;
- schedule service;
- logs from real providers.
