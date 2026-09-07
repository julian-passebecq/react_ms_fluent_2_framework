# Datapass project documentation index

**Current coordination date:** 2026-09-07  
**Purpose:** tell a future AI/maintainer what to read first and prevent historical V1/V2/V3/V4 planning documents from being mistaken for the current roadmap.

---

## 1. Read these first

For current project direction, read in this order:

1. **`PROJECT_AUDIT_SUMMARY_2026-09-07.md`**  
   Current lead-AI judgment of the entire Datapass / ConceptMotion / ForgeViz program: what is proven, what was over/under-engineered, consumer evidence, current branch/PR state and recommended direction.

2. **`MASTER_BACKLOG.md`**  
   Current project-wide priorities. Includes completed/proven items, P0/P1/P2 work, subsystem ownership and explicit deferred/rejected work.

3. **`TECH_LANDSCAPE_AUDIT_2026.md`**  
   Current external technology comparison and ADOPT / ADAPT / KEEP / DEFER / REJECT decisions across D3, Vega/Vega-Lite, ECharts, Plot, G2, React Flow, deck.gl, Motion, Power BI, Deneb, anywidget, Evidence and educational visualization references.

4. **`PROJECT_PASS_LOG.md`**  
   Append-only project-level milestone ledger with dates, model, branches, commits, CI runs and decisions.

5. **Current subsystem docs**  
   Read the local implementation/backlog files for the subsystem you are changing rather than inferring implementation detail from this index.

---

# 2. Current framework evidence

These remain authoritative for the delivered V4 framework baseline:

- `V4_AUDIT_SELF_REVIEW.md`
- `V4_TEST_REPORT.md`
- `V4_BUNDLE_REPORT.md`
- `V4_FACTORISATION_REPORT.md`
- `V4_VISUAL_REVIEW.md`
- `V4_DX_REPORT.md`
- `V4_MIGRATION_LOG.md`
- `V4_CONSUMER_FINDINGS.md`
- `V4_CONSUMER_HARDENING_REPORT.md`
- `V4_POST_CONSUMER_BACKLOG.md`
- `V4_VISUAL_CAPABILITY_MATRIX.md`
- `project/conceptmotion_studio/docs/ARCHITECTURE.md`
- `project/conceptmotion_studio/docs/AUTHORING_DX.md`
- `project/conceptmotion_studio/docs/EXTERNAL_CONSUMERS.md`

### Important distinction

`V4_POST_CONSUMER_BACKLOG.md` is still useful historical V4 evidence, but **`MASTER_BACKLOG.md` is now the current project-level priority ledger** because it includes work performed after 2026-09-05, especially ForgeViz extraction and Table Trace consumer validation.

---

# 3. Current Table Trace / ConceptMotion promotion evidence

Table Trace is **not yet framework main** at the time of this index.

Current promotion candidate:

- branch: `experiment/post-hardening-table-trace-consumer-v1`
- draft PR: #3
- base: framework `main@30e69639bfc3929c348fd8f9c6c38a2cb61984d8`
- candidate: `6652930fa6ea036aec8cc87cbfe4a2d85ea83230`
- successful full promotion CI: `34095496628`

Read on that branch:

- `TABLE_TRACE_CROSS_CONSUMER_PROMOTION_RECOMMENDATION_V1.md`
- ConceptMotion Table Trace semantic documentation
- ConceptMotion Table Trace Motion documentation

Consumer evidence:

### Formation

Repository: `julian-passebecq/Fluent2_J_Formation`

- branch: `experiment/table-trace-consumer-evidence-v1`
- verified checkpoint: `d75975c27f77738cc88a0343822181eb3c91a331`
- Actions run: `34064646300`

### Visual Algorithms

Repository: `julian-passebecq/Fluent2_J_VisualAlgo`

- branch: `experiment/table-trace-consumer-evidence-v1`
- verified checkpoint: `711ddd2e8da94f4ad293af47da7a02e646dbb022`
- Actions run: `34066982354`

Do not silently repin consumer mains to the experiment branch.

---

# 4. ForgeViz current documentation

Canonical repository:

`julian-passebecq/fluent_forgeviz`

Read:

1. `README.md`
2. `BACKLOG.md`
3. `FEATURE_MATRIX.md`
4. `PASS_LOG.md`

Source lineage:

`julian-passebecq/Fluent2_J_Viz@7aaa8fa601c5fa2c9f8acfd7a4d4eb54b887b9ef`

Important current state:

