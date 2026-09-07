# Datapass / Fluent J / ConceptMotion / ForgeViz — project audit summary

**Audit date:** 2026-09-07  
**Maintainer/lead pass model:** GPT-5.6 Sol  
**Documentation branch:** `docs/project-audit-master-backlog-2026-09-07`  
**Framework `main` at branch creation:** `30e69639bfc3929c348fd8f9c6c38a2cb61984d8`  
**Current Table Trace promotion candidate:** `6652930fa6ea036aec8cc87cbfe4a2d85ea83230` on draft PR #3  
**Purpose:** one current project-level summary across framework history, independent consumers, ConceptMotion, ForgeViz, QA evidence and the future roadmap.

This document does **not** replace historical V1/V2/V3/V4 reports, consumer QA reports, or ForgeViz's own `BACKLOG.md` / `FEATURE_MATRIX.md` / `PASS_LOG.md`. It is the current coordination summary that tells the next lead AI what the accumulated evidence means.

---

## 1. Executive conclusion

The project has produced a **real reusable visual-learning platform**, not merely a collection of demos. Its strongest result is the semantic visualization layer: stable entity identity, deterministic state/playback, Figure composition, educational renderer families, accessible SVG output, reduced-motion behavior and source-aware learning/application scaffolding have survived independent consumer use.

The project is **not yet a frictionless AI SDK**. Cross-repository bootstrap, package distribution, authoring discovery, renderer-selection guidance, and some product/pedagogy details still require too much repository knowledge. ForgeViz is also earlier in its independent-library maturity than ConceptMotion.

The correct conclusion is therefore:

> **The rendering/semantic architecture is proven enough to keep. The AI-productivity economics are promising but not fully proven until the package/discovery/authoring path becomes substantially simpler.**

The project should not restart in vanilla JavaScript and should not collapse React, ConceptMotion and ForgeViz into one engine. The next phase should make the existing boundaries easier to consume and measure rather than inventing more abstraction layers.

### Lead-AI strategic grade

This is an internal judgment, not a scientific benchmark.

| Area | Grade | Current judgment |
| --- | ---: | --- |
| Architecture separation | 8.8/10 | Strong boundaries; distribution still awkward. |
| ConceptMotion semantic visualization | 9.0/10 | Strongest differentiated asset. |
| Consumer reuse evidence | 9.0/10 | Multiple independent apps now reuse shared semantics. |
| ForgeViz engine | 8.0/10 | Real reusable D3 engine, but independent QA breadth remains limited. |
| QA/release engineering | 8.8/10 | Strong gates, accessibility, frozen installs and browser evidence. |
| Strategic differentiation | 8.3/10 | Clear value in technical teaching + deterministic stories. |
| Product/pedagogy finish | 6.5/10 | Good examples; some sites still need stronger teaching choreography and product polish. |
| AI authoring ergonomics | 6.2/10 | JSON/spec direction is right; discovery/fixtures/tooling need work. |
| Scope discipline | 6.0/10 | Improved materially; earlier phases explored too many future systems at once. |
| Cross-repository distribution | 5.0/10 | Biggest remaining architecture/productization weakness. |

Overall R&D judgment: **approximately 7.8/10** — useful and worth continuing, but the next gains come from simplification and packaging rather than architectural expansion.

---

## 2. Current system map

```text
PRODUCT / LEARNING APPLICATIONS
        |
        +-- Datapass / Fluent J
        |     UI shell, content, learning, code, progress,
        |     notebook import, knowledge, scaffold, Figure host
        |
        +-- ConceptMotion
        |     technical semantic visualization
        |     algorithms, tables, joins, workflows, diagrams,
        |     collection/worklist state, Table Trace candidate
        |
        +-- ForgeViz
              analytical/editorial D3 stories
              rankings, time series, maps, flow, scatter,
              tables/matrices, story/player + thin React adapter
```

### Stable ownership principle

- **Datapass / Fluent J** owns application composition and learning-product infrastructure.
- **ConceptMotion** owns technical/educational semantic state and explanatory visualization.
- **ForgeViz** owns analytical/editorial D3 visualization and deterministic StorySpec playback.
- **Consumers** own lesson content, provider-specific copy, product navigation and local product adapters.
- **Mature external libraries** should be used for commodity/specialist capabilities rather than reimplemented opportunistically.

This is intentionally not one mega-framework.

---

## 3. Historical evolution

### Early V1 / pre-Foundation exploration

