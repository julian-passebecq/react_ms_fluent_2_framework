# Datapass / ConceptMotion / ForgeViz — master backlog

**Current as of:** 2026-09-07  
**Model maintaining this pass:** GPT-5.6 Sol  
**Coordination scope:** Datapass/Fluent J, ConceptMotion, ForgeViz, six independent consumers, VizForge consumer, release engineering and evidence-driven future adapters.  
**Rule:** this is the current project-level priority ledger. Subsystem backlogs/reports remain authoritative for implementation detail.

Read `PROJECT_COMPLETENESS_REAUDIT_2026-09-07.md` first for the verification vocabulary and consumer release-status matrix.

---

## 1. Status vocabulary

| Status | Meaning |
| --- | --- |
| `PROVEN` | Implemented and backed by strong framework/consumer/release evidence. |
| `IMPLEMENTED` | Code/product exists, but final evidence breadth is incomplete. |
| `PROMOTION CANDIDATE` | Experiment/shared branch is release-verified and awaits explicit adoption. |
| `SOURCE-BLOCKED` | Source material is absent; do not invent it. |
| `P0` | Highest current priority; precedes broad new feature families. |
| `P1` | High-value product/framework work after P0 stabilization. |
| `P2` | Measured specialist exploration. |
| `DEFERRED` | Deliberately postponed. Not permission to start opportunistically. |
| `REJECTED` | Explicitly outside the intended architecture. |

### Shared-abstraction promotion rule

Normally require either:

1. repeated concrete evidence from at least two consumers; or
2. one clearly new semantic category existing contracts cannot represent truthfully.

One-off CSS, copy, routing and product composition remain consumer-owned. Release/bootstrap bugs are exceptions because they affect every external consumer.

---

# 2. Completed / proven work — do not rebuild

| ID | Capability / decision | Status | Evidence / note |
| --- | --- | --- | --- |
| DONE-001 | Datapass package separation | `PROVEN` | UI/content/learning/code/progress/notebook/knowledge/scaffold/Figure boundaries survived V1–V4. |
| DONE-002 | ConceptMotion core/SVG/React separation | `PROVEN` | Framework-neutral semantic core and SVG runtime with thin React host. |
| DONE-003 | Stable semantic identities | `PROVEN` | Algorithms, tables, joins, workflows, diagrams and Table Trace use stable IDs instead of DOM selectors. |
| DONE-004 | Deterministic Figure/player + reduced motion/export | `PROVEN` | Shared playback/state/static export across framework and consumers. |
| DONE-005 | WorkflowSpec vs DiagramSpec responsibility split | `PROVEN` | Cloud Architecture validates behavior vs topology without another graph engine. |
| DONE-006 | No fake execution/runtime policy | `PROVEN` | SQL/Python/PySpark/code/workflow surfaces remain truthful explanatory/editing experiences. |
| DONE-007 | Shared lazy Monaco/code workbench | `PROVEN` | Apps do not import Monaco directly. |
| DONE-008 | Deterministic practice corpus | `PROVEN` | 323 items / 500 variants repeatedly validated. |
| DONE-009 | Consumer vs developer metadata separation | `PROVEN` | V4 disclosure/details patterns. |
| DONE-010 | Compact/regular/expanded Figure presentation | `PROVEN` | V4 shared presentation contract; wide-scene legibility still has follow-up. |
| DONE-011 | External-consumer release-gate pattern | `PROVEN` | Exact pin, frozen install, typecheck, validation, build, desktop/390px, keyboard/Axe/overflow. |
| DONE-012 | Cloud Architecture independent release | `PROVEN` | `Fluent2_J_CloudArchi@3325cd099...` against framework `30e69639...`. |
| DONE-013 | ForgeViz standalone extraction | `PROVEN` | `fluent_forgeviz`; exact V1.2 source parity, standalone build/test/package smoke. |
| DONE-014 | ForgeViz local governance | `PROVEN` | `BACKLOG.md`, `FEATURE_MATRIX.md`, `PASS_LOG.md`. |
| DONE-015 | Table Trace semantic grammar | `PROVEN` experimentally | `use/map/drop/create/derive/group`; table/row/column/cell/group positions. |
| DONE-016 | Table Trace semantic motion | `PROVEN` experimentally | use pulse, map travel, drop exit, create enter, derive/group convergence; no authored coordinates. |
| DONE-017 | Formation Table Trace proof | `PROVEN` experimentally | Nine source-scoped SQL traces; run `34064646300`; zero consumer renderers. |
| DONE-018 | Visual Algorithms Table Trace proof | `PROVEN` experimentally | Six distributed-data/ranking traces; run `34066982354`; zero consumer renderers. |
| DONE-019 | Table Trace full promotion candidate | `PROMOTION CANDIDATE` | PR #3, candidate `6652930f...`, full framework run `34095496628` green. |
| DONE-020 | Moving SQL `ROWS BETWEEN` semantics | `PROVEN` | Post-hardening table/window-frame semantics; do not replace with Table Trace. |
| DONE-021 | DFS vertical worklist | `PROVEN` | `collection.flow`; generic arbitrary recursion remains separate. |
| DONE-022 | VizForge V1.2 hosted consumer release | `PROVEN` | `Fluent2_J_Viz@7aaa8fa...`, run `34033499554`. |
| DONE-023 | Project audit/backlog/landscape governance set | `PROVEN` documentation | Current docs + second completeness re-audit. |

