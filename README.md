# Datapass Visual Platform Foundation v1.1

This repository contains the Foundation v1.1 implementation of a reusable visual-learning and source-aware documentation platform. The working code is in [`project/conceptmotion_studio`](project/conceptmotion_studio/README.md); the files at the repository root are the product contract and handoff source of truth.

Foundation v1.1 provides semantic TypeScript contracts, framework-independent SVG renderers, thin React adapters, Fluent v9 application composites, a local source/change metadata package, and a Studio that demonstrates how those pieces compose.

## Read first

1. [`START_HERE.md`](START_HERE.md)
2. [`CODEX_MASTER_PROMPT.md`](CODEX_MASTER_PROMPT.md)
3. [`V1_1_DELTA.md`](V1_1_DELTA.md)

## Implemented workspace

| Path | Responsibility |
| --- | --- |
| `project/conceptmotion_studio/packages/core` | Pure semantic state, stable IDs, table/algorithm/diagram/workflow/lineage contracts, validation, transition planning, icons and deterministic serialization |
| `project/conceptmotion_studio/packages/svg` | Framework-independent SVG lifecycle, keyed renderers, layout, semantic flow styling, registry and deterministic SVG freeze/export |
| `project/conceptmotion_studio/packages/react` | Thin React lifecycle adapters for ConceptMotion and workflow scenes |
| `project/conceptmotion_studio/packages/ui` | Fluent v9 shell, workbench, challenge, workflow, knowledge, figure, status, diagnostics and EN/NO application composites |
| `project/conceptmotion_studio/packages/knowledge` | Pure source, feature, knowledge, change, freshness and deterministic impact contracts |
| `project/conceptmotion_studio/apps/studio` | Catalog, visual workbench, explainers, workflow workbench, challenge workbench and Knowledge Atlas demonstrations |

The earlier JavaScript/D3 ConceptMotion Studio remains under `project/conceptmotion_studio/src`. It is retained as a compatibility and behavioral baseline; the v1.1 app and packages do not destructively replace it.

## Run

Node 22.12 or later and pnpm 11 are required.

```bash
cd project/conceptmotion_studio
pnpm install --frozen-lockfile
pnpm run dev
```

Useful commands:

```bash
pnpm run check:offline   # legacy smoke tests, unit coverage, package-boundary audit
pnpm run build           # type-check and build the v1.1 Studio
pnpm run build:legacy    # build the preserved JavaScript Studio
pnpm run test:browser    # desktop and phone browser/accessibility checks
pnpm run check           # complete required QA sequence
pnpm run dev:legacy      # run the preserved JavaScript Studio
```

## Foundation scope

The Studio uses deterministic, source-controlled fixtures. It does not execute challenge code or workflows, crawl sources, call DAX/SQL analyzers, generate Data Forge projects, implement the D3 SDK v2/GeoStory stack, or include a Power BI adapter rewrite. Those boundaries are intentional so the v1.1 packages remain reusable and testable.

## Delivery documents

- [`V1_API_SURFACE.md`](V1_API_SURFACE.md) — public workspace exports and examples
- [`V1_MIGRATION_LOG.md`](V1_MIGRATION_LOG.md) — baseline observations and compatibility decisions
- [`V1_TEST_REPORT.md`](V1_TEST_REPORT.md) — commands and recorded QA results
- [`V1_AUDIT_SELF_REVIEW.md`](V1_AUDIT_SELF_REVIEW.md) — acceptance review and known limitations
- [`project/conceptmotion_studio/docs/ARCHITECTURE.md`](project/conceptmotion_studio/docs/ARCHITECTURE.md) — implemented dependency and runtime architecture
