# Datapass / ConceptMotion / ForgeViz — master backlog

**Current as of:** 2026-09-07  
**Coordination scope:** Datapass/Fluent J framework, ConceptMotion, ForgeViz, independent consumer program, release engineering and deferred adapter work.  
**Rule:** this ledger is the project-level source of truth for priorities. Subsystem backlogs remain authoritative for implementation detail.

This backlog intentionally includes **completed/proven work** as well as pending work so a future AI can understand what has already been paid for and should not be rebuilt.

---

## 1. Status vocabulary

| Status | Meaning |
| --- | --- |
| `PROVEN` | Implemented and supported by strong framework/consumer/release evidence. |
| `IMPLEMENTED` | Code exists, but breadth of proof is incomplete. |
| `PROMOTION CANDIDATE` | Proven on experiment branches and ready for an explicit shared-framework adoption decision. |
| `IN PROGRESS` | Active scoped work exists. |
| `P0` | Highest current priority; should precede broad new feature work. |
| `P1` | High-value work after P0 stabilization. |
| `P2` | Useful exploration after product/authoring basics are strong. |
| `DEFERRED` | Deliberately postponed. Not authorization to implement opportunistically. |
| `REJECTED` | Explicitly not part of the current architecture. |

### Promotion rule

A shared framework abstraction should normally require either:

1. repeated concrete evidence from at least two consumers; or
2. one clearly new semantic category that existing contracts cannot represent truthfully.

Consumer-specific CSS, copy, routing and one-off product composition remain local unless repeated evidence says otherwise.

---

# 2. Completed / proven foundation

These items are here to prevent accidental reimplementation.

| ID | Capability / decision | Status | Evidence / note |
| --- | --- | --- | --- |
| DONE-001 | Datapass package separation | `PROVEN` | UI/content/learning/code/progress/import/knowledge/scaffold/Figure boundaries survived V1–V4. |
| DONE-002 | ConceptMotion core/SVG/React separation | `PROVEN` | Framework-neutral semantic core + SVG renderer + thin React host. |
| DONE-003 | Stable semantic entity IDs | `PROVEN` | Algorithms, tables, joins, workflows and Table Trace rely on stable identity rather than DOM selectors. |
| DONE-004 | Deterministic Figure/player model | `PROVEN` | Shared playback, reduced motion, state transitions and static export across consumers. |
| DONE-005 | WorkflowSpec vs DiagramSpec responsibility split | `PROVEN` | Cloud Architecture validated behavior vs topology without another graph engine. |
| DONE-006 | No fake runtime/execution policy | `PROVEN` | Code Lab, workflows and learning content remain explanatory/editorial rather than pretending to execute Spark/SQL/Python. |
| DONE-007 | Lazy Monaco/shared code workbench | `PROVEN` | Monaco kept out of generic pages; code consumers share editor infrastructure. |
| DONE-008 | 323-item / 500-variant deterministic practice corpus | `PROVEN` | Repeated framework release gates validate deterministic corpus. |
| DONE-009 | Consumer/developer metadata separation | `PROVEN` | V4 disclosure/details patterns keep internal IDs/schema/importer metadata out of normal product copy. |
| DONE-010 | Compact/regular/expanded Figure presentation | `PROVEN` | V4 consumer/product hardening. |
| DONE-011 | External consumer release-gate pattern | `PROVEN` | Exact pin, frozen lock, typecheck, build, desktop/390px, keyboard/Axe/overflow. |
| DONE-012 | Independent Cloud Architecture consumer validation | `PROVEN` | Main validation merge `3325cd099...` against framework `30e69639...`. |
| DONE-013 | ForgeViz extracted to standalone repository | `PROVEN` | `julian-passebecq/fluent_forgeviz`, exact V1.2 source parity, standalone build/test/package smoke. |
| DONE-014 | ForgeViz local backlog / feature matrix / pass log | `PROVEN` | `BACKLOG.md`, `FEATURE_MATRIX.md`, `PASS_LOG.md`. |
| DONE-015 | Table Trace semantic relation grammar | `PROVEN` experimentally | `use/map/drop/create/derive/group`; five-operation Studio proof plus consumer evidence. |
| DONE-016 | Table Trace native-browser choreography | `PROVEN` experimentally | map travel, derive/group convergence, drop/create/use motion, reduced-motion and export rules. |
| DONE-017 | Formation Table Trace consumer proof | `PROVEN` experimentally | 9 real lesson traces; green Actions run `34064646300`; no consumer renderer code. |
| DONE-018 | Visual Algorithms Table Trace consumer proof | `PROVEN` experimentally | 6 additional traces; green run `34066982354`; no consumer renderer code. |
| DONE-019 | Cross-consumer Table Trace promotion candidate | `PROMOTION CANDIDATE` | Draft PR #3, candidate `6652930f...`, full promotion CI green. |
| DONE-020 | Project-wide audit/backlog/landscape consolidation | `IN PROGRESS` | This documentation branch. |

