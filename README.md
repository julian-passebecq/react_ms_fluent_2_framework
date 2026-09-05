# Datapass Visual Platform · V4

A reusable visual-learning and source-aware documentation platform with seven working consumers. V4 consolidates final V3 `36c01d404e0acfd0bf9b55417ad48b4e9285586c`: clearer consumer language, compact/regular/expanded Figure presentation, eleven refined explanations and repository-native authoring tools. Foundation v1.1, V2 and the complete V3 inventory remain intact.

The runnable workspace is [project/conceptmotion_studio](project/conceptmotion_studio/README.md).

Independent repositories use the [V4 external-consumer guide](project/conceptmotion_studio/docs/EXTERNAL_CONSUMERS.md): exact-commit selective bootstrap, consumer-owned frozen lockfile, canonical data exports, standalone scaffolds and production browser release gates. The [hardening report](V4_CONSUMER_HARDENING_REPORT.md), [consumer findings](V4_CONSUMER_FINDINGS.md) and [post-consumer backlog](V4_POST_CONSUMER_BACKLOG.md) record the release evidence and deliberate deferrals.

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

- [V4 audit self-review](V4_AUDIT_SELF_REVIEW.md)
- [V4 factorisation and shared APIs](V4_FACTORISATION_REPORT.md)
- [V4 visual review](V4_VISUAL_REVIEW.md)
- [V4 developer experience](V4_DX_REPORT.md)
- [V4 test report](V4_TEST_REPORT.md)
- [V4 bundle report](V4_BUNDLE_REPORT.md)
- [V4 migration log](V4_MIGRATION_LOG.md)
- [Authoring guide and approved compositions](project/conceptmotion_studio/docs/AUTHORING_DX.md)

Historical V3 evidence:

- [V3 test report](V3_TEST_REPORT.md)
- [V3 audit self-review](V3_AUDIT_SELF_REVIEW.md)
- [V3 reuse report](V3_REUSE_REPORT.md)
- [V3 visual migration report](V3_VISUAL_MIGRATION_REPORT.md)
- [V3 consumer validation](V3_CONSUMER_VALIDATION.md)
- [V3 migration log](V3_MIGRATION_LOG.md)
- [V3 API surface](V3_API_SURFACE.md)
- [V3 bundle report](V3_BUNDLE_REPORT.md)
- [Implemented architecture](project/conceptmotion_studio/docs/ARCHITECTURE.md)

The [V4 handoff](reference_material/v4_handoff_2026-09-05/datapass_visual_platform_codex_v4_consolidation_2026-09-05/START_HERE.md) and earlier handoffs are retained as read-only source material. Root `START_HERE.md`, `CODEX_MASTER_PROMPT.md` and `V1_1_DELTA.md` remain the historical foundation contract. Current results and limitations belong in the V4 reports; earlier reports are not rewritten as current evidence.
