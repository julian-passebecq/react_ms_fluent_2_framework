# Datapass Visual Platform — V2 post-v1 audit handoff

This package is a focused implementation handoff for the next Codex pass after Foundation v1.1 completed in `julian-passebecq/react_ms_fluent_2_framework`.

It is intentionally smaller than earlier planning archives. The actual completed repository is now the source of truth; this package contains the audit-driven V2 delta rather than another copy of all historical research.

## Main V2 decisions

1. Preserve and extend v1.1; do not rewrite it.
2. Share/lazy-load Monaco through one code adapter.
3. Add a serializable renderer-neutral Figure/content layer.
4. Add Course/Lesson/Notebook/Assessment contracts and a deterministic `.ipynb` importer.
5. Use Dubreu Formation as the first real consumer validation.
6. PySpark notebooks are display/explanation content only in V2 — no Spark execution.
7. SQL/Python learning should be richer than raw notebooks through Monaco, ConceptMotion, hints, solution diff, QCM and progress.
8. Add Project Registry, Explorer components and a small app scaffold for quick future sites.
9. Add Storybook Golden Gallery and hosted CI.
10. Keep Voila/Mercury/Colab/Databricks/Streamlit/FastAPI/browser execution as edge adapters or future work.

## Contents

- `START_HERE.md` — execution order and baseline.
- `CODEX_MASTER_PROMPT.md` — complete implementation prompt.
- `V1_POST_IMPLEMENTATION_AUDIT.md` — independent source-level audit of the returned repository.
- `V2_SCOPE_AND_BOUNDARIES.md` — exact required/non-goal scope.
- `V2_IMPLEMENTATION_PLAN.md` — phased work order.
- `TARGET_ARCHITECTURE_V2.md` — dependency model.
- `FIGURE_AND_CONTENT_CONTRACTS.md` — Figure/Course/Notebook/Lesson contracts.
- `CODE_EDITOR_AND_PERFORMANCE.md` — Monaco/lazy-load improvements.
- `COURSE_NOTEBOOK_IMPORTER.md` — deterministic IPYNB import and Deepnote SQL extraction.
- `DUBREU_FORMATION_CONSUMER.md` — reference consumer requirements.
- `ASSESSMENT_AND_PROGRESS_V2.md` — QCM/mock/interview + shared progress.
- `CATALOG_PROJECT_HUB_APP_FACTORY.md` — Explorer/Project Registry/scaffold.
- `STORYBOOK_GOLDEN_GALLERY.md` — reusable component catalog/test layer.
- `VOCABULARY_ARTICLE_CONTRACTS.md` — lightweight Norwegian/article-study content contracts.
- `OPTIONAL_RUNTIME_ADAPTERS.md` — runtime boundaries.
- `V2_ACCEPTANCE_CRITERIA.md` and `V2_AUDIT_CHECKLIST.md` — completion gates.
- `reference_material/` — source attachment manifests.
- `reference_templates/` — small example specs.

## Source payloads

The full Dubreu/private course files are **not duplicated in this archive**. Give Codex the source attachments separately if you want the full content imported in the same pass. The manifests identify the expected files and hashes.