---

# 3. P0 — framework consolidation and AI authorability

These should happen before broad visual-family expansion.

| ID | Owner | Work | Status | Acceptance / evidence required |
| --- | --- | --- | --- | --- |
| DP-P0-001 | ConceptMotion/framework | **Explicit Table Trace promotion decision** | `P0` | Review draft PR #3; if promoted, merge deliberately with release/version note. Do not silently repin consumers. |
| DP-P0-002 | ConceptMotion/framework | Canonical renderer-selection guide | `P0` | AI-facing decision table covering `table.trace`, `table.transform`, `table.join`, collection/loop, workflow and diagram. Include negative cases such as moving `ROWS BETWEEN`. |
| DP-P0-003 | Datapass release | Built/versioned external-consumer package path | `P0` | Reduce current sparse-source bootstrap complexity; exact package provenance; independent consumer frozen install; no source-monorepo reconstruction requirement. |
| DP-P0-004 | Datapass release | Single framework pin source of truth | `P0` | Generated/check scripts read the pin manifest rather than duplicate SHAs. Already proven on promotion candidate; make canonical. |
| DP-P0-005 | Datapass release | Bootstrap closure/scaffold hardening | `P0` | Scaffold emits pnpm build-script policy, config closure, portable paths and required package/content closure automatically. |
| DP-P0-006 | Datapass/ConceptMotion | **Agent capability registry** | `P0` | Machine-readable mapping: intent -> package/family -> canonical example -> validator -> supported semantics -> known exclusions. |
| DP-P0-007 | Datapass/ConceptMotion | Concise AI authoring pack | `P0` | `AGENTS.md`/quickstart + canonical JSON examples + invalid examples + targeted commands. Future AI should not need historical architecture docs for normal work. |
| DP-P0-008 | ConceptMotion | Synchronized code/rule focus for Table Trace | `P0` | WHERE/GROUP BY/PARTITION BY/routing rule can drive semantic code focus while visual relations animate. No new renderer family. |
| DP-P0-009 | ConceptMotion | Serialized JSON validation hardening | `P0` | Unknown view/relation/reference values rejected structurally at runtime. Promotion candidate already includes first hardening; retain in canonical surface. |
| DP-P0-010 | ConceptMotion/SVG | Additive renderer registration | `P0` | New bounded renderer families avoid central-file merge pressure where practical. Promotion candidate contains initial registrar API. |
| DP-P0-011 | QA | Shared consumer accessibility audit helper | `P0` | Narrow documented Fluent/Tabster sentinel handling; all application/render marks remain blocking; desktop/phone overflow checks reusable. |
| DP-P0-012 | Documentation | Current-doc reading order | `P0` | `PROJECT_DOCS_INDEX.md` clearly distinguishes current coordination docs from historical V1/V2/V3/V4 reports. |

---

# 4. P0 — ForgeViz stabilization

Detailed acceptance criteria remain authoritative in `julian-passebecq/fluent_forgeviz/BACKLOG.md`. This project backlog only coordinates priorities.

