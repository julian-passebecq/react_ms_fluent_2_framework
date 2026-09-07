# Archive manifest and retention policy

## Why archive

Git preserves source history but not the complete multi-agent reasoning/evidence state. Dated ZIPs preserve the coordination checkpoint that produced a decision.

## Required ZIP structure

```text
DATAPASS_PROJECT_CONTROL_YYYY-MM-DD_CYCLE_XX_<label>/
  MANIFEST.md
  CURRENT_PROJECT_STATE.md
  MASTER_BACKLOG.md
  REPOSITORY_STATE.md
  DECISION_LOG.md
  RELEASE_TRUTH.md
  agents/
    TECH_LEAD_REPORT.md
    CEO_PRODUCT_UX_REPORT.md
    CODING_AGENT_A_REPORT.md
    CODING_AGENT_B_REPORT.md
    TEST_AGENT_REPORT.md
    AUDIT_BACKLOG_REPORT.md
  research/
    TECH_LEAD_RESEARCH_SUMMARY.md
    EXTERNAL_LIBRARY_COMPARISON.md
    ARCHITECTURE_DIAGRAMS.md
    FEATURE_GAP_MATRIX.md
    SOURCES.md
  product/
    USER_PREFERENCE_LEDGER.md
    PRODUCT_PRINCIPLES.md
    CONSUMER_UX_AUDITS.md
    SCREENSHOT_INDEX.md
  evidence/
    TEST_AND_CI_EVIDENCE.md
    REUSE_EVIDENCE.md
    FRAMEWORK_GAPS_CONSOLIDATED.md
    CONSUMER_EVIDENCE_INDEX.md
  decisions/
    PROMOTION_AND_DEFERMENT_LOG.md
```

Empty placeholders are allowed only in the cycle-00 bootstrap archive. Later archives must distinguish `not requested`, `not completed`, `blocked`, and `verified`.

## Technical Lead research ZIP

The Technical Lead also produces a focused research ZIP when a broad architecture/library comparison is commissioned:

`DATAPASS_TECH_LEAD_RESEARCH_YYYY-MM-DD_<topic>.zip`

It must contain the research summary, current web sources with access date, library/feature comparison matrix, Mermaid architecture/feature diagrams, overengineering review, missing-big-feature review, consumer implications and recommendations classified as reuse/adapt/build/defer/reject.

## CEO/Product UX ZIP

When the consumer product audit is broad, create:

`DATAPASS_CEO_PRODUCT_UX_YYYY-MM-DD.zip`

It must contain the user's preference ledger, product principles, screenshot index, per-consumer audits and prioritized product recommendations. Screenshots may be stored as external evidence references if binary size would bloat the repo.

## Storage policy

Keep source Markdown under `project-control/`. Store only meaningful milestone ZIPs under `project-control/archives/`; do not add one binary ZIP per small coding task.
