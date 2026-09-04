# Checklist for the external V1.1 audit

When the user returns Codex Foundation v1.1, audit these areas first.

1. **Dependency direction** - verify core truly imports no React/DOM/Fluent/Monaco/Power BI APIs.
2. **Stable identity** - inspect D3/SVG updates for filter/sort/join; reject fake continuity implemented as full redraw + CSS fade.
3. **Semantic actions** - ordinary scenes should not require hand-authored pixel coordinates.
4. **Transition planner** - confirm semantic state diffs exist and are used where continuity matters.
5. **Layout determinism** - same scene/workflow spec should produce stable placement where layout is deterministic by design.
6. **Renderer registry** - verify renderers are organized by family/registration rather than one giant switch/file.
7. **Diagram primitives** - nodes/ports/groups/routed edges should be reusable across lineage/cloud/workflow scenes.
8. **Flow semantics** - batch/stream/CDC/control/error must not be merely palette variants.
9. **Workflow model** - Airflow/Fabric-ADF/Lakeflow must be presets/adapters on one generic WorkflowSpec.
10. **Orchestration vs data flow** - dependency/control edges must not be confused with data/lineage edges.
11. **Nested workflow** - validate group/container routing, breadcrumb focus and reference integrity.
12. **Run state model** - queued/running/success/failure/retry/skip/upstream-failed behavior should be deterministic.
13. **Challenge progressive disclosure** - animation must not permanently crowd the problem/editor.
14. **Monaco diff** - learner/reference models must be separate and draft persistence robust across variants.
15. **No fake judge** - syntax assistance must not be presented as runtime correctness.
16. **Fluent usage** - verify modern Fluent v9 primitives rather than legacy Fabric APIs or a second component library.
17. **UI restraint** - compare against supplied portfolio/workbench/FabricStack references.
18. **Renderer-neutral FigureFrame** - verify it can host arbitrary content and is not hardwired to ConceptMotion internals.
19. **EN/NO infrastructure** - persistence, fallback, optional toggle visibility, code unaffected by locale.
20. **Editorial figures** - title/subtitle/source/annotation consistency.
21. **Accessibility** - keyboard, focus-visible, reduced motion, fallback summaries/tables, contrast.
22. **Cleanup** - timers/transitions/simulations must teardown correctly.
23. **Tests** - rerun exact commands in `V1_TEST_REPORT.md`; inspect browser/visual tests.
24. **Export** - SVG freeze should be deterministic/understandable.
25. **Forge readiness** - Data Forge should be able to consume core/react/ui/workflow packages without Studio-specific coupling.
26. **D3 v2 boundary** - confirm Codex did NOT absorb/rewrite the D3 SDK, GeoStory or Power BI generator in V1.1.
27. **V2 readiness** - verify application/theme/lifecycle contracts do not make the future D3 SDK React-only or require another shell rewrite.


## v1.1 knowledge/source audit

- Is Knowledge Atlas a reusable archetype rather than project-specific markup?
- Is source/status/verified metadata semantically modeled rather than hard-coded into cards?
- Does a local ChangeEvent mark impacted content by stable feature IDs?
- Is `@datapass/knowledge` free of React/DOM/network/crawler dependencies?
- Can the same Knowledge page embed ConceptMotion now and a future D3 renderer later?
- Is bilingual content optional and fallback-safe?
- Does column lineage preserve stable table/column identities and derivation metadata?
- Is there no hidden live web crawler, DAX network call or SQL parser in Foundation v1.1?
- Are future Story/GeoStory types/docs kept as V2 references rather than implemented prematurely?
- Do cloud/knowledge specs use semantic icon IDs with a registry/fallback rather than hard-coded asset paths?
