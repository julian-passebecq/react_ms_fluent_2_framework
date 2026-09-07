# Datapass / Fluent J / ConceptMotion / ForgeViz — project audit summary

**Audit date:** 2026-09-07  
**Maintainer/lead pass model:** GPT-5.6 Sol  
**Documentation branch:** `docs/project-audit-master-backlog-2026-09-07`  
**Framework `main` reference:** `30e69639bfc3929c348fd8f9c6c38a2cb61984d8`  
**Current Table Trace promotion candidate:** `6652930fa6ea036aec8cc87cbfe4a2d85ea83230` on draft PR #3  
**Completeness companion:** `PROJECT_COMPLETENESS_REAUDIT_2026-09-07.md`

This is the current project-level judgment. Historical V1/V2/V3/V4 reports, consumer QA/gap reports and ForgeViz's own backlog/matrix/log remain the evidence base; they are not rewritten as current decisions.

---

## 1. Executive conclusion

The project has produced a **real reusable visual-learning platform**, not a pile of unrelated demos.

The strongest differentiated asset is ConceptMotion's semantic approach: stable identities, deterministic state, renderer-neutral semantic intent, reduced-motion/static parity, accessible SVG, Figure hosting and consumer reuse. The Table Trace experiment strengthened that conclusion by expressing 15 consumer explanations across SQL and distributed-data concepts with one small relation grammar and zero consumer renderer implementations.

ForgeViz is also real: it has a standalone engine repository, typed package boundary, 15 analytical/editorial families and a verified V1.2 website consumer. It is earlier in independent package maturity than ConceptMotion because family-level runtime/visual coverage and cross-repository package consumption remain incomplete.

The project's biggest weakness is now **distribution and AI authoring ergonomics**, not the rendering core:

- unpublished/source-oriented package consumption is cumbersome;
- canonical data/content is not yet packaged cleanly for independent consumers;
- authoring discovery still requires too much repository knowledge;
- some consumer release states are source-audited rather than full hosted releases;
- wide technical Figures can avoid page overflow while still becoming illegible on phones;
- product/pedagogical choreography is less mature than the semantic foundations.

Therefore:

> **Keep the architecture. Simplify distribution, authoring and product use before adding more engines or broad visualization families.**

Do not restart in vanilla React/D3. Do not merge ConceptMotion and ForgeViz. Do not create more ForgeViz repos. Do not start V5 systems merely because they were previously discussed.

---

## 2. Stable architecture

```text
PRODUCT / LEARNING APPLICATIONS
        |
        +-- Datapass / Fluent J
        |     app shell, content, learning, code, progress,
        |     notebook import, knowledge, scaffold, Figure host
        |
        +-- ConceptMotion
        |     semantic technical/educational state
        |     algorithms, tables, joins, collections,
        |     workflow behavior, diagrams, Table Trace candidate
        |
        +-- ForgeViz
              analytical/editorial D3 stories
              ranking/time/flow/map/scatter/table/matrix/etc.
              deterministic StorySpec + thin host adapters
```

### Ownership

- **Datapass / Fluent J:** application composition and learning/product infrastructure.
- **ConceptMotion:** technical/educational semantic state and explanatory motion.
- **ForgeViz:** analytical/editorial data stories where commodity chart libraries are insufficient.
- **Consumer:** lesson/product/provider-specific content, routing, local composition and CSS.
- **External specialist libraries:** commodity charts, serious geo, generic graph analysis/editing or performance backends when they are economically stronger than bespoke infrastructure.

This is intentionally not one mega-framework.

---

## 3. What V1–V4 achieved

### Foundation v1.1

Established the defensible core boundaries:

- pure semantic core;
- framework-neutral SVG;
- thin React adapter;
- Fluent UI package;
- stable table/join/loop/diagram/workflow/lineage semantics;
- deterministic export;
- keyboard/reduced motion;
- no fake runtime.

### V2

Expanded reusable learning/content/application contracts while preserving no-execution and semantic boundaries.

### V3

Made consumer/reuse validation central:

- broader package/scaffold reuse;
- 323-item / 500-variant deterministic practice corpus;
- semantic visual migrations;
- stronger package/bundle QA;
- applications for learning/code/algorithms/architecture/portfolio concepts.

