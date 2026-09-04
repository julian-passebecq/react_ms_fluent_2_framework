# Acceptance criteria - Datapass Visual Platform Foundation v1.1

Codex should treat this as a release gate. If a criterion cannot be completed, report it explicitly in `V1_AUDIT_SELF_REVIEW.md` rather than hiding it.

## A. Architecture

- [ ] `core` is TypeScript and has no React/DOM/Fluent/Monaco/Power BI dependency.
- [ ] React adapter is thin and does not own semantic calculations.
- [ ] Fluent UI is confined to application/shared UI layers.
- [ ] Monaco is confined to application-level challenge/spec surfaces.
- [ ] renderer registry is split by family or has an equally clear extensible registration mechanism.
- [ ] stable entity IDs exist for moving rows/nodes/edges/tasks.
- [ ] semantic state diff / transition planning exists.
- [ ] legacy scene compatibility strategy is documented.
- [ ] generic WorkflowSpec is provider-independent.
- [ ] Airflow/Fabric-ADF/Lakeflow presentations share one semantic workflow engine.
- [ ] FigureFrame/VisualizationSurface is renderer-neutral and does not hardcode ConceptMotion assumptions.
- [ ] no D3 SDK v2 or Power BI host logic leaked into ConceptMotion core.

## B. Shared UI / Fluent

- [ ] modern Fluent v9 / Fluent 2 primitives are used for standard controls.
- [ ] custom UI theme is restrained, professional and light-first.
- [ ] Catalog archetype works.
- [ ] Workbench archetype works.
- [ ] Explainer archetype works.
- [ ] Challenge Workbench archetype works.
- [ ] Knowledge Atlas archetype works.
- [ ] no giant marketing hero is required to reach useful content.
- [ ] compact desktop layout and phone layout both avoid page-level horizontal overflow.

## C. ConceptMotion gold scenes

- [ ] filter/sort scene preserves row identity across states.
- [ ] join fan-out scene visibly demonstrates semantic fan-out with stable input/output identities.
- [ ] programming loop scene synchronizes pointer/current iteration/code/state.
- [ ] one statistics/ML scene explains a real concept rather than decorative animation.
- [ ] cloud/data pipeline has distinct batch/stream/CDC/control/error semantics.
- [ ] data model/lineage uses reusable node/port/routed-edge primitives.
- [ ] play/pause/previous/next/scrub/speed controls work where applicable.
- [ ] reduced-motion mode still communicates complete states.
- [ ] timers/transitions/simulations clean up correctly.

## D. Workflow / orchestration

- [ ] Airflow-style DAG scene renders from generic WorkflowSpec.
- [ ] Fabric/ADF-style pipeline renders from the same workflow semantic engine.
- [ ] Lakeflow-oriented preset renders without a separate semantic engine.
- [ ] topology-only mode works.
- [ ] deterministic run playback works.
- [ ] selected task/activity inspector works.
- [ ] nested group/container focus and breadcrumb work.
- [ ] success/failure/completion/skip dependencies are distinguishable without relying on color alone.
- [ ] invalid edge/group/run references produce useful validation errors.
- [ ] JSON spec playground validates and previews WorkflowSpec.
- [ ] zoom/fit controls work where needed.
- [ ] static SVG freeze/export works.

## E. Challenge Workbench

- [ ] problem catalog/search/filter exists.
- [ ] Description / Visualize / Hints progressive disclosure works.
- [ ] initial challenge view is not overloaded by always-visible animation + data + solution.
- [ ] Code / Solution / Compare modes work.
- [ ] Monaco diff works for the demo challenge.
- [ ] starter-code reset works.
- [ ] local draft persistence works.
- [ ] mastered/flag/review status persists locally.
- [ ] next/previous problem navigation works.
- [ ] optional ConceptMotion Visualize mode works.
- [ ] no arbitrary-code runtime/judge/terminal was introduced.
- [ ] UI does not imply syntax assistance proves correctness.

## F. Knowledge Atlas / source-change foundation