---

# 3. P0 — framework distribution, AI authorability and promotion

These are the highest-leverage next tasks.

| ID | Owner | Work | Priority | Acceptance |
| --- | --- | --- | --- | --- |
| DP-P0-001 | Framework/ConceptMotion | **Explicit Table Trace promotion decision** | `P0` | Review PR #3 and merge/version deliberately if approved. No silent consumer repins. |
| DP-P0-002 | Framework | Built/versioned external package path | `P0` | External consumer installs exact provenance without rebuilding a monorepo source closure; frozen install proof. |
| DP-P0-003 | Content/release | **Portable canonical content exports** | `P0` | Stable external entry points for canonical Figures/explanations, 323/500 practice data and public ProjectRegistry; separate lightweight metadata from full payloads. |
| DP-P0-004 | Scaffold/release | Single framework pin source | `P0` | Pin checker/generated scripts read one manifest; no hard-coded second SHA. |
| DP-P0-005 | Scaffold/release | External bootstrap closure hardening | `P0` | Generate pnpm 11 build-script policy, tsconfig/config closure, portable file paths and canonical package/content closure. |
| DP-P0-006 | Datapass/ConceptMotion | AI capability registry | `P0` | Machine-readable intent -> package/family -> example -> validator -> semantics -> exclusions. |
| DP-P0-007 | Datapass/ConceptMotion | Concise AI authoring pack | `P0` | Quickstart, canonical valid/invalid JSON, targeted commands and minimal historical reading. |
| DP-P0-008 | ConceptMotion | Renderer-selection guide | `P0` | Positive/negative decisions for table.trace/table.transform/table.join/collection/loop/workflow/diagram; moving window frame explicitly excluded from Table Trace. |
| DP-P0-009 | ConceptMotion | Synchronized code/rule focus | `P0` | WHERE/GROUP BY/PARTITION BY/routing rules synchronize with semantic visual relations without a new renderer family. |
| DP-P0-010 | ConceptMotion | Runtime JSON hardening | `P0` | Retain promotion-candidate rejection of unknown serialized relation/view/reference values. |
| DP-P0-011 | ConceptMotion/SVG | Additive renderer registration | `P0` | Retain promotion-candidate registrar; reduce central registry/scene merge pressure. |
| DP-P0-012 | QA | Shared external-consumer browser audit helper | `P0` | Narrow Tabster sentinel policy, keyboard/reduced-motion/Axe/overflow; app/renderer marks remain blocking. |
| DP-P0-013 | Figure/UI | **Wide technical Figure responsive strategy** | `P0` | Preserve label legibility on 390px: internal pan/contain/compact alternate; no success claim based only on absence of page overflow. Repeated in Portfolio + VizForge. |
| DP-P0-014 | Documentation | Keep current source-of-truth reading order | `P0 maintenance` | Completeness report, audit summary, backlog, landscape, pass log stay synchronized. |

---

# 4. P0 — ForgeViz stabilization before feature expansion

Detailed criteria live in `julian-passebecq/fluent_forgeviz/BACKLOG.md`.