### V4

Consolidated product clarity rather than introducing another engine generation:

- consumer-clean vs developer/provenance details;
- compact/regular/expanded Figure presentation;
- synchronized explanations;
- semantic tokens/disclosure patterns;
- improved Formation/Sandbox/Interview/Algorithm/Architecture/Pilot surfaces;
- authoring schemas/DX;
- external consumer release discipline.

V4 explicitly kept backend/auth/cloud sync/runtime execution, universal judge, SQL parser, GeoStory, generalized charts and Power BI generation outside the delivered scope.

---

## 4. Consumer release truth

Do not equate “implemented” with “full release verified.” See the completeness report for full detail.

| Consumer / subsystem | Evidence status | Key truth |
| --- | --- | --- |
| Framework `main@30e69639...` | release-verified baseline | Post-hardening shared framework; Table Trace not on main |
| Table Trace candidate `6652930f...` | release-verified promotion candidate | Full framework gate `34095496628`; PR #3 remains draft/unmerged |
| Cloud Architecture `main@3325cd099...` | independent release-verified | Strongest canonical external-consumer release proof |
| Formation `main` | source/audit verified | Real 51-notebook corpus audited; full hosted real-corpus gate still depends on reproducible source materialization |
| Formation Table Trace branch | experiment-verified | Nine source-scoped traces; synthetic CI notebook proves integration only, not full course release |
| Code Lab `main` | source/audit verified / implemented | Deterministic 323/500 integration; original full external gate environment-blocked |
| Visual Algorithms `main` | implemented/source-verified | Canonical semantic visuals; Table Trace remains experiment branch |
| Visual Algorithms Table Trace branch | experiment release-verified | Six additional traces; hosted gate green |
| Norsk `main` | source/audit verified / implemented | 215 entries / five themes; full canonical external gate still needs reproducible environment |
| Portfolio `main` | implemented/source-verified | Separate preview consumer proof; no production deployment claim |
| VizForge consumer `main@7aaa8fa...` | hosted release-verified | V1.2 website release `34033499554`, 15 families, 22 examples + real-data flagships |
| Standalone ForgeViz | package release checkpoint | Extracted package CI green; cross-repository consumer proof still pending |

This status discipline is a required project rule from now on.

---

## 5. ConceptMotion audit

### Strong

- stable semantic identities over DOM selectors;
- deterministic state/playback;
- semantic snapshots and transition planning;
- accessible framework-neutral SVG;
- thin React host;
- reduced-motion/static parity;
- semantic family boundaries for table/join/loop/collection/workflow/diagram;
- consumer evidence that generic semantic relations reduce bespoke code.

### Table Trace result

Table Trace adds positions at table/row/column/cell/group level and relations:

`use · map · drop · create · derive · group`

The same grammar proved filter, sort, aggregation, pivot, joins, ranking, QUALIFY, hash routing, shuffle, skew, repartition and coalesce.

Motion is derived from semantic relations instead of authored geometry:

- use -> pulse;
- map -> travel;
- drop -> exit;
- create -> enter;
- derive/group -> convergence/clustering.

Formation + Visual Algorithms produced **15 consumer traces / 0 consumer renderer implementations / 0 authored coordinates or keyframes**.

That is strong evidence for promotion as a bounded renderer, not as a universal visualization layer.

### Negative boundaries matter

- moving SQL `ROWS BETWEEN` stays with existing window-frame semantics;
- algorithm traversal/sort/search stays with Loop/Collection when that model is stronger;
- retry/backfill stays WorkflowSpec;
- architecture/topology stays DiagramSpec;
- Git/system state must prove current scene/Diagram semantics insufficient before `graph.state` is considered.

### Next ConceptMotion work

Prioritize:

1. explicit Table Trace promotion decision;
2. renderer-selection guide;
3. synchronized code/rule focus;
4. additive registration/runtime JSON hardening already in the candidate;
5. authoring helpers/AI capability registry;
6. responsive wide-Figure legibility.

Do **not** add concept-specific SQL renderers merely because they are easy to imagine.

---

## 6. ForgeViz audit

Standalone repository: `julian-passebecq/fluent_forgeviz`  
V1.2 source lineage: `Fluent2_J_Viz@7aaa8fa601c5fa2c9f8acfd7a4d4eb54b887b9ef`

