# Datapass / ConceptMotion / ForgeViz — completeness re-audit

**Re-audit date:** 2026-09-07  
**Model:** GPT-5.6 Sol  
**Branch:** `docs/project-audit-master-backlog-2026-09-07`  
**Framework main reference:** `30e69639bfc3929c348fd8f9c6c38a2cb61984d8`  
**Purpose:** verify that the current coordination documents cover the material work, evidence, gaps, desired additions, deferrals and hard boundaries of the entire project.

This is a second-pass completeness audit. It does not replace subsystem QA reports or historical V1/V2/V3/V4 audits. Its job is to make omissions visible and ensure every material known item maps to one of: **done/proven, promotion candidate, P0, P1, P2, deferred, rejected, or source-blocked**.

---

## 1. Sources inspected

The re-audit reconciled the current project coordination documents against:

- framework V1–V4 audit/test/factorisation/visual/DX/migration reports;
- current draft Table Trace promotion PR #3 and its cross-consumer promotion recommendation;
- all six independent consumer repositories and, where present, `CONSUMER_REUSE_REPORT.md`, `FRAMEWORK_GAPS.md`, `VISUAL_REUSE_REPORT.md`, `QA_REPORT.md`;
- the VizForge website consumer `julian-passebecq/Fluent2_J_Viz`;
- the standalone engine `julian-passebecq/fluent_forgeviz`, especially `BACKLOG.md`, `FEATURE_MATRIX.md`, and `PASS_LOG.md`;
- current external technology research used by `TECH_LANDSCAPE_AUDIT_2026.md`;
- user-directed product requirements from the consumer-validation phase: AI-first JSON authoring, truthful execution boundaries, information-bearing motion, export, responsive technical diagrams, cloud data-flow behavior and deferred geo/Power BI work.

### Repositories explicitly reconciled

| Area | Repository / source |
| --- | --- |
| Framework | `julian-passebecq/react_ms_fluent_2_framework` |
| Formation | `julian-passebecq/Fluent2_J_Formation` |
| Code Lab | `julian-passebecq/Fluent2_J_CodeLab` |
| Visual Algorithms | `julian-passebecq/Fluent2_J_VisualAlgo` |
| Cloud Architecture | `julian-passebecq/Fluent2_J_CloudArchi` |
| Norsk | `julian-passebecq/Fluent2_J_Norsk` |
| Portfolio | `julian-passebecq/Fluent2_J_Portfolio` |
| VizForge consumer | `julian-passebecq/Fluent2_J_Viz` |
| ForgeViz engine | `julian-passebecq/fluent_forgeviz` |

---

## 2. Evidence vocabulary

Do not use `implemented` and `release verified` as synonyms.

| Status | Meaning |
| --- | --- |
| `RELEASE-VERIFIED` | Exact source/pin passed the appropriate frozen production gate including browser QA where required. |
| `EXPERIMENT-VERIFIED` | Isolated experiment branch passed its declared gate and has evidence, but is not canonical main. |
| `SOURCE/AUDIT-VERIFIED` | Source/corpus/structure was audited deterministically; a complete hosted release gate may not have run. |
| `IMPLEMENTED-NOT-RELEASE-VERIFIED` | Product/code exists, but the final independent release gate is incomplete or environment-blocked. |
| `PROMOTION CANDIDATE` | Shared capability has sufficient evidence for an explicit adoption decision but is not canonical main. |
| `SOURCE-BLOCKED` | Required source material is absent; do not invent a replacement. |
| `DEFERRED` | Deliberately postponed pending evidence or a later project phase. |
| `REJECTED` | Explicitly outside the intended architecture. |

---

## 3. Consumer release-status matrix

This matrix is intentionally conservative.

