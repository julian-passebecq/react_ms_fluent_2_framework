# Foundation V2 self-review

Date: 2026-09-04  
Audited baseline: `d4435f55eb64eb02147e8ff0d51e3014c189fa75`

## Conclusion

The required Foundation V2 scope is implemented as an additive layer over the preserved v1.1 foundation. The acceptance surfaces are exercised locally through unit, boundary, build, Storybook, and desktop/phone browser gates. The implementation remains a reusable visual-learning and source-aware documentation foundation rather than a one-off course site.

## Architecture review

- Pure boundaries: `@datapass/content`, `@datapass/notebook-import`, `@datapass/progress`, and `@datapass/scaffold` contain no React, Fluent, Monaco, DOM, crawler, fetch, AI-service, or runtime-provider dependency. ConceptMotion core remains framework/DOM independent. `@datapass/knowledge` retains its v1.1 boundary.
- UI boundaries: `@datapass/ui` supplies generic Fluent v9 shell/explorer primitives and has no Monaco or ConceptMotion semantic dependency. `@datapass/code` is the single editor boundary. `@datapass/figure` adapts application `FigureSpec` values to renderers without absorbing renderer geometry.
- Semantic integrity: shared workflow fixtures continue to use one semantic model across Airflow, Fabric/ADF, and Lakeflow views. Movement uses stable entity/row IDs. Figure static and reduced-motion states select meaningful frames.
- Consumer reuse: Dubreu and all four scaffold presets compose workspace packages; none copies renderer source.

## Security and truthfulness review

- Notebook import is build-time parsing only: no `eval`, process execution, notebook execution, network fetch, or kernel API.
- Raw HTML/script and unsafe image/media inputs are rejected or reduced to warnings/fallbacks. Static figure paths reject traversal, credential-bearing HTTPS URLs, and SVG data URLs.
- Deepnote extraction is conservative: ambiguous wrappers fall back to original source while preserving debug provenance.
- Saved notebook output is labeled as reference output. PySpark screens explicitly say no Spark runtime is present and offer only copy/download behavior.
- Project status is source-controlled registry metadata, not a monitored availability claim.

## UX, accessibility, and performance review

- Catalog and Knowledge startup graphs exclude Monaco; Challenge and Workflow load the common editor dynamically.
- New primary surfaces are covered at 1440 px and an actual 390 CSS-pixel phone viewport. Browser assertions check serious/critical Axe findings and page-level horizontal overflow.
- Learning controls are keyboard operable; the guided exercise is tested through Hint, Reveal, and Compare. Mock-exam evaluation withholds correctness until submission.
- Wide notebook code/table regions are named keyboard-scroll regions. Assessment grids and consumer pages use shrink-safe tracks.
- Figure fallbacks and source notes remain accessible. Reduced motion resolves to an explicit comprehensible figure state rather than removing information.
- The Golden Gallery has 32 discoverable production stories. This is two above the handoff's approximate 20–30 target because required Challenge and workflow states remain individually addressable.

## Residual limitations and deferred scope

1. The private/full Dubreu and PySpark course payloads were not attached. V2 therefore proves the architecture with original representative fixtures only; it does not claim migration of the private curriculum.
2. The numeric Vitest coverage thresholds remain intentionally scoped to the v1.1 `core` and `knowledge` packages. All V2 test files run in the unit gate, but their source is not included in the reported aggregate percentage. This is disclosed rather than presenting the v1.1 percentage as whole-workspace coverage.
3. The Monaco/editor payload is materially smaller and no longer requested by non-code routes, but it remains a large lazy payload. Additional language contribution trimming is future performance work.
4. GitHub Actions CI is implemented, but this uncommitted local workspace has no hosted workflow result. Only the local equivalent may be claimed green.
5. External destinations such as Colab and Project Registry URLs are not availability-monitored. Runtime configuration and service/account requirements remain the learner's responsibility.
6. Optional ELK layout, browser DuckDB/Pyodide adapters, full Norwegian curriculum translation, D3 SDK v2, GeoStory/Narrative Story, DAX network formatting, SQL parsing/lineage inference, Power BI adapter rewrite, and Data Forge backend/generator remain deferred.
7. Vite's development console logs a Fluent/Keyborg disposal diagnostic during repeated Playwright page teardown. No uncaught page error is reported and production builds/browser assertions pass, but dependency cleanup should be rechecked when Fluent/React versions next move.

## Explicit non-claims

Foundation V2 does **not** implement or claim:

- Spark execution;
- Python or SQL runtime execution;
- Jupyter kernel integration;
- live source monitoring;
- cloud sync or user accounts;
- npm package publication.

It also does not claim a universal code judge, a hosted CI run, or migration of unavailable private course content.
