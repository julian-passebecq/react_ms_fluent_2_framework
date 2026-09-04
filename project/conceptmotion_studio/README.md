# Datapass Visual Platform / ConceptMotion Studio

This directory is the runnable Foundation v1.1 workspace. It turns the earlier ConceptMotion Studio into a side-by-side package foundation for semantic visual explanations, technical diagrams, workflow teaching, challenges, and source-aware documentation.

The default app is the TypeScript/Fluent Studio in `apps/studio`. The earlier JavaScript/D3 Studio in `src` is preserved and has dedicated `dev:legacy` and `build:legacy` commands.

## Workspace packages

| Package | Boundary |
| --- | --- |
| `@conceptmotion/core` | Pure TypeScript semantics. No React, Fluent, Monaco, browser DOM, D3 or product host APIs. |
| `@conceptmotion/svg` | Framework-independent browser SVG rendering, keyed updates, semantic layout/theme roles, renderer registry and freeze/export. Depends only on core. |
| `@conceptmotion/react` | Thin React host for SVG renderer lifecycle, reduced-motion preference, selection and accessible fallbacks. |
| `@datapass/ui` | Fluent v9 application composites and EN/NO chrome. It owns layout, not visualization semantics. |
| `@datapass/knowledge` | Pure TypeScript source/feature/content/change contracts, validation, freshness and deterministic impact resolution. No UI or network behavior. |
| `@datapass/studio` | Consumer app that composes all five packages with local fixtures. |

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the dependency and lifecycle details and the repository-level [`V1_API_SURFACE.md`](../../V1_API_SURFACE.md) for public exports.

## Studio surfaces

- **Catalog** — searchable inventory of the v1.1 demonstrations and extension points.
- **Workbench** — table filter/sort teaching with stable row identity, timeline controls and inspector.
- **Explainers** — join fan-out, loop state, regression residuals, data/control flow, model lineage and column lineage.
- **Workflow** — one generic `WorkflowSpec`, deterministic run playback, group focus, task inspector, Airflow/Fabric-ADF/Lakeflow presentation presets and a validated Monaco JSON playground.
- **Challenge** — local challenge catalog, progressive hints, ConceptMotion explanation, Monaco code/solution/diff, static optional diagnostics and local draft/progress persistence.
- **Knowledge Atlas** — source-linked article shell, status/version/freshness badges, embedded figure, official source list and deterministic local change impact.

These are demonstration consumers, not separate semantic engines.

## Requirements and commands

Use Node 22.12 or later and pnpm 11.

```bash
pnpm install --frozen-lockfile
pnpm run dev
```

The main commands are:

| Command | Purpose |
| --- | --- |
| `pnpm run dev` | Run the Foundation v1.1 Studio |
| `pnpm run dev:legacy` | Run the preserved JavaScript/D3 Studio |
| `pnpm run typecheck` | Type-check all workspace references |
| `pnpm run test` | Run the v1.1 Vitest suites |
| `pnpm run test:legacy` | Run preserved catalog, scene, data, generator, handoff and Python smoke tests |
| `pnpm run check:boundaries` | Reject forbidden package dependencies/imports |
| `pnpm run check:offline` | Run legacy smoke tests, unit coverage and boundary checks |
| `pnpm run build` | Type-check and produce the v1.1 production bundle in `dist` |
| `pnpm run build:legacy` | Produce the legacy production bundle in `dist-legacy` |
| `pnpm run test:browser` | Run Playwright desktop and phone checks |
| `pnpm run check` | Run the complete required QA sequence |

Exact delivery results are recorded in [`V1_TEST_REPORT.md`](../../V1_TEST_REPORT.md), not inferred from this README.

## Authoring model

Author semantic state and stable IDs first. The renderer owns visual geometry; React owns application state and renderer lifecycle.

```ts
import {
  compileTableSort,
  planTransitions,
  type TableData,
} from '@conceptmotion/core';

const orders: TableData = {
  id: 'orders',
  columns: [{ id: 'amount', label: 'Amount' }],
  rows: [
    { id: 'order-17', values: { amount: 80 } },
    { id: 'order-22', values: { amount: 140 } },
  ],
};

const first = compileTableSort(orders, [{ columnId: 'amount', direction: 'asc' }]);
const next = compileTableSort(orders, [{ columnId: 'amount', direction: 'desc' }]);
const transition = planTransitions(first.snapshot, next.snapshot);
```

`order-17` and `order-22` remain the entity identities even when their display slots change.

## Compatibility

Foundation v1.1 supplements rather than rewrites the baseline:

- the legacy catalog, 36 live scenes, 28 renderer families, printable sheets, Python authoring helper, schemas and generator research remain in place;
- legacy flat scenes and canonical v1 `data` payloads continue to be normalized by `src/lib/scene.js` in the legacy app;
- the new default registry is a deliberately smaller seven-renderer foundation, not a claim that every legacy family was migrated;
- legacy generator contracts stay supported, while Data Forge itself remains outside this pass.

The package entry points currently export TypeScript source for workspace consumption. They are private v1.1 packages, not a prepared npm publication.

## Deliberate limitations

All workflow runs, knowledge changes, challenge content and column lineage are deterministic local fixtures. There is no pipeline execution, universal code judge, live monitoring/crawling, DAX Formatter call, SQL parser, Data Forge generator, D3 SDK v2/GeoStory implementation, Canvas backend, Web Component adapter, or Power BI adapter rewrite.

EN/NO support covers reusable application chrome and selected demonstration copy; it is not a full content translation program.

## Legacy references

The preserved baseline documentation remains useful when maintaining `src`:

- [`CODEX_HANDOFF.md`](CODEX_HANDOFF.md)
- [`AUDIT.md`](AUDIT.md)
- [`ROADMAP.md`](ROADMAP.md)
- [`QA_REPORT.md`](QA_REPORT.md)
- [`docs/AUTHORING_CONTRACT.md`](docs/AUTHORING_CONTRACT.md)
- [`research/SOURCE_AUDIT.md`](research/SOURCE_AUDIT.md)
- [`research/MOVING_VIDEO_SPEC.md`](research/MOVING_VIDEO_SPEC.md)