The original project explored a broad visual platform, but the first approach was too ambitious and insufficiently stable. The useful lesson from that phase was that semantic identity, accessibility, deterministic state and application boundaries needed to be first-class rather than consequences of bespoke visual code.

Historical V1 material remains preserved, but current decisions should not be derived from old scope documents without checking later audits.

### Foundation v1.1 — 2026-09-04

Foundation v1.1 established the first defensible architecture:

- pure `@conceptmotion/core`;
- framework-neutral `@conceptmotion/svg`;
- thin `@conceptmotion/react`;
- Fluent `@datapass/ui`;
- content/knowledge separation;
- semantic table/join/loop/diagram/workflow/lineage renderers;
- stable IDs and deterministic SVG export;
- reduced motion and keyboard selection;
- no fake execution/runtime claims.

The V1.1 audit explicitly records that package publication, broad migration of the legacy visual catalogue, live execution, parser-backed lineage, live source monitoring and Power BI/GeoStory work were still absent.

### V2 — 2026-09-04

V2 expanded reusable learning/content/application contracts and prepared the platform for more consumers rather than simply adding renderers. It continued the policy that schemas and runtime semantics must remain bounded and truthful.

### V3 — 2026-09-04 to 2026-09-05

V3 became the consumer/reuse expansion phase. Major outcomes included:

- stronger reusable consumer packages;
- deterministic 323-item / 500-variant practice corpus;
- reusable scaffold presets;
- broader migrated semantic visuals;
- application surfaces for learning, code, algorithms, architecture and portfolio/registry concepts;
- stricter package/bundle boundaries and QA.

### V4 — 2026-09-05

V4 consolidated product clarity rather than starting another engine generation. The framework added/strengthened:

- consumer-clean copy versus developer/provenance details;
- compact/regular/expanded Figure presentation;
- synchronized explanation semantics;
- semantic tokens and shared disclosure patterns;
- hardened Formation, Sandbox, Interview, Algorithm, Architecture and Pilot surfaces;
- authoring schemas and repository-native DX;
- stricter external consumer guidance and release gates.

V4 deliberately kept backend/auth/cloud sync/execution, universal judge, SQL parser, GeoStory, charts package and Power BI generation outside the release scope.

### Post-V4 consumer validation — 2026-09-05 to 2026-09-07

The architecture was then tested through independent repositories rather than only monorepo apps. This phase exposed the most valuable evidence because bootstrap/package friction became visible.

---

## 4. Consumer program

The external consumer repositories currently include:

| Experiment | Repository | Primary framework question |
| --- | --- | --- |
| Formation | `julian-passebecq/Fluent2_J_Formation` | Can notebook/course material, SQL reasoning and educational Figures compose cleanly? |
| Data Engineering Code Lab | `julian-passebecq/Fluent2_J_CodeLab` | Can a large deterministic practice corpus reuse code/progress/editor infrastructure without a fake judge? |
| Visual Algorithms | `julian-passebecq/Fluent2_J_VisualAlgo` | Can ConceptMotion support reusable algorithm/SQL/distributed-data teaching motion? |
| Cloud Architecture | `julian-passebecq/Fluent2_J_CloudArchi` | Can WorkflowSpec/DiagramSpec teach behavior/topology without another graph engine? |
| Norsk Tech & Work Vocabulary | `julian-passebecq/Fluent2_J_Norsk` | Can lightweight reference/learning UX reuse Datapass without visualization overkill? |
| Portfolio Consumer Lab | `julian-passebecq/Fluent2_J_Portfolio` | Can scaffold/registry/static responsive UI work as a small separate site? |
| VizForge Studio consumer | `julian-passebecq/Fluent2_J_Viz` | Can the D3 engine support a compelling gallery/story application? |

### Strongest independently verified consumer evidence

#### Cloud Architecture

`main` currently contains the audited post-hardening validation merge at `3325cd099b795e13e0df3127d5db662d8003d3cb`, pinned against framework `30e69639...`.

Its consumer report reproduced real external-package friction:

- unpublished workspace-package bootstrap closure;
- pnpm 11 install ordering;
- TypeScript config closure required by sparse checkout;
- Windows path handling in pin verification;
- Fluent/Tabster focus-sentinel behavior.

Importantly, the consumer did **not** require a new graph engine or imperative Figure API.

#### Formation Table Trace evidence

Experiment branch: `experiment/table-trace-consumer-evidence-v1`  
Green implementation checkpoint: `d75975c27f77738cc88a0343822181eb3c91a331`  
Actions run: `34064646300`