### Current families

ranking, time-series, scatter, dumbbell, contribution, flow, forecast, event-map, table, matrix, bump, histogram, small-multiples, stacked-area, choropleth.

### Stable decisions

- D3 owns analytical geometry/layout/transitions, not the app shell.
- React stays a thin adapter.
- semantic JSON is the AI authoring surface.
- StorySpec playback stays deterministic.
- consumer Fluent/Datapass UI stays outside ForgeViz.
- Canvas/WebGL require measured need.
- Power BI, serious GeoStory and Jupyter remain future adapters/experiments.

### Current maturity gaps

- AI authoring guide;
- canonical fixtures for all families;
- all-family schema/runtime/accessibility/visual tests;
- public package contract;
- player/playhead/autoplay/cadence ownership;
- presentation/theme compatibility policy;
- event-annotated time series;
- richer deterministic story choreography;
- diagnostics/JSON playground;
- export contract;
- independent React/package consumer proof;
- rewire consumer before deleting duplicate engine code;
- public naming/namespace/confusion audit before publishing because an unrelated `vizforge.ai` service exists.

Existing event-map/geo capability already exists; future GeoStory is an expansion, not the first map support.

---

## 7. Cross-repository friction is the main framework gap

Independent consumers repeatedly exposed issues hidden by the monorepo:

- unpublished/source package closure;
- canonical content/data closure;
- pnpm 11 build-script/install ordering;
- tsconfig/config closure;
- duplicate hard-coded framework SHAs;
- path portability;
- consumer-owned lockfiles;
- release-gate environment reproducibility.

The next major platform gain should be a clean external package/content path, not another renderer engine.

### Canonical content portability is now P0

External consumers should have stable package/subpath access to:

- canonical Figure/explanation registry;
- cheap visual-availability metadata vs full Figure payload;
- 323/500 practice content;
- public ProjectRegistry;
- other canonical consumer-safe content.

Consumers should not need to know the framework monorepo directory topology.

---

## 8. Repeated responsive visual gap

V4 presentation sizing improved general composition, but Portfolio and VizForge independently demonstrate a remaining problem: a wide logical renderer can shrink text until it is technically contained but practically unreadable on 390px.

A shared solution should choose among:

- semantic content-fit;
- internal horizontal pan;
- compact alternate presentation;
- preserved minimum label/font legibility;
- responsive abbreviations where semantically safe.

“No page-level horizontal overflow” is necessary but not sufficient visual QA.

---

## 9. Consumer-specific backlog themes now promoted to project tracking

### Formation

- real-corpus hosted reproducibility;
- sectioned/lazy notebook composition;
- `SolutionReference` / gated source cells;
- editorial source-cell classifications;
- deterministic exercise -> solution provenance;
- safe media discovery/rendering;
- 19 missing QueryBook source images remain source-blocked and must not be invented.

### Code Lab

- portable practice content;
- cheap `has visual` metadata and separate full resolver;
- mapped-only Visualize tab;
- corpus authoring/diagnostic tooling;
- still no fake runtime/judge.

### Visual Algorithms

- ExplanationTrack pure authoring helpers;
- optional recursion/stack orientation hint;
- Git/system-state proof before new family;
- database/system internals lessons should reuse current semantics first.

### Norsk

- arbitrary lexical language map separate from UI locale;
- entity-neutral mastery primitive only with repeated use;
- source-less taxonomy guidance;
- optional validator CLI only if repeated;
- no invented audio/pronunciation.

### Portfolio

- portable ProjectRegistry;
- pure Galaxy helper if repeated;
- cross-repo portfolio scaffold;
- responsive wide-Figure proof;
- never replace `datapassj.com` without explicit instruction.

### Cloud Architecture

- pedagogical autoplay;
- local/global pause;
- semantic ambient data flow;
- distinct batch/stream/CDC/control/error/retry motion;
- canonical JSON/text under visuals;
- SVG/PNG export UX;
- bronze/silver/gold presentation tokens;
- editable JSON lab;
- documented official provider icon/logo strategy with semantic fallback;
- still no point-and-click graph editor or provider runtime.

---

## 10. Visual style / pedagogy rule

The desired technical educational visual language is deliberately restrained:

