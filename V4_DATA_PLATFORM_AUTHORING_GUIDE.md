# Author data-platform Figures

Use the production FigurePlayer and the narrow canonical examples. Run workspace commands from `project/conceptmotion_studio` with Node 24.19.0 and pnpm 11.19.0. External apps follow the unchanged exact-commit bootstrap and frozen-lock procedure in [EXTERNAL_CONSUMERS.md](project/conceptmotion_studio/docs/EXTERNAL_CONSUMERS.md).

```tsx
import { FigurePlayer } from '@datapass/figure';
import { dataPlatformFigure, dataPlatformSource } from '@datapass/canonical/data-platform';

<FigurePlayer
  figure={dataPlatformFigure('sales-star-schema')}
  presentationSize="compact"
  source={dataPlatformSource.label}
/>
```

The [capability matrix](V4_DATA_PLATFORM_CAPABILITY_MATRIX.md) lists all 12 IDs. Storybook's `V4/Data platform` group contains nine approved compositions. The canonical [TypeScript source](project/conceptmotion_studio/content/data-platform/index.ts) is a compact authoring template, not a JSON generator protocol. Copy a bounded example into consumer-owned content, change its semantic identities and labels, then run the production validator. Do not import framework app source or the legacy generator schemas.

## Choose the contract by meaning

| Meaning | Contract |
| --- | --- |
| Assets, fields, derivations, simple fact/dimension relationships | Core `LineageSpec`, Figure `lineage.model` |
| Architecture responsibilities, ports, groups and static dependencies | Core `DiagramSpec`, Figure `diagram.flow` |
| Task dependencies and declared retries / attempts / backfill state | Core `WorkflowSpec`, Figure `workflow.topology` or `workflow.run` |
| Actual analytical KPI/chart presentation | Consumer renderer, including the accepted external Figure seam; outside this pass |

These remain distinct contracts. A dependency arrow does not prove data lineage; a derivation does not establish grain; a model relationship does not execute a join. No authored coordinates, SVG paths, selectors or pixel offsets are required.

## Star schema: declare grain and field roles

Start from `salesStarSchema`. Its fact has `model: { kind: 'fact', grain: 'One row per order line' }`; each dimension has `model: { kind: 'dimension' }`. Fields use stable `id` and human `label`, with `role: 'pk' | 'fk' | 'measure' | 'attribute'`. IDs identify semantics, not array positions. `dataType` is optional descriptive metadata.

A compact valid model uses the existing lineage contract:

```ts
import { assertValidLineageSpec, type LineageSpec } from '@conceptmotion/core';

const model = {
  kind: 'lineage', version: '4', id: 'orders-model', title: 'Orders by date',
  layout: { provider: 'layered', direction: 'lr' }, cyclePolicy: 'reject',
  assets: [
    { id: 'orders', label: 'Orders', model: { kind: 'fact', grain: 'One row per order' },
      columns: [{ id: 'order_id', label: 'order_id', role: 'pk' },
        { id: 'date_key', label: 'date_key', role: 'fk' }] },
    { id: 'dates', label: 'Dates', model: { kind: 'dimension' },
      columns: [{ id: 'date_key', label: 'date_key', role: 'pk' }] },
  ],
  relations: [{ id: 'orders-date',
    sources: [{ assetId: 'orders', columnId: 'date_key' }],
    target: { assetId: 'dates', columnId: 'date_key' },
    relationship: { cardinality: 'many-to-one', filterDirection: 'dimension-to-fact' },
  }],
} satisfies LineageSpec;
assertValidLineageSpec(model);
```

Wrap your validated spec in the existing renderer-neutral Figure envelope:

```ts
import { validateFigureSpec, type FigureSpec, type JsonValue } from '@datapass/content';

const authoredFigure: FigureSpec = {
  id: model.id, kind: 'lineage', title: model.title, rendererId: 'lineage.model',
  spec: JSON.parse(JSON.stringify(model)) as JsonValue,
  fallbackText: 'One row per order. Orders.date_key references Dates.date_key many-to-one; Dates filters Orders.',
  profile: 'professional',
};
validateFigureSpec(authoredFigure);
// Render authoredFigure with the same FigurePlayer shown above.
```

The approved sales example extends this to three dimensions. A relationship goes from one fact FK to one dimension PK. The renderer shows `* : 1` and `filter ←`, meaning that filtering travels back from dimension to fact. `both` and `none` are explicit alternatives, not inferred defaults. These links have no derivation arrowhead. Do not put `expression`, `derivation`, `changeType`, `statementType` or `sourceSpan` on a model relationship. Author a separate derivation relation when data is transformed.

