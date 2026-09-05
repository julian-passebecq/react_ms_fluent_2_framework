# AGENTS.md — Datapass workspace

This directory is the active pnpm workspace for the reusable platform and seven application entry points. Follow the repository-root AGENTS.md and the current user release scope. The files CODEX_HANDOFF.md, AUDIT.md and ROADMAP.md document the preserved pre-foundation prototype; they do not replace the current architecture or authorize legacy renderer expansion.

## Local architecture

- `packages/core`: pure semantic state, validation, compilation and deterministic layouts.
- `packages/svg`: shared SVG rendering; `packages/react`: thin React adapters. React owns app state; the renderer owns its contained SVG subtree. Do not make consumers independently mutate it.
- `packages/ui`: restrained Fluent v9 composites and semantic visual tokens.
- `packages/content`: serializable contracts; `packages/figure`: renderer-neutral Figure composition.
- `packages/code`: the only Monaco integration; coding/spec routes load it lazily.
- `packages/learning`, `packages/progress`, `packages/knowledge`: shared learning/state/source boundaries.
- `content/`: canonical public project/practice/visual artifacts; apps consume these rather than duplicate them.
- `src/` and `vite.config.js`: preserved legacy JS/D3 application. Its catalog/scene/renderer counts are separate from modern semantic content.

Prefer semantic specs and stable object/row/node IDs. Do not add a renderer to restyle existing geometry or implement bespoke SVG animation inside apps. Figure presentation size/metadata visibility stays outside semantic content. Existing DiagramSpec category/icon/layout semantics serve both Atlas and Pilot.

## Authoring and privacy

Schemas in `schemas/authoring` are editor structural assistance only. Preserve unknown extensions and use the production runtime validators for reference integrity, cycles, Figure renderer payloads and semantic correctness. Do not equate AppRecipe metadata validation with scaffold CLI app-name validation.

Use `pnpm schemas:generate` only after reviewing the typed schema factory and parity tests; `pnpm schemas:check` detects committed JSON drift. `pnpm validate:specs <kind> <file.json>` performs schema plus runtime validation. Approved composition examples live in Storybook; `docs/AUTHORING_DX.md` gives direct links and commands.

Never import `content/*.private.local.*` or private backups into bundles. Keep IDs/persistence keys compatible, retain source attribution and preserve all deterministic public import projections. PySpark has no execution runtime here.

## Efficient verification

Use `pnpm exec vitest run <affected-path>`, an affected Vite build and `pnpm test:browser <affected-spec>` while implementing. New authoring/tooling work also runs `pnpm test:dx` and the boundary audit. Keep tests/assertions intact.

At the end of a release run one complete `pnpm check`: offline/import/unit/coverage/boundary/scaffold checks, all builds, legacy, Storybook, private-output scan and the desktop/phone browser matrix. Hosted success must be observed on the final pushed commit, not inferred from local results. Record exact commands/results; do not rerun the full gate after each small change.

When touching legacy rendering specifically, consult `research/SOURCE_AUDIT.md` and `research/MOVING_VIDEO_SPEC.md`; source references are pedagogical evidence, not permission to expand scope or copy branding/assets.