| Consumer / subsystem | Current evidence status | What is actually proven | What is not claimed |
| --- | --- | --- | --- |
| Framework `main@30e69639...` | `RELEASE-VERIFIED` baseline | Post-hardening framework and canonical V4 surfaces have full framework CI history | Table Trace is not on main |
| Table Trace promotion candidate `6652930f...` | `PROMOTION CANDIDATE` + `RELEASE-VERIFIED` candidate | Full framework CI `34095496628`, desktop/phone browser matrix and independent external-consumer proofs | Not merged; consumers not repinned |
| Cloud Architecture `main@3325cd099...` | `RELEASE-VERIFIED` | Exact external-consumer release against framework `30e69639...`; WorkflowSpec/DiagramSpec reuse and bootstrap friction | No real provider execution/runtime |
| Formation `main` | `SOURCE/AUDIT-VERIFIED` / implemented | 51 notebooks, 2,607 cells, 72 applied solutions, source/corpus audit, real course composition | Clean hosted full-course release remains dependent on reproducible source/corpus materialization |
| Formation Table Trace experiment `d75975c...` | `EXPERIMENT-VERIFIED` | Nine source-scoped SQL traces and real browser consumer seam, Actions `34064646300` | CI fixture is synthetic integration material; it is not a replacement for a full real-course release gate |
| Code Lab `main` | `SOURCE/AUDIT-VERIFIED` / implemented | Deterministic 323/500 corpus integration, shared code/progress/editor architecture | Original full external release gate was environment/network-blocked; no fake judge/runtime |
| Visual Algorithms `main` | implemented/source-verified | Canonical explanations and semantic renderer reuse | Do not infer Table Trace adoption from main |
| Visual Algorithms Table Trace experiment `711ddd2...` | `EXPERIMENT-VERIFIED` | Six distributed-data/ranking traces, full hosted consumer release, Actions `34066982354` | Experiment pin is not canonical main |
| Norsk `main` | `SOURCE/AUDIT-VERIFIED` / implemented | 215 entries, five themes, local learning states, trilingual data model | Full canonical external release gate still requires reproducible environment; no audio/pronunciation claim |
| Portfolio `main` | implemented/source-verified | Separate preview consumer/scaffold/registry proof | No production `datapassj.com` replacement or deployment claim |
| VizForge consumer `main@7aaa8fa...` | `RELEASE-VERIFIED` | Full hosted V1.2 release run `34033499554`, 15 families, 22 canonical examples and real-data flagships | Still embeds engine copy; standalone package is not yet wired in |
| Standalone ForgeViz `main` | `RELEASE-VERIFIED` package checkpoint | Exact V1.2 extraction, framework-neutral package, standalone CI/build/pack smoke | Only ranking has direct family-level standalone runtime smoke; cross-repo consumer proof pending |

---

## 4. Omissions found in the first master pass

The first project-level consolidation was strategically correct but did not promote every material consumer finding into the master backlog. These are now explicitly tracked.

### 4.1 Portable canonical content exports — project-level gap

Several external consumers need canonical data that currently lives as monorepo/source closure rather than a stable package/subpath:

- canonical Figure/explanation registry;
- deterministic 323-item / 500-variant practice content;
- public `ProjectRegistry`;
- related canonical content used by consumers.

**Decision:** this is P0 distribution work. Expose stable lightweight/full entry points without forcing consumers to reconstruct monorepo source paths.

### 4.2 Repeated wide-Figure mobile legibility gap

Portfolio and the VizForge consumer independently exposed the same class of problem: a renderer with a wide minimum logical viewport can technically avoid page overflow while still shrinking semantic labels to illegibility on a phone.

**Decision:** add a shared presentation strategy for wide technical Figures: preserve semantic font legibility, prefer internal pan/contain/compact alternatives, and never treat “no page overflow” as sufficient visual QA.

### 4.3 Formation notebook/solution metadata gaps

Track explicitly:

- first-class sectioned/lazy notebook composition where it proves reusable;
- `SolutionReference` / gated source-cell relationships;
- source-cell editorial classification such as learner-hidden/source-note/solution without mutating source notebooks;
- deterministic `exerciseId -> solution source` metadata for the 72 applied solution files;
- safe Node/build-time local-media discovery helper while notebook importer stays pure;
- safe source image/media rendering without arbitrary HTML.

### 4.4 Formation source limitation

The supplied Formation material references **19 QueryBook images that are absent from the handoff**.

Status: `SOURCE-BLOCKED`.

Do not fabricate, redraw or silently substitute those images as if they were source material. An additive media acquisition path may be implemented if the missing source is later supplied.

### 4.5 Code Lab visual entry-point distinction

External consumers benefit from two separate capabilities:

1. cheap metadata: “does this practice item have a real Figure?”;
2. full Figure resolution only when the visual is actually opened.

Also track mapped-only Visualize-tab behavior so an empty visual tab is not presented as a capability.

### 4.6 Norsk generic gaps

Track separately from UI locale:

- arbitrary BCP-47 lexical translation map;
- entity-neutral New/Learning/Review/Mastered progress primitive only if reuse is proven beyond vocabulary;
- source-less `KnowledgeEntry` taxonomy guidance;
- optional content-validator CLI only if multiple external consumers repeat the need.

Dense trilingual row layout remains consumer-specific unless repeated. Audio/pronunciation remains explicitly absent.

### 4.7 Portfolio portability gaps

Track:

