# V4 data-platform capability matrix

Scope: framework authoring on parent `8fef4d0b542bfbb11b0ff80ec81710db3f6c8d55`. All examples use production contracts. The legacy `examples/generators/data-model-star.json` remains read-only reference; its `kind: data-model`, named columns and `layout: star` are not promoted to a new V4 API.

| Authoring need | Canonical Figure ID | Contract / existing renderer | What it proves |
| --- | --- | --- | --- |
| Star / semantic model | `sales-star-schema` | `LineageSpec` / `lineage.model` | One order-line fact, date/product/customer dimensions, explicit grain, PK/FK roles, three many-to-one relationships and dimension-to-fact filtering. Model links are explicitly distinct from derivation links. |
| SQL / column lineage | `sales-column-lineage` | `LineageSpec` / `lineage.model` | `raw.orders.amount → silver.orders.amount_clean → gold.fact_sales.sales_amount`; rename a globally unique order-line key; derive a business date. Stable endpoints, explanatory SQL, derivation labels and preserved grain. |
| Semantic measure / KPI lineage | `sales-kpi-lineage` | `LineageSpec` / `lineage.model` | Silver source fields → Gold modeled amount → Revenue measure → report KPI binding. The SQL Figure continues upstream to Raw. These Figures share the exact Gold field identity. |
| Medallion asset lineage | `medallion-asset-lineage` | `LineageSpec` / `lineage.model` | Operational source → Bronze → Silver → Gold → semantic model → report, with transformation intent at each edge. |
| Lakehouse / modern infrastructure | `lakehouse-conceptual` | `DiagramSpec` / `diagram.flow` | Source, Move, Store, Process, Model, Serve; representative Operate/Govern context links and explicit metadata applying both responsibilities to all six stages. |
| Provider lenses | `lakehouse-fabric`, `lakehouse-databricks`, `lakehouse-gcp`, `lakehouse-azure` | Same DiagramSpec, shared layered layout | Same node/edge IDs and responsibilities; different illustrative service vocabulary. No vendor geometry, provisioning or service equivalence guarantee. |
| DAG explanation | `backfill-dependencies` | `DiagramSpec` / `diagram.flow` | Fan-out and fan-in dependency topology without execution states. |
| Workflow topology | `backfill-workflow-topology` | `WorkflowSpec` / `workflow.topology` | Existing Workflow semantics without a run or explanation track. |
| Retry / backfill / fan-out / fan-in | `de-backfill` | `WorkflowSpec` / `workflow.run` | Reuses the accepted example unchanged. Two dates run concurrently; date two retries at attempt two; publish waits for both successes. |
| Lesson composition | Storybook `SalesLesson` and `TopologyAndRun` | Sibling production FigurePlayers | Independent surfaces, selection, playback, accessible names and local panning. No drawing canvas or consumer renderer. |

The narrow export is `@datapass/canonical/data-platform`. It provides 12 approved Figure records, `dataPlatformFigure(id)`, the four lineage specs, `backfillWorkflow`, `backfillTopology`, `lakehouseArchitecture(provider)`, provider/responsibility lists and attribution. There is no new package or renderer family. Original canonical exports, seven apps, separate legacy app and external Figure contract remain available.

`model`, `relationship`, `cyclePolicy` and semantic `layout` are optional additions to the existing core LineageSpec contract. Production validation stays in `validateLineageSpec`; renderer presentation stays in the existing lineage renderer. [The guide](V4_DATA_PLATFORM_AUTHORING_GUIDE.md) supplies examples and error cases; [the gaps](V4_DATA_PLATFORM_GAPS.md) bound these claims. [The report](V4_DATA_PLATFORM_AUTHORING_REPORT.md) records actual local and hosted evidence.