The validator checks declared endpoint roles and model kinds. It cannot prove actual data uniqueness, referential integrity, functional dependencies or a BI engine's filter behavior. Facts require non-empty localized grain. Existing non-model lineage assets do not gain an implicit grain requirement.

## Column and KPI lineage: keep stable endpoint identities

Use `salesColumnLineage` for three parallel derivation chains and `salesKpiLineage` for the semantic/report continuation. Raw amount is cast to a valid decimal in Silver and renamed to a Gold sales amount. The source supplies a globally unique order-line identifier; the fixture renames it and does not pretend to generate a surrogate key. Date extraction assumes upstream business-time-zone normalization. The Gold projection preserves order-line grain.

```ts
import { assertValidLineageSpec, getLineagePortId, type LineageSpec } from '@conceptmotion/core';

const columns = {
  kind: 'lineage', version: '4', id: 'amount-lineage', title: 'Clean an amount',
  cyclePolicy: 'reject', layout: { provider: 'layered', direction: 'lr' },
  assets: [
    { id: 'raw.orders', label: 'raw.orders', columns: [{ id: 'amount', label: 'amount' }] },
    { id: 'silver.orders', label: 'silver.orders', columns: [{ id: 'amount_clean', label: 'amount_clean', role: 'derived' }] },
  ],
  relations: [{ id: 'clean-amount',
    sources: [{ assetId: 'raw.orders', columnId: 'amount' }],
    target: { assetId: 'silver.orders', columnId: 'amount_clean' },
    label: 'CAST amount', expression: 'CAST(amount AS DECIMAL(12,2))',
    derivation: 'Convert a valid source amount to a decimal.',
    statementType: 'select', changeType: 'derive',
  }],
} satisfies LineageSpec;
assertValidLineageSpec(columns);
getLineagePortId(columns.relations[0].target);
// lineage-port:silver.orders:column:amount_clean
```

Use concise `label` for a visible derivation, `expression` for explanatory SQL/dbt/DAX text, and `derivation` for its meaning and assumptions. One relation can have multiple contributing source endpoints. Asset-level lineage omits `columnId`; field-level lineage always names a real field. Do not concatenate asset/column strings yourself: `getLineagePortId` escapes both namespaces.

`cyclePolicy: 'reject'` rejects cycles among exact derivation endpoints, including self-derivation. Acyclic `table.a → table.b` is valid within one asset. Model relationships are excluded because filter propagation is not derivation. Omitted policy and `allow` preserve historical behavior. Mixed asset/field endpoints are distinct; the validator does not invent containment dependencies. Version an in-place source/target asset explicitly when showing successive states.

The Revenue example sums `gold.fact_sales.sales_amount` in semantic filter context. Its final `report.sales.revenue-kpi` endpoint records a binding, not analytical KPI rendering. Compose the star and KPI Figures to explain how a dimension selection changes Revenue.

## Architecture and provider lenses

```ts
import { lakehouseArchitecture, dataPlatformFigure } from '@datapass/canonical/data-platform';
import { validateDiagramSpec } from '@conceptmotion/core';

const architecture = lakehouseArchitecture('azure');
validateDiagramSpec(architecture); // { valid: true, issues: [] }
const approvedFigure = dataPlatformFigure('lakehouse-azure');
```

`conceptual`, `fabric`, `databricks`, `gcp` and `azure` preserve the IDs `source`, `move`, `store`, `process`, `model`, `serve`, `operate`, `govern`. The helper changes vocabulary and provider metadata only. Source → Move → Store → Process → Model → Serve is a responsibility sequence, not a claim that every implementation must use six separate services. The medallion lineage example separately explains Bronze/Silver/Gold assets.

Operate/Govern nodes have `metadata.appliesTo` naming all six stages. Two representative context links keep the diagram readable. The existing grammar does not render a full spanning governance plane; retain the accompanying explanation rather than imply the representative links are exhaustive. Provider labels are illustrative choices, not interchangeable products or deployment advice.