Nine real lesson traces used one semantic relation grammar for:

- WHERE;
- ORDER BY;
- GROUP BY + SUM;
- join cardinality;
- INNER JOIN;
- LEFT JOIN;
- FULL OUTER JOIN;
- window ranking;
- QUALIFY.

Consumer renderer implementations: **0**.

#### Visual Algorithms Table Trace evidence

Experiment branch: `experiment/table-trace-consumer-evidence-v1`  
Green implementation checkpoint: `711ddd2e8da94f4ad293af47da7a02e646dbb022`  
Actions run: `34066982354`

Six additional traces reused the same grammar for:

- ranking;
- hash partition routing;
- shuffle;
- skew;
- repartition;
- coalesce.

Consumer renderer implementations: **0**.

### Cross-consumer Table Trace result

Across Formation + Visual Algorithms:

- 15 consumer-authored traces;
- 0 consumer renderer implementations;
- 0 authored geometry/keyframes;
- 2 independent browser release gates;
- same six relation kinds: `use`, `map`, `drop`, `create`, `derive`, `group`.

This is the strongest current proof that the ConceptMotion semantic approach can materially reduce bespoke visualization work.

---

## 5. ConceptMotion audit

### What is genuinely strong

- Stable semantic identities rather than DOM selectors.
- Deterministic state/playback.
- Semantic snapshots and transition planning.
- Framework-neutral SVG runtime.
- Thin React host.
- Accessible semantic structure and deterministic static export.
- Reduced-motion behavior is part of the contract.
- `table.transform`, `table.join`, algorithm/loop, collection/worklist, workflow and diagram concepts already cover multiple domains.
- Table Trace demonstrates that a relation grammar can generalize across SQL and distributed-data lessons.

### What was under-engineered

The core semantics were stronger than the authoring/presentation vocabulary. Repeated gaps included:

- richer cell/column/group correspondence;
- many-to-one aggregation visualization;
- generic transformation marks;
- compact relevance-based table views;
- synchronized code/rule focus;
- richer choreography without authored coordinates;
- consumer-facing discovery of which renderer to use.

Table Trace and Table Trace Motion directly address much of this gap.

### What should **not** be added casually

- concept-specific renderers for every SQL verb;
- another generic graph engine;
- arbitrary pixel-coordinate authoring;
- a runtime pandas/Spark/SQL executor merely to drive visuals;
- free-form drawing/editor infrastructure inside ConceptMotion.

### Table Trace promotion candidate

The composed post-hardening + Table Trace branch is:

`experiment/post-hardening-table-trace-consumer-v1`

Draft PR: **#3**  
Current promotion candidate: `6652930fa6ea036aec8cc87cbfe4a2d85ea83230`

The final full promotion validation run is green end-to-end. PR #3 remains deliberately draft/unmerged while the promotion decision is explicit.

The first full gate identified a genuine accessibility defect in structural SVG ports (`aria-label` on an unroled group). The renderer was fixed, a regression assertion was added, and the repeated full gate then passed.

The promotion candidate also includes:

- additive renderer registration;
- hardened serialized JSON relation/view validation;
- shared external-consumer accessibility policy helpers;
- single-source consumer pin guidance;
- improved `showInspector={false}` selection/tab-stop behavior;
- renderer-selection guidance and negative boundaries.

---

## 6. ForgeViz audit

ForgeViz was extracted from the `Fluent2_J_Viz` consumer into its own repository:

`julian-passebecq/fluent_forgeviz`

Source lineage:

`Fluent2_J_Viz@7aaa8fa601c5fa2c9f8acfd7a4d4eb54b887b9ef`

The standalone engine owns:

- framework-neutral TypeScript core;
- `VisualizationSpec` / `StorySpec` validation;
- deterministic StoryPlayer;
- D3 renderer families;
- DOM rendering;
- optional thin React adapter;
- package build/test/CI.

The consumer website remains separate and is intentionally not rewired until cross-repository package parity is proven.

### Current engine inventory

ForgeViz V1.2 contains 15 visualization types:

- ranking;
- time-series;
- scatter;
- dumbbell;
- contribution;
- flow;
- forecast;
- event-map;
- table;
- matrix;
- bump;
- histogram;
- small-multiples;
- stacked-area;
- choropleth.

The engine is real and independently buildable, but all-family runtime/visual verification remains incomplete. Ranking has direct standalone runtime smoke; the other families are primarily compile-verified in the extracted repo.