- standalone engine repo exists;
- package is still `private: true`;
- only ranking has direct standalone family-level runtime smoke today;
- all 15 families compile;
- the website consumer remains separate and still embeds its verified V1.2 engine copy until a deliberate cross-repository integration pass.

Do not duplicate ForgeViz backlog detail in the framework. Use `MASTER_BACKLOG.md` only to coordinate project priority.

---

# 5. Independent consumer repositories

Current named external consumers:

- `julian-passebecq/Fluent2_J_Formation`
- `julian-passebecq/Fluent2_J_CodeLab`
- `julian-passebecq/Fluent2_J_VisualAlgo`
- `julian-passebecq/Fluent2_J_CloudArchi`
- `julian-passebecq/Fluent2_J_Norsk`
- `julian-passebecq/Fluent2_J_Portfolio`
- `julian-passebecq/Fluent2_J_Viz` — VizForge Studio/gallery consumer

For a consumer, prefer these files when present:

- `CONSUMER_REUSE_REPORT.md`
- `FRAMEWORK_GAPS.md`
- `VISUAL_REUSE_REPORT.md`
- `QA_REPORT.md`
- consumer-specific handening/evidence handoff

Consumer reports are evidence. They do **not** automatically authorize a framework API.

---

# 6. Historical framework generations

Historical reports are preserved because they explain why the current architecture exists.

## Foundation v1.1

- `V1_AUDIT_SELF_REVIEW.md`
- `V1_TEST_REPORT.md`
- `V1_MIGRATION_LOG.md`
- `D3_REFERENCE_AUDIT.md`
- `REFERENCE_AUDIT_V11_IDEAS.md`

Use these to understand the origin of core boundaries, not as the current roadmap.

## V2

- `V2_AUDIT_SELF_REVIEW.md`
- V2 migration/test/API reports
- `reference_material/v2_handoff_2026-09-04/...`

## V3

- `V3_AUDIT_SELF_REVIEW.md`
- `V3_TEST_REPORT.md`
- `V3_REUSE_REPORT.md`
- `V3_VISUAL_MIGRATION_REPORT.md`
- `V3_CONSUMER_VALIDATION.md`
- `V3_MIGRATION_LOG.md`
- `V3_API_SURFACE.md`
- `V3_BUNDLE_REPORT.md`

## V4

See section 2.

### Historical source material

Directories under `reference_material/` and `prior_research/` remain valuable provenance/reference material. They should not override newer audits or user scope decisions.

---

# 7. Current architecture boundaries

Use this ownership map before proposing a new package or renderer:

```text
Datapass / Fluent J
  application shell
  learning/content/code/progress/import/scaffold
  Figure host

ConceptMotion
  semantic technical/educational state
  algorithms/tables/joins/workflows/diagrams
  deterministic explanatory motion

ForgeViz
  analytical/editorial D3 stories
  deterministic StorySpec
  thin host adapters

Consumer
  lesson/product content
  provider-specific copy
  routing/navigation
  local adapters and CSS
```

If a new need does not fit, first ask whether a mature external library should own it.

---

# 8. Current major hard boundaries

Do not assume the project includes or should immediately include:

- backend/auth/cloud sync;
- production monitoring/observability connectors;
- real Spark/Jupyter/SQL runtime;
- universal code judge;
- SQL parser;
- generic map engine;
- generic node editor;
- universal declarative chart grammar;
- Power BI visual generator;
- Canvas/WebGL renderer;
- point-and-click universal visual editor.

These are either explicitly deferred, rejected, or require new evidence.

---

# 9. Release/QA reading order

For framework changes:

1. targeted package/unit tests while developing;
2. typecheck/project references;
3. content/spec/schema validation;
4. production build/bundle/privacy checks;
5. desktop + 390px browser gate;
6. keyboard/reduced-motion/Axe/overflow;
7. independent external-consumer proof when package/distribution boundaries change.

Do not weaken existing checks to make a pass green.

For consumer changes, follow that consumer's own release gate and preserve the four required reports.

---

# 10. How to update this documentation set

### A major project pass

Append `PROJECT_PASS_LOG.md` and adjust `MASTER_BACKLOG.md` status/priority.

### A subsystem implementation

Update the subsystem backlog/report first. Only change the master backlog when the project-level priority or conclusion changes.

### New external-library research

Update `TECH_LANDSCAPE_AUDIT_2026.md` only when the evidence changes a project decision. Do not turn it into a weekly link dump.

### New framework version

Create new version-specific audit/test/migration reports while preserving old ones. Update this index so the newest current coordination docs are unmistakable.
