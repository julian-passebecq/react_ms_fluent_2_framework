# START HERE — Datapass Visual Platform v2 post-v1 audit

Date: 2026-09-04
Baseline repository: `julian-passebecq/react_ms_fluent_2_framework`
Baseline commit audited: `d4435f55eb64eb02147e8ff0d51e3014c189fa75`
Workspace: `project/conceptmotion_studio`

This is the NEXT implementation handoff after Foundation v1.1 completed successfully.

## Read this first

Do **not** restart the framework. The current v1.1 implementation is the baseline and must remain working.

Read, in order:

1. `CODEX_MASTER_PROMPT.md`
2. `V1_POST_IMPLEMENTATION_AUDIT.md`
3. `V2_SCOPE_AND_BOUNDARIES.md`
4. `V2_IMPLEMENTATION_PLAN.md`
5. `TARGET_ARCHITECTURE_V2.md`
6. `FIGURE_AND_CONTENT_CONTRACTS.md`
7. `CODE_EDITOR_AND_PERFORMANCE.md`
8. `COURSE_NOTEBOOK_IMPORTER.md`
9. `DUBREU_FORMATION_CONSUMER.md`
10. `ASSESSMENT_AND_PROGRESS_V2.md`
11. `CATALOG_PROJECT_HUB_APP_FACTORY.md`
12. `STORYBOOK_GOLDEN_GALLERY.md`
13. `VOCABULARY_ARTICLE_CONTRACTS.md`
14. `OPTIONAL_RUNTIME_ADAPTERS.md`
15. `V2_ACCEPTANCE_CRITERIA.md`
16. `V2_AUDIT_CHECKLIST.md`

Then inspect the actual v1.1 source and its reports:

- `V1_TEST_REPORT.md`
- `V1_AUDIT_SELF_REVIEW.md`
- `V1_API_SURFACE.md`
- `V1_MIGRATION_LOG.md`
- `project/conceptmotion_studio/docs/ARCHITECTURE.md`

## Mission

V1.1 proved that the semantic/render/UI boundaries work. V2 should make them genuinely useful for creating real consumer sites quickly.

The first reference consumer is **Dubreu Formation**:

- Python course content;
- SQL course content;
- advanced SQL notebook exercises;
- PySpark notebooks displayed as rich lessons, **without Spark execution**;
- Monaco try/solution/diff for editable exercises;
- ConceptMotion visual explanations where they improve understanding;
- QCM/progress;
- external runtime launch links only when useful.

The next consumers should be easy to scaffold from the same packages:

- Norwegian vocabulary / article lesson site;
- Datapass project hub / website directory;
- existing portfolio and technical learning sites.

## Core rule

Do not add another framework inside the framework.

```text
semantic/content contracts
          |
          +--> ConceptMotion semantics
          +--> Knowledge metadata
          |
       FigureSpec
          |
    renderer adapters
          |
  React + Fluent surfaces
          |
  consumer applications
```

External runtimes and experimental tools remain at the edge:

```text
Colab / Databricks / Voila / Mercury / Streamlit / FastAPI
                         |
                  launch/adapters only
```

## Required return from Codex

Return the completed repository and these reports:

- `V2_TEST_REPORT.md`
- `V2_AUDIT_SELF_REVIEW.md`
- `V2_MIGRATION_LOG.md`
- `V2_API_SURFACE.md`
- `V2_BUNDLE_REPORT.md`
- `V2_CONSUMER_VALIDATION.md`

Do not claim Spark execution, notebook execution, SQL execution, Python execution, or live monitoring unless it is actually implemented and tested.