### Stable ForgeViz decisions

- D3 owns analytical geometry/scales/layout/transitions, not the entire React application DOM.
- React remains a thin optional adapter.
- Semantic JSON is the AI-facing authoring surface.
- Story playback remains deterministic.
- Consumers own Fluent/Datapass application chrome.
- Canvas/WebGL are not added until measured SVG limits justify them.
- Power BI, GeoStory and Jupyter remain adapter/future work, not reasons to rewrite the engine.

### Biggest ForgeViz maturity gaps

- AI/agent authoring guide;
- canonical per-family fixtures;
- per-family schema tests;
- per-family render smoke;
- public package contract proof;
- stronger player/playhead/autoplay contract;
- presentation/theme options with compatibility policy;
- event-annotated time-series;
- spec inspector/diagnostics;
- JSON authoring playground;
- visual regression and accessibility matrix;
- cross-repository package consumer proof.

The canonical detailed ForgeViz backlog remains in that repository's `BACKLOG.md`.

---

## 7. What was over-engineered versus what was worth it

### Worth the investment

1. **Stable semantic identity.** This is the foundation of reusable movement, focus, selection and code synchronization.
2. **Deterministic semantic state.** It makes testing, export, reduced motion and AI authoring tractable.
3. **Figure abstraction.** Consumers can switch/reuse visual families without owning renderer infrastructure.
4. **WorkflowSpec versus DiagramSpec split.** Behavior and topology remain distinct.
5. **ConceptMotion versus ForgeViz split.** Technical teaching and analytical/editorial visualization are different problems.
6. **Frozen external-consumer gates.** They exposed real bootstrap problems that a monorepo hid.
7. **No fake execution.** The product remains honest and significantly simpler.
8. **JSON/source-first authoring.** This aligns with coding agents and source control better than a point-and-click editor.

### Earlier over-engineering / premature exploration

1. GeoStory architecture before a real geo consumer proved requirements.
2. Canvas/scene-IR/WebGL discussions before measured SVG limits.
3. broad Power BI architecture before one `.pbiviz` proof.
4. universal source monitoring/provider-adapter ideas unrelated to the core learning thesis.
5. too many future visual categories before authoring/distribution became easy.
6. repeated architecture/handoff documents without one current master backlog/decision index.
7. treating every consumer finding as a candidate framework abstraction instead of keeping local adapters local.

### Key lesson

> **A new shared abstraction should require repeated consumer evidence or a clearly new semantic category.**

One-off friction stays local unless it represents a release/distribution bug.

---

## 8. What was under-engineered

The project spent less time than it should have on several boring but high-leverage surfaces:

- published/versioned package boundaries;
- one-source framework pins;
- clean sparse bootstrap closure;
- AI capability discovery;
- canonical minimal fixtures;
- concise authoring diagnostics;
- cross-repository package smoke;
- visual regression breadth;
- renderer-selection guidance;
- product-level autoplay/pause policy;
- consumer reproducibility for source corpora such as Formation notebooks.

These now deserve priority over broad renderer expansion.

---

## 9. Product philosophy after consumer evidence

### The "galaxy of applications" idea remains valid

The platform is useful if a coding AI can be given:

```text
source corpus / topic
+ Datapass application preset
+ semantic visual capabilities
+ examples / validators
```

and produce a polished independent site without modifying framework internals.

The target is **not** to make every app look identical. The target is to make the difficult infrastructure cheap while leaving content/product identity local.

### The AI-facing product is source/spec based

Preferred authoring loop:

```text
JSON / TypeScript content
    -> validation
    -> semantic compilation
    -> live preview
    -> deterministic export / application use
```

Visual editing controls may manipulate this source, but hidden editor state should not become a second truth.

### DataForge Learn

The future DataForge consumer is defined strictly as a **learning tool / Data Execution Atlas**, not an observability platform. It should teach logical operation -> physical execution -> partition/shuffle/spill/cache -> metrics -> diagnosis/improvement using ConceptMotion + ForgeViz together. No production connectors, credentials, alerting or runtime are implied.

---

## 10. Quality/release-engineering audit

The QA strategy has become one of the project's strengths:

- frozen installs;
- exact framework pin checks;
- TypeScript project references;
- content/spec validation;
- deterministic corpus validation;
- package-boundary checks;
- production builds;
- desktop and 390px browser smoke;
- keyboard basics;
- reduced-motion assertions;
- horizontal-overflow checks;
- Axe serious/critical gates;
- deterministic SVG export;
- privacy/public-output audits;
- independent fresh-consumer proofs in the framework gate.

