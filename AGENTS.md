# AGENTS.md — Datapass visual platform

## Current mission and scope

Maintain a reusable visual-learning platform and its seven consumers. V4 is consolidation of the preserved V3 baseline, not another platform rebuild. The current user request defines the release scope; attached handoffs and historical research provide requirements/reference, not authorization for unrelated integrations.

Read the active release handoff and latest audit/test/reuse reports before implementation. For V4 read the ten primary documents in `reference_material/v4_handoff_2026-09-05/datapass_visual_platform_codex_v4_consolidation_2026-09-05/` and the root V4 audit/factorisation matrix. Root `START_HERE.md`, `CODEX_MASTER_PROMPT.md` and `V1_1_DELTA.md` describe the original foundation and remain historical references.

## Workspace and reuse map

Run toolchain commands from `project/conceptmotion_studio` with the pinned pnpm and Node versions in package.json/CI. Read that directory's AGENTS.md for local guidance.

- Catalog and application composites → `@datapass/ui`, with Fluent v9 generic controls.
- Code/editor/diff → shared lazy `@datapass/code`. Never import Monaco directly in apps.
- Learning/challenge/assessment → `@datapass/learning` and canonical content.
- Figures → `FigureSpec` plus `@datapass/figure`; presentation size is a component concern, not a content field.
- Animated explanations → existing ConceptMotion semantic specs and stable IDs, not bespoke SVG animation when a renderer fits.
- Architecture/project graphs → `DiagramSpec` plus shared deterministic layouts and semantic icon IDs.
- Progress → `@datapass/progress`; preserve persistence keys and upgrade/recovery paths.
- Knowledge → pure `@datapass/knowledge` source/status/version/change semantics with local fixtures.

Keep core, content, knowledge and progress free of React, Fluent, Monaco, DOM and network/service dependencies. New reusable code is TypeScript. FigureFrame/VisualizationSurface stay renderer-neutral. Airflow/Fabric/ADF/Lakeflow share the same workflow semantics. Column-lineage contracts remain ready without adding a SQL parser.

## Implementation rules

Preserve working behavior, stable content IDs, deterministic imports, source attribution, all seven apps and the separate legacy app. Do not modify unrelated user changes. Extract only proven repetition (normally three consumers) or a strong semantic boundary; no mega-package or wrapper around every Fluent primitive.

Use restrained warm-neutral/navy/teal visual tokens, sparse amber, meaningful motion and accessible reduced-motion/static states. Keep consumer explanations useful and internal IDs/schema/renderer/provenance diagnostics in opt-in details. Required legal attribution and truthful runtime information must remain available.

Keep private Pilot overlays runtime-imported and device-local. Never statically import private files or leak private repository URLs into any public output, including source maps. All original EN/NO infrastructure and public registry reuse remain intact.

## Verification and review

During development run affected unit tests, affected builds and targeted browser flows. At release completion run one full `pnpm check` on the finished tree, then verify hosted CI on the exact final commit when release/push is requested. Preserve enabled screenshot comparisons, original overflow/Axe/privacy gates and all per-package coverage floors. Never claim untested behavior passed.

Editor schemas are structural aids tested against existing runtime validators. Run `pnpm test:dx`, `pnpm schemas:check` and `pnpm validate:specs` for authoring changes. Keep semantic reference/cycle/renderer validation in the existing packages; do not create a competing validator.

## Boundaries

No Spark/Jupyter/backend/auth/cloud-sync/universal judge/pipeline execution, news/mail/social integrations, DAX network calls, SQL parser integration, Data Forge backend, D3 Power BI rewrite, GeoStory, full legacy rewrite, VS Code extension or MCP server in V4. PySpark stays display/explanation/external-launch only.

Treat `reference_material/`, the sibling D3 SDK, DAX Formatter, SQL Query Lineage and SQLBI Whiteboard as read-only reference unless the user explicitly requests otherwise. Preserve the sibling-library boundary rather than absorbing it.
