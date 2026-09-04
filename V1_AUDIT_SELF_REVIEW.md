# Foundation v1.1 self-review

Date: 2026-09-04  
Verdict: **Foundation v1.1 is implemented and the required QA gates pass.** No known P0 or P1 defects remain in the delivered scope.

## What is complete

- Five explicit workspace boundaries: pure `@conceptmotion/core`, pure `@datapass/knowledge`, framework-neutral `@conceptmotion/svg`, thin `@conceptmotion/react`, and Fluent v9 `@datapass/ui`.
- Semantic table, join, loop, regression, diagram, model/column-lineage, and workflow renderers with stable IDs, keyed DOM updates, reduced-motion behavior, keyboard selection, accessible text, semantic icon fallbacks, and deterministic SVG freeze/export.
- One provider-independent `WorkflowSpec` and semantic run engine presented as generic/Airflow, Fabric/ADF, and Lakeflow views. Runs are declared local fixtures and never imply provider execution.
- Fluent Catalog, Workbench, Explainers, Workflow Workbench, Challenge Workbench, and Knowledge Atlas application surfaces.
- Monaco is confined to the Workflow spec playground and Challenge code/solution/diff panes.
- EN/NO locale provider, persisted compact toggle, localized application chrome, English fallback, and configurable hiding on the English-only Challenge corpus.
- Knowledge Atlas source/status/version/verified/change-impact behavior using local deterministic fixtures and stable feature/source IDs.
- Column-level lineage contracts and a parser-like fixture; no SQL parser is bundled.
- Preserved legacy application and smoke tests, plus a lockfile, strict TypeScript build, boundary audit, semantic tests, browser smoke, Axe checks, and screenshot baselines.

## Findings resolved during audit

- Restored `@datapass/ui` CSS to the production bundle with an explicit app import and package side-effect declaration; a browser assertion now guards the layout stylesheet.
- Replaced nested interactive SVG semantics: selectable visualizations use an outer group role, and lineage asset and column controls are sibling focus targets.
- Hardened workflow, diagram, and lineage validators to accept unknown parsed JSON and return structured issues rather than throwing on malformed nested data.
- Added required-array, enum, port, schedule, overlay, reference, ID-collision, group-cycle, and localized-text validation.
- Prevented Challenge action controls from obscuring Monaco and corrected small-text contrast.
- Removed a nested `VisualizationSurface`, made Workflow group focus data-driven, corrected the zoom reset label, guarded official links, and made Knowledge section navigation stateful and sticky-header-safe.
- Added route-focus handling, live challenge-selection status, localized shared labels, and a truthful reduced-motion playback state.

## Known limitations and deliberate boundaries

1. **Workspace packages are not publish artifacts yet.** They are private packages exporting TypeScript source for monorepo consumption. A future release pipeline still needs per-package declaration/output builds, package provenance, versioning, and publish validation.

2. **The new Studio proves the required gold surfaces, not a full migration of the legacy catalogue.** The legacy inventory remains 186 concepts / 36 live scenes / 28 renderer families. Foundation v1.1 adds 15 curated proof cards and seven reusable SVG renderer IDs; it does not rewrite all legacy scenes.

3. **Challenge behavior is intentionally not a judge.** Drafts and progress use local storage. Diagnostics are shallow, deterministic text checks and explicitly do not prove semantic correctness. There is no runtime, database, terminal, sandbox, or universal evaluator.

4. **Workflow behavior is illustrative.** Topology and run states compile from declared fixtures. There is no Airflow, Fabric, ADF, or Lakeflow API adapter and no pipeline execution.

5. **Knowledge freshness is local and deterministic.** Official links and verification dates are fixture metadata. There is no crawling, RSS, notification, AI classification, or live source monitoring.

6. **Column lineage is parser-ready, not parser-backed.** Relations include stable asset/column endpoints, expressions, source spans, and statement/change types, but the fixture is authored JSON. No SQL parser integration is present.

7. **Localization is intentionally small.** Shell and reusable control labels support EN/NO with persistence and fallback; much technical lesson/challenge prose remains English. Code, identifiers, and technology names are never translated. The Challenge page hides the toggle because its corpus is English-first.

8. **Light theme only.** The visual system is deliberately light-first and restrained. Dark-theme behavior was not requested or claimed.

9. **Browser coverage is Chrome-focused.** Automated evidence covers desktop and phone Chrome on Windows. Firefox, WebKit, assistive-technology pairing, and physical devices were not tested. Axe excludes Fluent Tabster sentinels only; this exception is documented in the test.

10. **Monaco dominates bundle size.** The production build passes, but Vite reports the Monaco chunk at approximately 4.38 MB minified (1.12 MB gzip) plus language workers. Route-level lazy loading and a reduced language-worker set are future performance work.

11. **Social metadata has no canonical deployment URL.** The 1200×630 preview is local and metadata uses a relative asset path. A hosting integration should replace it with an absolute production URL when an origin exists.

12. **No CI or publication automation was added.** The checked-in scripts are reproducible locally, but a hosted CI matrix and artifact retention policy remain follow-up work.

## Explicitly not implemented

The delivery does not include D3 SDK v2, GeoStory/Narrative Story, article/film/world-map renderers, live monitoring, DAX network formatting, SQL parsing, the Power BI adapter rewrite, a free-form whiteboard, a universal code judge, actual orchestration execution, or the Data Forge backend/generator. The corresponding reference directories and roadmaps remain read-only.

## QA confidence

`npm run check` and `npm run check:offline` pass. See `V1_TEST_REPORT.md` for exact results and evidence paths. Remaining items above are scoped limitations or release-engineering follow-ups, not hidden completion claims.