A recurring lesson is that test policy must distinguish framework infrastructure from application failures. Fluent/Tabster focus sentinels are handled through the existing narrow V4 policy; application controls and renderer marks are not excluded.

---

## 11. Current primary risks

1. **Package/distribution friction** can erase much of the AI productivity advantage.
2. **Too many historical documents** can confuse a future AI unless the current index is explicit.
3. **ForgeViz verification breadth** is behind its feature breadth.
4. **Scope creep** toward generic charting, observability, editors or runtimes could recreate the earlier over-engineering problem.
5. **Renderer registration / central union pressure** can make experimental branches conflict; additive registration should continue.
6. **Consumer source reproducibility** is uneven, especially where large private course corpora are not committed.
7. **Power BI/geo ambition** is valuable but should remain evidence-driven and adapter-oriented.

---

## 12. Current decision state

### Framework

- `main`: `30e69639bfc3929c348fd8f9c6c38a2cb61984d8`
- Table Trace promotion PR #3: draft, open, unmerged, mergeable.
- Promotion candidate: `6652930fa6ea036aec8cc87cbfe4a2d85ea83230`
- Full promotion gate: green after the SVG-port accessibility fix.

### ForgeViz

- standalone canonical engine repository exists and is green;
- package remains private intentionally;
- consumer website remains on its embedded verified V1.2 copy until an explicit dependency-rewire pass;
- detailed P0/P1/P2/deferred backlog lives in `fluent_forgeviz/BACKLOG.md`.

### Consumers

- keep consumer `main` pins stable unless an explicit adoption/release pass is authorized;
- Table Trace consumer evidence branches are proofs, not silent production migrations;
- remaining independent consumers should continue to be used as architecture tests rather than automatically requesting new framework APIs.

---

## 13. Recommended near-term sequence

1. Decide/perform the bounded Table Trace promotion from draft PR #3.
2. Preserve renderer-selection negative boundaries in canonical documentation.
3. Improve external package/bootstrap ergonomics and move toward versioned built artifacts.
4. Add AI capability manifest + concise canonical examples.
5. Complete ForgeViz P0 authorability/test breadth before adding broad families.
6. Improve synchronized code/rule focus in ConceptMotion.
7. Product-pass Cloud Architecture playback/ambient-flow/spec/export concerns without creating a new graph engine.
8. Use DataForge Learn as the next cross-engine consumer when the shared packages are stable.
9. Benchmark high-volume rendering before any Canvas/WebGL architecture decision.
10. Only then run narrow Power BI and serious geo adapter proofs.

See `MASTER_BACKLOG.md` for the complete prioritized ledger and `TECH_LANDSCAPE_AUDIT_2026.md` for the current external-library decisions.

---

## 14. Evidence/read-next index

### Current project coordination

- `PROJECT_DOCS_INDEX.md`
- `PROJECT_AUDIT_SUMMARY_2026-09-07.md`
- `MASTER_BACKLOG.md`
- `TECH_LANDSCAPE_AUDIT_2026.md`
- `PROJECT_PASS_LOG.md`

### Framework V4

- `V4_AUDIT_SELF_REVIEW.md`
- `V4_CONSUMER_FINDINGS.md`
- `V4_CONSUMER_HARDENING_REPORT.md`
- `V4_POST_CONSUMER_BACKLOG.md`
- `V4_FACTORISATION_REPORT.md`
- `V4_VISUAL_CAPABILITY_MATRIX.md`
- `V4_TEST_REPORT.md`
- `V4_BUNDLE_REPORT.md`

### Table Trace

On the promotion branch:

- `TABLE_TRACE_CROSS_CONSUMER_PROMOTION_RECOMMENDATION_V1.md`
- Table Trace semantic/motion implementation documentation under the ConceptMotion workspace.

### ForgeViz

Repository: `julian-passebecq/fluent_forgeviz`

- `README.md`
- `BACKLOG.md`
- `FEATURE_MATRIX.md`
- `PASS_LOG.md`

### Independent consumers

Each consumer should retain:

- `CONSUMER_REUSE_REPORT.md`
- `FRAMEWORK_GAPS.md`
- `VISUAL_REUSE_REPORT.md`
- `QA_REPORT.md`

These reports are evidence, not automatically framework requirements.