- [ ] `@datapass/knowledge` (or documented isolated equivalent) is pure TypeScript and has no React/DOM/Fluent/fetch dependency.
- [ ] KnowledgeEntry/SourceRef/FeatureRef/ChangeEvent/ImpactRef semantics are typed and validated.
- [ ] deterministic fixture-only feature-ID impact resolution marks affected content as needs-review.
- [ ] Knowledge Atlas demo has compact docs navigation, article content, On-this-page/equivalent navigation, source links and status/version/verified metadata.
- [ ] one embedded ConceptMotion figure renders inside Knowledge Atlas through renderer-neutral FigureFrame.
- [ ] local EN/NO content fallback works on the Knowledge demo.
- [ ] one fixture-driven column-level lineage scene renders without a SQL parser.
- [ ] Challenge Workbench has a clean optional diagnostics/analysis extension point without clutter when unused.
- [ ] no live source monitoring/crawler/notification was introduced.
- [ ] no DAX Formatter external call was introduced.
- [ ] no SQL parser was introduced.
- [ ] semantic icon IDs/registry resolver exist with a safe generic fallback; specs are not tied to local file paths.

## G. EN/NO locale infrastructure

- [ ] application locale provider supports EN and NO.
- [ ] compact toggle works on at least one Studio surface.
- [ ] locale choice persists locally.
- [ ] plain legacy string content still renders.
- [ ] localized content falls back to English when Norwegian is missing.
- [ ] a page/app can hide the toggle.
- [ ] code/technical identifiers do not change when locale changes.
- [ ] full challenge/content translation was NOT treated as a v1 requirement.

## H. Renderer-neutral future D3 readiness

- [ ] FigureFrame/VisualizationSurface can host arbitrary renderer content.
- [ ] renderer lifecycle does not assume React is the only host below the app layer.
- [ ] visualization theme metadata uses semantic roles rather than importing Fluent token objects into render cores.
- [ ] renderer registry can accept new families without editing a single giant monolithic renderer file.
- [ ] `D3_SDK_V2_BRIDGE_AND_ROADMAP.md` remains reflected in the architecture docs.
- [ ] no GeoStory/world-map framework was accidentally built in this pass.
- [ ] no Power BI custom visual rewrite was accidentally built in this pass.

## I. Accessibility / interaction

- [ ] keyboard operation works for core controls.
- [ ] focus-visible treatment exists.
- [ ] interactive diagram objects expose meaningful labels/state.
- [ ] table-heavy scenes expose a textual/tabular fallback.
- [ ] workflow current-state summary is exposed textually.
- [ ] reduced-motion preference is honored.
- [ ] essential meaning is never carried only by animation/color.

## J. Tests / quality

- [ ] package lockfile exists.
- [ ] production build passes.
- [ ] existing offline tests remain green or migration changes are documented.
- [ ] semantic unit tests cover filter/sort/join/stable identity/flow/workflow run state.
- [ ] validation tests cover WorkflowSpec reference integrity.
- [ ] locale helper tests exist where useful.
- [ ] knowledge/source/change validation tests exist.
- [ ] deterministic change-impact tests exist.
- [ ] column-lineage fixture validation/render smoke exists.
- [ ] browser smoke covers required gold surfaces.
- [ ] browser smoke covers Challenge Workbench and Workflow Workbench.
- [ ] desktop + phone smoke passes.
- [ ] deterministic SVG freeze/export exists.
- [ ] `V1_TEST_REPORT.md` contains actual commands/results.
- [ ] `V1_AUDIT_SELF_REVIEW.md` lists known limitations honestly.
- [ ] `V1_MIGRATION_LOG.md` documents compatibility decisions.
- [ ] `V1_API_SURFACE.md` documents public exports.

## K. Scope discipline

- [ ] no D3 SDK v2 implementation.
- [ ] no GeoStory/world-tour implementation.
- [ ] no Power BI custom visual architecture rewrite.
- [ ] no universal analytical chart grammar expansion.
- [ ] no actual code execution/judge.
- [ ] no terminal backend.
- [ ] no actual Airflow/Fabric/ADF/Lakeflow runtime/deployment.
- [ ] no drag/drop pipeline editor.
- [ ] no full Data Forge implementation.
- [ ] no Web Components rewrite.
- [ ] no Canvas renderer.
- [ ] no migration of every historical website.
- [ ] no attempt to translate every item into Norwegian.
- [ ] no live documentation/news crawler.
- [ ] no automatic AI content rewriting.
- [ ] no article/movie narrative GeoStory implementation.
- [ ] no freehand/whiteboard implementation.