- portable public `ProjectRegistry` export;
- pure ProjectRegistry -> Galaxy mapping helper if repeated;
- external-repository `portfolio-hub` scaffold mode;
- optional Galaxy recipe discoverability;
- the repeated wide-Figure mobile presentation issue above.

Career/timeline/product-specific composition remains local.

### 4.8 Visual Algorithms authoring gaps

Track:

- optional recursion/stack orientation presentation hint rather than a new renderer;
- small pure ExplanationTrack authoring helpers/validation to reduce repetitive fixture boilerplate;
- Git/system-state consumer proof before introducing any new `graph.state` family;
- database/system internals lessons should first reuse Diagram/Workflow/Table Trace/collection semantics.

### 4.9 Cloud Architecture user-level product backlog

The framework gap report correctly avoided inventing APIs, but the product backlog must still preserve desired improvements:

- pedagogical autoplay where useful;
- local and page/global pause/reduced-motion preference;
- ambient semantic data-flow motion;
- distinct batch/stream/CDC/control/error/retry motion roles;
- editable canonical JSON/text under visuals;
- SVG/PNG export UX;
- semantic bronze/silver/gold presentation tokens;
- final-page JSON visual lab;
- official provider logo/icon strategy with licensing/source/fallback rules.

No point-and-click graph editor is required.

### 4.10 ForgeViz public maturity gaps

In addition to its local P0 backlog, project coordination now explicitly tracks:

- public name/namespace/confusion audit before publishing or branding because an unrelated `vizforge.ai` service exists;
- player/playhead/autoplay cadence contract and host ownership;
- export contract;
- all-family schema/render/a11y/visual QA;
- cross-repository rewire before deleting the embedded V1.2 engine;
- event-annotated time series and richer deterministic story choreography;
- JSON authoring playground;
- existing wide-scene phone behavior shared with the responsive Figure backlog.

Existing V1.2 already includes map/event-map capability and real-data geo examples; future GeoStory work is an expansion, not the first presence of geography.

---

## 5. Historical gaps that are already resolved or superseded

Do not implement these twice.

| Historical finding | Current disposition |
| --- | --- |
| Moving SQL `ROWS BETWEEN` frame | **Resolved** in post-hardening shared table/window semantics; Table Trace should not replace it |
| DFS vertical worklist / stack presentation | **Resolved for DFS** by `collection.flow`; arbitrary recursion activation records still deferred |
| Table cell identity | Existing ConceptMotion snapshots already had cell identity; Table Trace adds richer authored relations rather than inventing cell identity from zero |
| Table Trace external Axe helper | Included in promotion candidate; becomes canonical only if PR #3 is promoted |
| Single pin source / additive renderer registration | Included in promotion candidate; pending explicit promotion |
| Need for a new Cloud Architecture graph engine | **Rejected by consumer evidence**; WorkflowSpec + DiagramSpec remain correct |
| Need for direct Monaco imports in consumers | **Rejected**; use shared code package |

---

## 6. Technical visual style and motion principles

The project needs one explicit visual-quality principle so future AIs do not infer the wrong style from individual screenshots.

### Preferred technical educational style

- white or near-white background;
- restrained neutral dark outlines;
- small semantic accent palette;
- labels close to the object they explain;
- generous whitespace;
- monospace for code/IDs where useful;
- no blurry pastel/watercolor aesthetic;
- no decorative gradients/shadows unless they communicate state;
- color encodes meaning such as source/target/active/created/dropped/error/success/group, not decoration.

### Motion rule

Animate only when motion reveals causality, ordering, correspondence or state change.

High-value examples: join lineage, row reorder, aggregation convergence, WAL-before-page-write, shuffle/repartition, retry/data flow, Git pointer/state movement.

Low-value examples: trivial syntax, static definitions, decorative card motion.

Static and reduced-motion modes must remain semantically complete. The same semantic spec should ideally support both static explanation and motion.

---

## 7. Current external-library decisions added by this re-audit

These are strategy/benchmark decisions, not dependencies to add immediately.

| Technology | Decision |
| --- | --- |
| D3plus v4 | Benchmark/adapt scene-graph/backend/a11y ideas before inventing more generic chart rendering infrastructure |
| ELK / elkjs | Benchmark as a layout-only adapter before writing more complex DAG/architecture layout logic |
| Cytoscape.js | Specialist consumer option for rich interactive graph analysis; not ConceptMotion core |
| Sigma.js | Specialist WebGL option only for genuinely large network visualization |
| MapLibre GL JS | Future serious basemap/geo host alongside deck.gl; not a custom core map engine |
| GSAP | Optional choreography specialist only if current WAAPI/Motion/D3 timing becomes insufficient; semantic state remains ours |
| PixiJS | Defer until measured non-geo GPU 2D need; do not add pre-emptively |