| ID | Work | Priority | Acceptance / note |
| --- | --- | --- | --- |
| FV-P0-002 | AI/agent authoring guide | `P0` | Explain StorySpec/VisualizationSpec/families/states/transitions with compact examples. |
| FV-P0-003 | Canonical fixture per 15 families | `P0` | Valid fixtures usable by docs/tests. |
| FV-P0-004 | Family-level schema tests | `P0` | Positive + meaningful invalid cases for all families. |
| FV-P0-005 | Family-level runtime smoke | `P0` | All 15 render/destroy deterministically; today direct standalone smoke is mainly ranking. |
| FV-P0-006 | Public package contract | `P0` | Pack/install/import root + React adapter from an independent host. |
| FV-P0-007 | Stable JSON presentation/theme options | `P0 after fixtures` | Declarative bounded options, backward-compatible, no arbitrary CSS/coordinates. |
| FV-P0-008 | Player/playhead/autoplay/cadence contract | `P0` | play/pause/reset/seek/next/previous/speed/autoplay ownership; reduced motion; reconcile authored `intervalMs` vs host cadence. |
| FV-P0-009 | Versioning/compatibility policy | `P0` | Additive/breaking schema policy, deprecations, publication criteria. |
| FV-P0-010 | Cross-repository consumer rewire | `P0 before publish/delete duplication` | One exact ForgeViz package pin passes consumer release gate before embedded engine removal. |
| FV-P0-011 | Public naming/namespace audit | `P0 before public branding/publish` | Check npm/product/domain/confusion risk; unrelated `vizforge.ai` exists. Do not publish under a confusing public identity without decision. |

---

# 5. P1 — Formation

Do not invent absent lessons/solutions/media.

| ID | Work | Acceptance / boundary |
| --- | --- |
| FORM-P1-001 | Reproducible real course-corpus materialization | Clean hosted full-course gate using actual supplied corpus; experiment synthetic notebook does not substitute for this. |
| FORM-P1-002 | Table Trace adoption | Only after framework promotion; retain canonical V4 conceptual Figures where they provide a different useful lens. |
| FORM-P1-003 | Code/rule synchronization | Use shared code-focus semantics once canonical. |
| FORM-P1-004 | Sectioned/lazy notebook primitive | First-class H1/H3/section composition only if framework extraction remains clean and reusable. |
| FORM-P1-005 | `SolutionReference` / gated source-cell contract | Relate exercise cells/IDs to solution sources without exposing corrections by default. |
| FORM-P1-006 | Source-cell editorial classification | Add metadata such as learner-hidden/source-note/solution while preserving raw notebook bytes. |
| FORM-P1-007 | Exercise -> solution provenance | Deterministic `exerciseId -> solution source` for 72 applied solution files. |
| FORM-P1-008 | Safe local-media discovery helper | Optional Node/build helper; notebook importer stays pure/non-executing. |
| FORM-P1-009 | Safe notebook image/media rendering | Render trusted local source media without arbitrary HTML execution. |
| FORM-BLOCK-001 | 19 missing QueryBook image references | `SOURCE-BLOCKED` — acquire original sources later; never fabricate replacements as source material. |

---

# 6. P1 — Visual Algorithms / technical educational visuals

| ID | Work | Acceptance / boundary |
| --- | --- |
| VA-P1-001 | Adopt six proven Table Trace alternates | Only after framework promotion; canonical renderer remains default where stronger. |
| VA-P1-002 | Better operation choreography | Reuse compare/swap/pointer/group/travel cues before another renderer family. |
| VA-P1-003 | Code highlighting | Active code/rule synchronized with semantic state. |
| VA-P1-004 | ExplanationTrack authoring helpers | Small pure helpers/state-label definitions/one-call validation; do not introduce another runtime. |
| VA-P1-005 | Recursion/stack presentation hint | Optional orientation/stack semantics; `collection.flow` already solves DFS worklist. |
| VA-P1-006 | Git/system-state proof | Try Diagram/scene semantics first; add `graph.state` only if pointer/working-tree/commit state cannot fit cleanly. |
| VA-P1-007 | Database/system internals lessons | Teach OLTP/OLAP, WAL/page ordering, storage/compute separation, cache, immutable/delta/image concepts using existing semantic families first. |
| VA-P1-008 | Static/animated parity | Cheat-sheet/static mode and reduced motion remain complete; animate causality/state, not trivial syntax. |

### Technical visual style rule