| ForgeViz ID | Work | Project priority | Note |
| --- | --- | --- | --- |
| FV-P0-002 | Agent/AI authoring guide | `P0` | Highest-value ForgeViz next step. |
| FV-P0-003 | Canonical fixture per family | `P0` | Needed for AI discovery/tests. |
| FV-P0-004 | Family-level schema tests | `P0` | All 15 families positive + invalid cases. |
| FV-P0-005 | Family-level render smoke | `P0` | All 15 render/destroy deterministically in standalone repo. |
| FV-P0-006 | Public API/package consumer contract | `P0` | Pack/install/load like a real external consumer. |
| FV-P0-008 | Player/playhead API hardening | `P0` | Explicit play/pause/reset/seek/autoplay/reduced-motion ownership. |
| FV-P0-007 | Stable JSON presentation options | `P0 after player` | Controlled theming/motion/density; avoid arbitrary CSS/SVG coordinates. |
| FV-P0-009 | Versioning/compatibility policy | `P0` | Define additive/breaking StorySpec changes and publication criteria. |
| FV-P1-009 | Cross-repository consumer proof | `P0 before public publish` | Rewire one independent consumer only after package parity and release gate. |

**Do not broaden ForgeViz renderer scope while these remain materially incomplete.**

---

# 5. P1 — consumer/product improvements

## 5.1 Cloud Architecture

These are product/visual improvements informed by real usage. They do **not** authorize a new graph engine.

| ID | Work | Owner | Acceptance |
| --- | --- | --- | --- |
| CA-P1-001 | Autoplay policy | FigurePlayer/consumer | Animation can start automatically where pedagogically useful; page-level and local pause exist; reduced motion remains respected. |
| CA-P1-002 | Ambient data-flow motion | ConceptMotion/Diagram renderer | Continuous particles/dashes derived from semantic edge paths for batch/stream/CDC/control/lineage/error/retry roles. No authored coordinates. |
| CA-P1-003 | Global playback preference | Datapass/consumer | One page preference can pause/disable visual motion without replacing per-Figure controls. |
| CA-P1-004 | Spec/text inspector below visuals | Consumer/shared developer surface | Human/AI can inspect/copy the canonical JSON/text for each architecture Figure. Internal metadata stays in details surface. |
| CA-P1-005 | Export UX | Figure/shared host | SVG remains canonical; add user-facing PNG adapter only if reliable without semantic-core coupling. |
| CA-P1-006 | Semantic architecture color roles | Diagram theme | Bronze/Silver/Gold and similar roles should be presentation tokens, not hard-coded provider semantics in the engine. |
| CA-P1-007 | JSON lab | Consumer/Visual Sandbox | Last-page editable examples for architecture/workflow specs; no point-and-click graph editor required. |
| CA-P1-008 | Motion differentiation | Diagram/Workflow | Data flow, control flow, retry, error and state transition should not all look identical. |

## 5.2 Formation

| ID | Work | Status / acceptance |
| --- | --- |
| FORM-P1-001 | Reproducible course corpus acquisition | Needed before clean hosted full-course release gate; preserve original supplied corpus, do not invent missing lessons. |
| FORM-P1-002 | Table Trace adoption decision | Only after framework promotion; preserve canonical V4 Figures as useful alternate lens where appropriate. |
| FORM-P1-003 | Code/rule synchronization | Reuse shared Table Trace code focus once canonical. |
| FORM-P1-004 | Notebook media/source mapping | Keep safe, deterministic, non-executing import path. |
| FORM-P1-005 | Sectioned lesson composition | Promote only if repeated consumer need justifies shared API; otherwise keep local. |

## 5.3 Visual Algorithms

| ID | Work | Status / acceptance |
| --- | --- |
| VA-P1-001 | Table Trace adoption for six proven alternates | Only after framework promotion; canonical Figure remains default where semantically stronger. |
| VA-P1-002 | Better algorithm choreography | Use shared compare/swap/pointer/operation cues before new renderer families. |
| VA-P1-003 | Code highlighting | Synchronize active code line/rule with semantic motion. |
| VA-P1-004 | Git-state teaching proof | Test existing Diagram/scene semantics first; create `graph.state` only if Git pointer/working-tree state cannot fit cleanly. |
| VA-P1-005 | Cheat-sheet/static mode | Same semantic specs should remain useful without animation. |

## 5.4 Code Lab

| ID | Work | Acceptance |
| --- | --- |
| CODE-P1-001 | External-consumer hardening rerun | Frozen install/typecheck/build/desktop/390px/accessibility; no fake execution. |
| CODE-P1-002 | Review/mastery polish | Reuse shared progress; keep Code/Solution/Compare/hints/notes deterministic. |
| CODE-P1-003 | Visual mapping truthfulness | Visual tab only when a real canonical Figure mapping exists. |
| CODE-P1-004 | Large-corpus authoring/diagnostic tooling | Make 323/500 corpus easier for AI to extend without breaking deterministic IDs. |

