# CODEX MASTER PROMPT — Datapass Visual Platform V3

You are continuing the current local/GitHub repository `julian-passebecq/react_ms_fluent_2_framework` from Foundation V2 commit `8cccd77ecd0d0b60b1d28ee2e41cffe5ec78a26f` or a descendant.

## 1. Preserve V2

Do not rebuild the platform from scratch. Reuse the implemented packages:

- ConceptMotion core/svg/react
- `@datapass/ui`
- `@datapass/knowledge`
- `@datapass/content`
- `@datapass/notebook-import`
- `@datapass/code`
- `@datapass/figure`
- `@datapass/progress`
- `@datapass/learning`
- `@datapass/scaffold`

Before changing APIs, find at least one concrete V3 consumer requirement that the existing API cannot satisfy cleanly.

## 2. Fix hosted CI before expansion

Inspect GitHub Actions run `33913887435`. It passed every step except Playwright because four Linux visual baselines were absent. Fix the baseline strategy without disabling screenshot tests. Prefer a reproducible Linux Playwright/Chromium baseline environment. Review generated baselines before blessing them.

After the fix, keep hosted CI green throughout V3. A locally green suite is no longer sufficient for completion.

## 3. Rename the learning consumer to Formation

Change visible product identity from “Dubreu Formation” to **Formation**. Prefer renaming the app/package/build output if the migration is clean. Preserve historical reports and imported-source provenance IDs where `dubreu` is factually meaningful; do not rewrite history or provenance merely for branding.

Use `reference_assets/formation_visual_direction.png` as a visual direction reference only. Do not turn it into a giant hero image or copy its fake UI literally.

## 4. Build Code Sandbox as the full coding-practice product

Read `V3_CODE_SANDBOX_AND_INTERVIEW.md` and the existing source repo `julian-passebecq/leetcodedataeng` as a **read-only content/pedagogy source**. Preserve its valuable corpus and concepts; do not transplant its old CSS/component implementation into the framework.

Create a deterministic content adapter/import path. If the source repo is accessible, migrate the full existing practice corpus while preserving stable IDs/titles/variants/attribution where feasible. If it is not accessible, implement the adapter and a representative corpus and document the blocker; never fabricate missing third-party/private content.

Code Sandbox should use shared Catalog/Explorer + Challenge Workbench + Monaco + Figure + Progress. It is not Code Interview.

## 5. Build Code Interview separately

Create a focused interview practice app composed from Assessment, Progress, Figure and code-choice/editor surfaces. Keep it session/interview-oriented instead of another 300-item coding catalog.

Use quick/focused/mock modes and domain packs. No remote judge.

## 6. Build Algorithm Atlas / Concept Atlas

Read `V3_VISUAL_MIGRATION_AND_CONCEPTMOTION.md`. Use existing `leetcodedataeng`, `mlweb`, legacy ConceptMotion and current renderers as source material.

Migrate **meaning**, not old renderer code. Target 20–30 high-value semantic scenes across SQL, Python/algorithms, data engineering and selected ML/stats.

First map every candidate to an existing renderer/spec. Add at most 1–2 new generic semantic renderer families in V3, and only if each is used by at least four real concepts. No per-concept renderer explosion.

## 7. Build Architecture Atlas

Read `V3_ARCHITECTURE_ATLAS.md` and use `julian-passebecq/architectureweb` as a read-only content/reference source. Rebuild architecture views through `DiagramSpec`, `WorkflowSpec`, lineage, Figure and semantic icons. Do not copy the old custom React layout as a new renderer stack.

Add a deterministic radial/hub layout provider behind the existing `DiagramLayoutContract`. Keep a lightweight layered provider for architecture flows; use ELK only if clearly necessary and only behind the existing contract.

## 8. Build Pilot Center

Create a local-first private/personal utility app, not part of the professional portfolio. It needs:

- project status + next actions;
- cards/table/galaxy views;
- project galaxy using the same DiagramSpec + radial layout;
- structured sticky-note idea board;
- local persistence + JSON import/export;
- direct project/tool links.

No email/news/stocks/social/Codex-usage integrations.

## 9. Canonical Project Registry

Move public project metadata out of Studio-local data into a shared source-controlled content artifact validated by `@datapass/content`.

Project Hub and Pilot Center must consume the same public records. Private repo URLs/local annotations must not be bundled into a public app. If needed, support an optional gitignored local overlay used only by Pilot Center.

Extend project status additively if Pilot Center needs `building`/`planned`. Preserve existing records/migration.

## 10. Build Visual Sandbox in Studio

Add a development route that edits a semantic/figure spec with the shared Monaco adapter and renders the real production `FigureView`/renderer registry. Include validation, example selection, locale, reduced motion, responsive width, selection inspector and SVG export where the renderer supports it.

This is the canonical renderer playground. Do not use Streamlit for this role.

## 11. Formation reasoning capstones

Add “Think in SQL” and “Think in Python for Data Engineering” as concise end-of-course modules. These are mental-model lessons, not another exercise dump. Use existing Course/Lesson/Figure/ConceptMotion/Assessment surfaces. See `V3_FORMATION.md`.

PySpark remains display/explanation/reference-output/external-launch only.

## 12. Visual language

Apply `V3_VISUAL_LANGUAGE.md` consistently across new apps:

- warm off-white / neutral canvas;
- deep navy ink;
- slate neutrals;
- restrained teal functional accent;
- sparse warm amber highlight;
- thin borders;
- small/intentional soft depth;
- Fluent 2 application structure;
- editorial figures;
- no marketing-gradient overload;
- motion only when it explains state, causality, focus, progression or flow.

## 13. Testing and reports

Keep all V1/V2 tests. Add tests for new contracts, adapters, consumers and migrations. Add browser coverage for desktop and 390px phone for each new primary consumer path, but do not take brittle screenshots of every page.

Improve numeric coverage reporting for pure V2 packages (`content`, `notebook-import`, `progress`, `scaffold`) without forcing meaningless UI percentages.

Run the authoritative full gate plus hosted GitHub Actions. Completion requires hosted CI green.

Return/update:

- `V3_TEST_REPORT.md`
- `V3_AUDIT_SELF_REVIEW.md`
- `V3_REUSE_REPORT.md`
- `V3_VISUAL_MIGRATION_REPORT.md`
- `V3_CONSUMER_VALIDATION.md`
- `V3_MIGRATION_LOG.md`
- `V3_API_SURFACE.md`
- `V3_BUNDLE_REPORT.md`

The reuse report must identify exactly which shared packages/components each consumer uses and where app-specific code remains.

## 14. Completion discipline

V3 is a large feature pass, but do not use “big pass” as permission to create a mega-package. Make concrete consumers first. Only factor code when repeated consumer evidence justifies it.

Commit and push the completed V3 work to `main` if credentials permit. Report the commit SHA and hosted CI run/conclusion.