---

## 8. Current priority sequence

### P0 — before broad new feature families

1. Explicit Table Trace promotion decision; keep PR #3 separate until chosen.
2. Built/versioned external package path and portable canonical content sub-entrypoints.
3. Single framework pin and bootstrap/scaffold closure simplification.
4. AI capability registry + concise authoring pack + renderer-selection guide.
5. Shared wide-Figure responsive/legibility strategy.
6. Table Trace synchronized code/rule focus rather than more relation verbs.
7. ForgeViz P0: authoring guide, canonical fixtures, all-family schema/render smoke, package contract, playhead/autoplay/versioning, cross-repo proof.
8. ForgeViz public naming/namespace audit before publication.

### P1 — consumer/product quality after P0

- Formation solution/editorial/media/section metadata and full reproducible course gate;
- Visual Algorithms ExplanationTrack helpers, recursion presentation and Git/system-state proof;
- Code Lab lightweight/full visual entry points and mapped-only Visualize UX;
- Norsk lexical translation and entity-neutral progress evidence;
- Portfolio portable registry/scaffold/Galaxy helper and responsive proof;
- Cloud Architecture autoplay/ambient flow/global pause/spec/export/color/logo/JSON-lab improvements;
- ForgeViz event-time-series, richer stories, diagnostics, JSON playground, export and visual regression;
- DataForge Learn vertical slice as a learning consumer only.

### P2 — measured specialist experiments

- D3FC and D3plus backend benchmarks;
- ECharts for commodity/high-volume chart routing;
- ELK layout adapter proof;
- deck.gl + MapLibre serious geo proof;
- Cytoscape/Sigma only for a real graph-scale consumer;
- Power BI `.pbiviz` proof versus Deneb before any generalized generator;
- anywidget/Jupyter thin adapter if a notebook consumer appears;
- GSAP/Pixi only after measured need.

### Deferred / rejected

Remain deferred or rejected without new user authorization/evidence:

- generalized `@datapass/charts` / Visual Factory;
- GeoStory and earthquake/flood/movie reusable narrative-map systems;
- generalized Power BI generation and D3->Power BI adapter system;
- custom Canvas/WebGL engines;
- real Spark/Jupyter/SQL runtime;
- universal judge;
- backend/auth/cloud sync;
- production monitoring/observability platform;
- universal node editor;
- universal declarative chart grammar;
- point-and-click universal visual editor.

---

## 9. Coverage check

| Area | Current coordination coverage |
| --- | --- |
| Framework architecture/history | Audit summary + historical V1–V4 reports |
| Current priorities | `MASTER_BACKLOG.md` |
| Consumer release truth | This re-audit + consumer QA reports |
| Consumer-local gaps | Consumer `FRAMEWORK_GAPS.md`; material repeated items promoted to master backlog |
| ConceptMotion/Table Trace | PR #3 docs + audit summary + backlog |
| ForgeViz implementation detail | ForgeViz `BACKLOG.md`, `FEATURE_MATRIX.md`, `PASS_LOG.md` |
| ForgeViz project priority | Master backlog |
| External tech decisions | `TECH_LANDSCAPE_AUDIT_2026.md` |
| Major model/date/commit history | `PROJECT_PASS_LOG.md` + subsystem logs |
| Deferred/rejected work | Master backlog + this re-audit |
| Source limitations | Consumer QA reports + this re-audit where material |

---

## 10. Maintenance rule from now on

For every material future pass:

1. update the subsystem-local backlog/report first;
2. append the appropriate local/pass ledger with date, model, base/result commits and actual gates;
3. update `MASTER_BACKLOG.md` only if project-level priority/status changed;
4. update this completeness record or create a dated successor when a cross-project re-audit materially changes coverage;
5. keep historical version reports immutable evidence;
6. never upgrade a consumer/framework pin silently;
7. never mark source/audit verification as full release verification;
8. never invent missing source lessons/media/solutions.

---

## 11. Final completeness judgment

After this second pass, every **material known project item** found in the framework reports, six consumer gap/QA reports, VizForge consumer, standalone ForgeViz tracking and the current strategy discussion has a documented disposition: done/proven, promotion candidate, P0, P1, P2, deferred, rejected, or source-blocked.

No new evidence justifies an architectural restart. The important work is now operational and authoring-oriented: package/content portability, AI discovery, responsive technical Figures, consumer release reproducibility, code/visual synchronization and ForgeViz maturity. New renderer/engine families should continue to require measured or multi-consumer evidence.