The vocabulary was checked against primary documentation on 5 September 2026: [Fabric Data Factory](https://learn.microsoft.com/en-us/fabric/data-factory/data-factory-overview), [Databricks reference architecture](https://docs.databricks.com/_extras/documents/reference-architecture-databricks-generic.pdf), [Google Dataform overview](https://docs.cloud.google.com/dataform/docs/overview), and [Azure Data Factory / Purview lineage](https://learn.microsoft.com/en-us/purview/data-map-lineage-azure-data-factory). Google's orchestration label uses [Managed Airflow](https://docs.cloud.google.com/composer/docs), the current name for Cloud Composer. These sources ground service responsibilities; no live provider calls occur in the framework.

## DAG topology and declared run behavior

`backfillTopology` is a DiagramSpec derived from the existing backfill task IDs and dependencies. `backfillWorkflow` reuses the existing `de-backfill` WorkflowSpec by identity. `backfill-workflow-topology` presents its dependency contract without `runs` or `explanation`; `de-backfill` uses `workflow.run` with the original five-frame trace.

```ts
import { backfillWorkflow } from '@datapass/canonical/data-platform';
import { compileWorkflowRunFrame } from '@conceptmotion/core';

const run = backfillWorkflow.runs![0];
const retry = compileWorkflowRunFrame(backfillWorkflow, run.id, 'retry');
// day1: success; day2: retrying, attempt 2; publish: pending
```

Omitted task states carry forward from the previous frame. Node/run/frame IDs remain stable when a task retries; date scope stays explicit in the two authored task identities. Publish advances only in the authored fan-in frame. This is a tested teaching trace, not an executor or scheduler simulation. The compiler validates allowed state transitions and references; it does not infer readiness, execute SQL, expand mapped tasks or enforce vendor retry policy. FigurePlayer currently selects the first declared run.

## Compose a lesson with sibling Figures

```tsx
<section style={{ display: 'grid', gap: '1rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 26rem), 1fr))' }}>
  <FigurePlayer figure={dataPlatformFigure('sales-star-schema')} presentationSize="compact" />
  <FigurePlayer figure={dataPlatformFigure('sales-kpi-lineage')} presentationSize="compact" />
</section>
```

The lesson, prompt and reasoning remain consumer-owned. Use normal CSS for the surrounding page and semantic specs for the Figures. The shared player provides selection, playback, reduced-motion/static access, export and labeled keyboard panning. Use `layout: { provider: 'layered', direction: 'lr' }` for short field chains and `tb` for long medallion/KPI chains. This is a semantic orientation, not authored geometry. Keep dense examples bounded; [remaining layout limits](V4_DATA_PLATFORM_GAPS.md) are explicit.

## Invalid authoring examples and verification

Starting from a valid example, these changes must fail `validateLineageSpec`:

| Invalid edit | Production issue code |
| --- | --- |
| `assets: [asset, asset]` | `lineage.asset.id.duplicate` |
| Same field ID twice within one asset | `lineage.column.id.duplicate` |
| Same relation ID twice | `lineage.relation.id.duplicate` |
| `target: { assetId: 'missing' }` | `lineage.endpoint.asset.unknown` |
| `target: { assetId: 'raw.orders', columnId: 'missing' }` | `lineage.endpoint.column.unknown` |
| Fact `model: { kind: 'fact' }` or blank grain | `lineage.model.grain.required` |
| Relationship source uses a non-FK or target uses a non-PK | `lineage.relationship.endpoints.invalid` |
| Relationship has `expression: 'SUM(amount)'` | `lineage.relationship.derivation.conflict` |
| With `cyclePolicy: 'reject'`, add `A.a → B.b` and `B.b → A.a` | `lineage.relation.cycle` |
| `layout: { provider: 'force' }` | `lineage.layout.invalid` |

These exact cases are covered by [core authoring tests](project/conceptmotion_studio/packages/core/tests/lineage-authoring.test.ts). Canonical tests additionally check shared endpoints, model meaning, source distribution, provider identity, run states, deterministic geometry/export and every Figure envelope/payload.

```powershell
pnpm exec vitest run packages/core/tests/lineage-authoring.test.ts tests/visuals/data-platform.test.ts
pnpm test:dx
pnpm schemas:check
pnpm validate:specs figure your.figure.json
pnpm test:external-consumer learning
```

`validate:specs figure` validates the existing structural schema and Figure envelope, not an arbitrary renderer payload. Also call `validateLineageSpec`, `validateDiagramSpec` or `validateWorkflowSpec` / run compiler for its actual contract. The new canonical examples and external fixture already do both. No competing schema or validator was added. Run one full `pnpm check` after the finished tree is ready; release acceptance also requires hosted CI success on the exact pushed commit.