## 5.5 Norsk

| ID | Work | Acceptance |
| --- | --- |
| NO-P1-001 | External consumer release rerun | Frozen production gate. |
| NO-P1-002 | Entity-neutral learning state | Candidate shared progress capability only if reuse beyond vocabulary is proven. |
| NO-P1-003 | Lexical translation mapping | Bokmål + EN + FR content without confusing lexical translation with UI locale. |
| NO-P1-004 | Keep compact scope | No invented audio/pronunciation/runtime. |

## 5.6 Portfolio

| ID | Work | Acceptance |
| --- | --- |
| PF-P1-001 | Separate preview deployment | Never overwrite `datapassj.com` without explicit authorization. |
| PF-P1-002 | ProjectRegistry -> Galaxy helper | Promote only as pure deterministic mapping if repeated. |
| PF-P1-003 | Responsive/static release proof | Desktop + 390px + keyboard/Axe/no overflow. |

---

# 6. P1 — ForgeViz differentiated features

These are the features that make ForgeViz worth owning rather than replacing it with ordinary chart libraries.

| ID | Feature | Priority | Acceptance principle |
| --- | --- | --- | --- |
| FV-P1-001 | Event-annotated time-series | `P1` | Reusable across finance, BI KPI changes, pipeline incidents, releases and learning telemetry. Semantic events, not finance-only hard-coding. |
| FV-P1-002 | Richer deterministic story choreography | `P1` | Reusable scene/focus/camera/annotation timing primitives; no generic video editor. |
| FV-P1-003 | Spec inspector / diagnostics | `P1` | AI-friendly normalized spec + structured validation errors. |
| FV-P1-004 | JSON authoring playground | `P1` | Source is canonical; edit/validate/render/inspect; not point-and-click state. |
| FV-P1-005 | Export contract | `P1` | SVG first, PNG through adapter/host. |
| FV-P1-006 | Accessibility breadth | `P1` | Meaningful summaries/fallbacks for all families. |
| FV-P1-007 | Visual regression harness | `P1` | Representative desktop/narrow deterministic references. |
| FV-P1-008 | React adapter integration proof | `P1` | Packed package in clean React host with lifecycle/timer cleanup. |

---

# 7. P1 — DataForge Learn / Data Execution Atlas

This is a **learning consumer only**, not a monitoring/observability product.

| ID | Capability | Owner | Notes |
| --- | --- | --- | --- |
| DF-P1-001 | Logical -> physical execution lesson model | Consumer + ConceptMotion | SQL/pandas/Polars/PySpark operation -> physical operators. |
| DF-P1-002 | Partitions/shuffle/skew/spill/cache visuals | ConceptMotion | Reuse Table Trace/collection/workflow semantics before new family. |
| DF-P1-003 | Before/after performance evidence | ForgeViz | Histograms/time-series/distributions for teaching, not live telemetry. |
| DF-P1-004 | Provider lenses | Consumer | Spark/Databricks/BigQuery/Fabric/Snowflake/DuckDB, conceptual and source-grounded. |
| DF-P1-005 | Event annotations | ForgeViz | Show deployment/schema/repartition/cache events on metrics as educational fixtures. |
| DF-P1-006 | ExecutionPlanSpec decision | DEFER until consumer evidence | Add only if WorkflowSpec/DiagramSpec cannot represent operators without semantic distortion. |
| DF-P1-007 | No connectors/credentials | Hard boundary | No production monitoring, alerts, warehouse credentials or billing/telemetry backend. |

---

# 8. P2 — measured technical exploration

These are useful only after P0/P1 stabilization.

| ID | Work | Decision gate |
| --- | --- | --- |
| EXP-P2-001 | D3FC SVG/Canvas/WebGL benchmark | Compare selected ForgeViz families under measured dense-data fixtures before writing our own alternate renderer. |
| EXP-P2-002 | ECharts commodity/high-volume route | Use for ordinary dashboards/high-volume charts when it is clearly cheaper than ForgeViz; do not wrap merely for ownership. |
| EXP-P2-003 | deck.gl geo proof | One serious temporal path/map story using StorySpec adapter; do not build custom map engine. |
| EXP-P2-004 | Motion host/story experiment | Use only for page/story choreography where native WAAPI/D3 is insufficient; semantic state remains ours. |
| EXP-P2-005 | Power BI `.pbiviz` proof | Thin Power BI host around framework-neutral ForgeViz engine; compare against Deneb before claiming differentiated value. |
| EXP-P2-006 | Jupyter anywidget adapter proof | Optional thin host around JS engine; no Python rewrite. |
| EXP-P2-007 | AI-vs-raw-stack benchmark | Compare AI implementation effort/quality for SQL join, retry/backfill, editorial ranking and ordinary dashboard using our stack vs normal libraries. |

