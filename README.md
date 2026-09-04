# Datapass Visual Platform · V3

A reusable visual-learning and source-aware documentation platform, extended through seven working consumers. V3 builds on V2 commit `8cccd77ecd0d0b60b1d28ee2e41cffe5ec78a26f`; it preserves Foundation v1.1 and V2 rather than replacing them.

The runnable workspace is [project/conceptmotion_studio](project/conceptmotion_studio/README.md).

## Run

Node 22.12+ and pnpm 11 are required (CI pins Node 24.19.0).

```bash
cd project/conceptmotion_studio
pnpm install --frozen-lockfile
pnpm run check
pnpm run dev
```

| Consumer | Command / local port | Purpose |
| --- | --- | --- |
| Studio + Visual Sandbox | `pnpm run dev` / 4173 | Preserved V2 surfaces and production Figure JSON authoring at `/#/visual-sandbox` |
| Formation | `pnpm run dev:consumer` / 4175 | Courses, notebook lessons, SQL/Python reasoning, shared figures, assessments and local progress |
| Code Sandbox | `pnpm run dev:code-sandbox` / 4176 | 323 source-attributed practice items, 500 language/engine variants, hints, explanations and text comparison |
| Code Interview | `pnpm run dev:code-interview` / 4177 | Separate focused sessions, answer submission, review, flags and local progress |
| Algorithm Atlas | `pnpm run dev:algorithm-atlas` / 4178 | 30 migrated semantic visuals with stable IDs and reusable controls |
| Architecture Atlas | `pnpm run dev:architecture-atlas` / 4179 | Shared diagram/workflow/lineage semantics, provider lenses and deterministic layouts |
| Pilot Center | `pnpm run dev:pilot-center` / 4180 | Public project registry, Project Galaxy and structured local notes |

Ports above are development defaults, not claims that public sites have been deployed.

## Architecture and boundaries

Pure TypeScript semantics and contracts live in `packages/core`, `knowledge`, `content`, `notebook-import`, `progress` and `scaffold`. SVG rendering, thin React hosts, Fluent v9 controls, lazy Monaco and learning/Figure composites remain shared packages. Consumer content lives outside reusable packages. The earlier JavaScript/D3 Studio remains intact under `src`.

Python, SQL and PySpark are display/explanation/editing/text-comparison or external-launch content only. There is no code judge, Spark runtime, Jupyter kernel, pipeline executor, backend, authentication, cloud sync, source monitoring, mail/news/social integration, D3 Power BI rewrite or GeoStory implementation.

Pilot notes and private metadata stay in browser-local state and explicitly exported backups. Public builds import only the public registry. Backups containing private metadata must be treated as sensitive.

## Delivery and audit

- [V3 test report](V3_TEST_REPORT.md)
- [V3 audit self-review](V3_AUDIT_SELF_REVIEW.md)
- [V3 reuse report](V3_REUSE_REPORT.md)
- [V3 visual migration report](V3_VISUAL_MIGRATION_REPORT.md)
- [V3 consumer validation](V3_CONSUMER_VALIDATION.md)
- [V3 migration log](V3_MIGRATION_LOG.md)
- [V3 API surface](V3_API_SURFACE.md)
- [V3 bundle report](V3_BUNDLE_REPORT.md)
- [Implemented architecture](project/conceptmotion_studio/docs/ARCHITECTURE.md)

The [V3 handoff](reference_material/v3_handoff_2026-09-04/datapass-visual-platform-codex-v3-consumer-expansion/START_HERE.md) is retained as read-only source material. Root `START_HERE.md`, `CODEX_MASTER_PROMPT.md` and `V1_1_DELTA.md` remain the historical foundation contract; V1/V2 reports remain historical evidence. Current results and limitations belong in the V3 reports.