White/near-white surfaces, neutral strong outlines, few semantic accents, direct labels, whitespace and monospace where useful. No blurry pastel/watercolor look; no decorative gradient/shadow by default. Color and motion communicate state/cause, not decoration.

---

# 7. P1 — Data Engineering Code Lab

| ID | Work | Acceptance |
| --- | --- |
| CODE-P1-001 | Full external-consumer release rerun | Frozen install/typecheck/content/build/desktop/390px/keyboard/Axe/overflow, no fake execution. |
| CODE-P1-002 | Portable practice-data entrypoint | Covered by DP-P0-003; consumer must not import monorepo-private source paths. |
| CODE-P1-003 | Lightweight visual-availability metadata | Cheap `hasPracticeVisual`/equivalent without loading full Figure registry. |
| CODE-P1-004 | Full visual resolver entrypoint | Load actual Figure only when Visualize is opened. |
| CODE-P1-005 | Mapped-only Visualize UX | Hide/disable visual tab when no real mapping exists; no empty capability theater. |
| CODE-P1-006 | Review/mastery/hints/notes polish | Reuse shared progress and Code/Solution/Compare; deterministic IDs. |
| CODE-P1-007 | Corpus authoring/diagnostics | Make 323/500 extension safe for AI without weakening deterministic validation. |

Hard boundary: no browser Spark/SQL/Python judge unless explicitly authorized later.

---

# 8. P1 — Norsk Tech & Work Vocabulary

| ID | Work | Acceptance / boundary |
| --- | --- |
| NO-P1-001 | Full external release rerun | Frozen production gate when environment is reproducible. |
| NO-P1-002 | Arbitrary lexical language map | BCP-47 lexical translations independent of EN/NO UI locale; support Bokmål + English + French cleanly. |
| NO-P1-003 | Entity-neutral mastery/review primitive | Promote only if reuse beyond vocabulary is demonstrated. |
| NO-P1-004 | Source-less KnowledgeEntry guidance | Document taxonomy/reference entries that legitimately have no external source. |
| NO-P1-005 | Optional content-validator CLI | Extract only if multiple consumers repeat the need. |
| NO-P1-006 | Common-life vocabulary later | Additive future content path; initial professional themes remain stable. |
| NO-BOUNDARY-001 | Audio/pronunciation | No invented audio/pronunciation. |

Dense trilingual row presentation remains local unless repeated elsewhere.

---

# 9. P1 — Portfolio Consumer Lab

| ID | Work | Acceptance |
| --- | --- |
| PF-P1-001 | Separate preview release | Never overwrite `datapassj.com` without explicit authorization. |
| PF-P1-002 | Portable public ProjectRegistry | Covered by DP-P0-003; stable external entrypoint. |
| PF-P1-003 | Pure ProjectRegistry -> Galaxy helper | Promote only if repeated; deterministic semantic mapping only. |
| PF-P1-004 | Cross-repo `portfolio-hub` scaffold | External-repository mode without monorepo assumptions. |
| PF-P1-005 | Optional Galaxy recipe discoverability | Make capability easy for agents without forcing it into every portfolio. |
| PF-P1-006 | Responsive/static proof | Desktop + 390px + keyboard/Axe/no overflow and wide-Figure legibility policy. |

Career timeline, personal routing and product-specific CSS remain consumer-local.

---

# 10. P1 — Cloud Architecture product improvements

These preserve WorkflowSpec/DiagramSpec; no new graph engine.

| ID | Work | Acceptance |
| --- | --- |
| CA-P1-001 | Pedagogical autoplay | Useful behavior starts automatically where appropriate; reduced motion respected. |
| CA-P1-002 | Local + page/global pause | One preference can pause/disable motion while local controls remain available. |
| CA-P1-003 | Ambient semantic data-flow | Edge-derived particles/dashes; no authored geometry. |
| CA-P1-004 | Distinct flow/motion roles | Batch, stream, CDC, control, retry/error/state change do not all animate identically. |
| CA-P1-005 | Canonical JSON/text below visual | Copy/edit/inspect production semantic spec in developer/AI-friendly surface. |
| CA-P1-006 | Export UX | SVG canonical; PNG through reliable host adapter, not semantic-core rasterization. |
| CA-P1-007 | Semantic architecture colors | Bronze/Silver/Gold and similar roles are theme/presentation tokens. |
| CA-P1-008 | JSON visual lab | Editable sample architectures/workflows; no point-and-click editor required. |
| CA-P1-009 | Provider logo/icon strategy | Official icons/logos only with documented source/licensing/fallback; semantic fallback icons remain valid. |