- white/near-white background;
- neutral strong outlines;
- small semantic accent palette;
- direct labels next to objects;
- whitespace;
- monospace for code/IDs where useful;
- no blurry pastel/watercolor style;
- no decorative gradients/shadows by default;
- colors mean source/target/active/create/drop/group/error/success/etc.

Motion should explain causality, ordering, correspondence or state transition. It should not animate trivial syntax merely to make a page move.

High-value motion: joins, reorder, group/aggregate, WAL-before-data-write, shuffle/repartition, retry/data flow, Git pointer/state changes.

Static/reduced-motion views must remain semantically complete.

---

## 11. Technology strategy

The project should specialize rather than compete on commodity breadth.

### Keep/own

- ConceptMotion semantic technical teaching;
- ForgeViz differentiated analytical/editorial stories;
- Datapass learning/application/source/progress composition;
- D3 as ForgeViz low-level visualization engine.

### Use/reference rather than rebuild

- Observable Plot / Vega-Lite / ECharts for ordinary charts depending on need;
- ELK/elkjs for future complex graph layout benchmark;
- D3plus/D3FC for backend/scene-graph/Canvas/WebGL benchmarking;
- Cytoscape.js/Sigma for specialist graph analysis or very large networks;
- deck.gl + MapLibre for serious geo;
- React Flow for a consumer that truly needs editable node-canvas UX;
- Motion/GSAP only as choreography layers when semantic engines remain authoritative;
- Deneb as Power BI declarative baseline before ForgeViz `.pbiviz` work;
- anywidget as a possible thin notebook host.

### Do not build now

- universal chart grammar;
- generic map engine;
- generic graph editor;
- custom Canvas/WebGL renderer without measurements;
- generalized Power BI generator;
- universal runtime/judge.

See `TECH_LANDSCAPE_AUDIT_2026.md` for details.

---

## 12. What was over-engineered / under-engineered

### Worth the investment

- semantic identity;
- deterministic state;
- Figure abstraction;
- WorkflowSpec vs DiagramSpec split;
- ConceptMotion vs ForgeViz split;
- external frozen release gates;
- no fake execution;
- source/JSON-first authoring.

### Premature exploration

- GeoStory architecture before a real geo consumer;
- custom Canvas/WebGL ideas before measured limits;
- broad Power BI system design before one `.pbiviz` proof;
- universal source-monitoring/provider-adapter ideas unrelated to the learning thesis;
- too many future renderer categories before authoring/distribution became easy;
- too many historical handoffs without a current master ledger.

### Under-engineered

- versioned package distribution;
- portable canonical content exports;
- AI discovery/canonical fixtures;
- consumer clean-checkout reproducibility;
- wide technical Figure mobile legibility;
- synchronized code/visual focus;
- consumer source/media/provenance ergonomics;
- ForgeViz family-level QA and cross-repo package proof.

---

## 13. Current recommended sequence

1. Keep documentation PR #4 independent and merge only after review/CI.
2. Decide Table Trace PR #3 explicitly; do not silently promote it.
3. Build package + canonical-content distribution path.
4. Simplify pin/bootstrap/scaffold closure.
5. Add AI capability registry, authoring pack and renderer-selection guidance.
6. Solve wide technical Figure legibility.
7. Add Table Trace code/rule synchronization instead of renderer proliferation.
8. Complete ForgeViz P0 maturity work, including naming audit and cross-repo consumer proof.
9. Rerun/adopt consumers one at a time with truthful release status.
10. Improve product/pedagogy per consumer backlog.
11. Run measured specialist P2 experiments only when P0/P1 evidence justifies them.
12. Compare consumer `FRAMEWORK_GAPS.md` files again before defining any next framework version.

---

## 14. Final answer to the V4 experiment question

The evidence is positive but qualified:

> **Datapass V4 materially reduced bespoke implementation work for several independent learning/knowledge consumers, especially when the problem maps to existing semantic contracts.**

Table Trace provides the strongest quantitative example: fifteen consumer explanations reused one relation grammar with zero consumer renderer code.

The framework is not yet as easy to consume as a polished public SDK. The major remaining cost is external package/content bootstrap and AI discovery, not semantic rendering. That is the correct target for the next stabilization phase.