---

# 9. Deferred V5 / future work

Tracked so ideas are not lost, but **do not start during current V4 stabilization unless explicitly re-authorized**.

| ID | Item | Reason deferred |
| --- | --- | --- |
| V5-D-001 | `@datapass/charts` | Commodity chart problem is already well served; ForgeViz exists as specialized analytical layer. Revisit after consumer evidence. |
| V5-D-002 | GeoStory / Visual Factory | Needs serious geo consumer + backend routing decision first. |
| V5-D-003 | Earthquake temporal story family | Valuable flagship, but derive from generic time/map/story primitives. |
| V5-D-004 | Paris/city flood story family | Same. |
| V5-D-005 | Actor/movie movement map story | Same. |
| V5-D-006 | Power BI D3 adapter/general generator | Start only after one narrow `.pbiviz` proof and Deneb comparison. |
| V5-D-007 | Canvas renderer | Only after benchmarked SVG limits. |
| V5-D-008 | WebGL renderer | Only after benchmark and D3FC/ECharts/deck.gl evaluation. |
| V5-D-009 | Scroll-driven storytelling system | Need host/engine ownership proof first. |
| V5-D-010 | Jupyter/Python productization | Low priority; adapter proof only. |
| V5-D-011 | Universal visual grammar | Vega/Vega-Lite already own generic chart grammar. Our grammars remain bounded to semantic teaching/story problems. |
| V5-D-012 | Generic monitoring/observability product | Outside learning-platform thesis; would introduce connectors/auth/alerts/backend/security. |
| V5-D-013 | Universal code judge/runtime | Outside current scope; costly and easy to misrepresent. |
| V5-D-014 | Point-and-click universal visual editor | JSON/source-first authoring is the project direction. |

---

# 10. Explicitly rejected architectural moves

- Rebuild the entire platform in vanilla JS.
- Let D3 own the whole React application DOM.
- Merge ConceptMotion and ForgeViz into one universal renderer.
- Build another generic graph engine inside ConceptMotion.
- Add React Flow to core merely because it is good for editors.
- Use Canvas/WebGL as a prestige feature rather than a measured requirement.
- Make every consumer dependency a new repository.
- Copy the full framework monorepo into each consumer.
- Modify vendored framework source inside consumers to make them pass.
- Treat visual animation as mandatory for trivial syntax.
- Treat product-specific Bronze/Silver/Gold/provider conventions as universal engine semantics.

---

# 11. Recommended execution order

### Now

1. Table Trace promotion decision.
2. Canonical current-doc index and AI capability discovery.
3. External packaging/bootstrap reduction.
4. ForgeViz P0 fixtures/tests/authoring guide.
5. ConceptMotion code/rule synchronization.

### Then

6. Cloud Architecture product-level motion/spec/export pass.
7. Complete external Code Lab/Norsk/Portfolio hardening evidence.
8. DataForge Learn vertical slice as the first deliberate ConceptMotion + ForgeViz cross-engine consumer.
9. ForgeViz event-annotated time series and story/playhead hardening.

### Only after evidence

10. D3FC/ECharts high-volume benchmark.
11. deck.gl geo proof.
12. Power BI `.pbiviz` proof against Deneb baseline.
13. Optional anywidget/Jupyter adapter.

---

# 12. Maintenance rule

When a pass changes project status:

1. update this file only for project-level priority/status changes;
2. update the subsystem backlog/report where implementation lives;
3. append the major pass to `PROJECT_PASS_LOG.md` if it materially changes architecture, evidence or release status;
4. preserve old audit files as historical evidence rather than rewriting history;
5. record exact commit/run evidence for anything marked `PROVEN` or `PROMOTION CANDIDATE`.