---

# 11. P1 — ForgeViz differentiated product value

| ID | Feature | Acceptance principle |
| --- | --- | --- |
| FV-P1-001 | Event-annotated time series | General events for finance/BI/pipeline/releases, not finance-only hard-coding. |
| FV-P1-002 | Richer deterministic story choreography | Reusable scene/focus/camera/annotation timing; no video-editor state. |
| FV-P1-003 | Spec inspector/structured diagnostics | Normalized spec + AI-consumable validation issues. |
| FV-P1-004 | JSON/text authoring playground | Source canonical; edit/validate/render/inspect; no point-and-click requirement. |
| FV-P1-005 | Export contract | SVG first; PNG adapter/host. |
| FV-P1-006 | All-family accessibility | Meaningful summary/data fallback semantics. |
| FV-P1-007 | Visual regression matrix | Representative desktop/narrow/reduced-motion families. |
| FV-P1-008 | React adapter integration proof | Packed package lifecycle/timer cleanup in clean host. |
| FV-P1-009 | Responsive wide-scene behavior | Coordinate with shared Figure legibility strategy. |

Existing event-map/geo support and real-data flagships are retained. GeoStory is later expansion, not a prerequisite for geography.

---

# 12. P1 — DataForge Learn / Data Execution Atlas

Learning consumer only; not a production observability tool.

| ID | Capability | Notes |
| --- | --- | --- |
| DF-P1-001 | Logical -> physical execution lessons | SQL/pandas/Polars/PySpark operation to physical behavior. |
| DF-P1-002 | Partition/shuffle/skew/spill/cache visuals | Reuse Table Trace/collection/workflow/diagram before new family. |
| DF-P1-003 | Performance before/after evidence | ForgeViz histograms/time series/distributions using static educational fixtures. |
| DF-P1-004 | Provider lenses | Spark/Databricks/BigQuery/Fabric/Snowflake/DuckDB; source-grounded. |
| DF-P1-005 | Event annotations | Deployment/schema/repartition/cache events on metrics as lessons. |
| DF-P1-006 | ExecutionPlanSpec decision | `DEFERRED` until consumer proves Workflow/Diagram cannot model operators truthfully. |
| DF-BOUNDARY-001 | Connectors/credentials/alerts | No production monitoring, billing/telemetry backend or warehouse credentials. |

---

# 13. P2 — measured specialist/library experiments

Do these only after P0/P1 authoring/distribution work.

| ID | Experiment | Decision gate |
| --- | --- | --- |
| EXP-P2-001 | D3FC SVG/Canvas/WebGL benchmark | Measure representative ForgeViz dense families before custom backend. |
| EXP-P2-002 | D3plus v4 scene-graph/backend benchmark | Compare serializable scene graph, SVG/Canvas backend and accessibility ideas; adapt only if it reduces our maintenance cost. |
| EXP-P2-003 | ECharts commodity/high-volume routing | Use directly for standard dashboards/high-volume cases; do not wrap without differentiated value. |
| EXP-P2-004 | ELK/elkjs layout adapter | Test layout-only integration before writing more custom DAG/architecture layout. |
| EXP-P2-005 | Cytoscape.js graph consumer proof | Only for rich graph analysis/interaction beyond current explanatory specs. |
| EXP-P2-006 | Sigma.js large-network proof | Only for measured large network need. |
| EXP-P2-007 | deck.gl + MapLibre serious geo proof | Future scalable temporal maps/basemap; do not replace small SVG schematic maps. |
| EXP-P2-008 | Power BI `.pbiviz` ForgeViz proof | One differentiated story; compare against Deneb/Vega-Lite first. |
| EXP-P2-009 | anywidget/Jupyter thin adapter | Only if a notebook-host consumer appears; no Python rewrite. |
| EXP-P2-010 | GSAP choreography proof | Only if WAAPI/Motion/D3 cannot express required host/story timing cleanly. |
| EXP-P2-011 | PixiJS GPU 2D proof | Only after measured non-geo high-shape-count need. |
| EXP-P2-012 | Pyodide/pandas/SQL trace adapter | Low priority; optional trace producer after semantic specs are stable, never prerequisite for authoring. |
| EXP-P2-013 | AI productivity benchmark | Compare new consumer work using Datapass/ConceptMotion/ForgeViz vs ordinary React/library stack; measure code/reuse/QA friction. |

---

# 14. QA / release-engineering maintenance debt

| ID | Work | Priority |
| --- | --- | --- |
| QA-M-001 | GitHub Actions Node runtime deprecation cleanup | Maintenance; do not mix with feature pass unless necessary. |
| QA-M-002 | React `act()` / Keyborg stderr cleanup | Maintenance; preserve assertions. |
| QA-M-003 | Monaco lazy chunk measurement | Track; optimize only with evidence because it remains lazy and policy checks pass. |
| QA-M-004 | Physical-device / broader browser coverage | P2 unless a consumer requires it; current automated emphasis is Chromium desktop + phone. |
| QA-M-005 | Consumer release-status accuracy | Always distinguish source/audit/experiment/full release evidence. |

---

# 15. Deferred V5 / later systems

Tracked so they are not forgotten; not authorized by this backlog alone.

| ID | Work | Status / trigger |
| --- | --- | --- |
| D-V5-001 | `@datapass/charts` / Visual Factory | `DEFERRED` until consumer need exceeds direct Plot/ECharts/Vega/ForgeViz routing. |
| D-V5-002 | GeoStory reusable system | `DEFERRED` until geo adapter/backend proof. |
| D-V5-003 | Earthquake temporal geo flagship | `DEFERRED`; validate generic geo/time/story primitives first. |
| D-V5-004 | City/Paris flood narrative | `DEFERRED`; same. |
| D-V5-005 | Actor/movie movement story | `DEFERRED`; same. |
| D-V5-006 | Generalized Power BI visual generation | `DEFERRED` until one differentiated `.pbiviz` proof and Deneb comparison. |
| D-V5-007 | D3 -> Power BI adapter system | `DEFERRED`. |
| D-V5-008 | Canvas/WebGL engine | `DEFERRED` until D3FC/ECharts/Pixi measurements fail requirements. |
| D-V5-009 | Scroll-driven storytelling system | `DEFERRED` until StorySpec host responsibility is stable. |
| D-V5-010 | Jupyter/Python adapter product | `DEFERRED`; thin host only after JS package contract proof. |

---

# 16. Explicitly rejected/current hard boundaries

- backend/auth/cloud sync for the learning framework;
- production monitoring/observability platform inside DataForge Learn;
- fake in-browser Spark/SQL/Python execution;
- universal code judge;
- universal generic graph engine;
- universal declarative chart grammar competing with Vega;
- point-and-click universal diagram/chart editor;
- arbitrary authored SVG coordinates as the normal AI API;
- consumer apps importing Monaco directly;
- framework hard-coding provider concepts such as Bronze/Silver/Gold into semantic core;
- more repositories for ForgeViz core/renderers/React adapter without independent release-cycle evidence.

---

# 17. Recommended order of work

Unless a concrete defect changes priority:

1. Decide Table Trace promotion explicitly.
2. Build the real external package + portable canonical-content path.
3. Finish single-pin/bootstrap/scaffold closure.
4. Add AI capability registry, concise authoring pack and renderer-selection guide.
5. Solve repeated wide technical Figure mobile legibility.
6. Add synchronized code/rule focus to proven Table Trace rather than new visual families.
7. Complete ForgeViz P0 authorability/all-family/package/playhead/naming/cross-repo proof.
8. Rerun/adopt consumers one by one with real source material and their own release gates.
9. Improve consumer product/pedagogy: CloudArchi motion/spec/export, Formation solution/media metadata, VisualAlgo helpers, CodeLab visual entry points, Norsk lexical/progress, Portfolio portability.
10. Run only measured P2 specialist experiments.
11. Recompare consumer `FRAMEWORK_GAPS.md` files before defining any next framework generation.

---

# 18. Documentation discipline

Every material pass must:

1. update subsystem-local backlog/report first;
2. record date/model/base/result commits and actual gates in the appropriate pass log;
3. update this master backlog if project status/priority changed;
4. preserve historical audits rather than rewriting history;
5. keep release evidence labels conservative;
6. never invent absent source material;
7. never silently change framework/consumer pins.
