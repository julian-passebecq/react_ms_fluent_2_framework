# Foundation V2 consumer validation

Date: 2026-09-04

## Dubreu Formation proof consumer

`project/conceptmotion_studio/apps/dubreu-formation` is a separate Vite/React application composed from the V2 workspace packages. Its information architecture contains:

- course catalog and detail navigation;
- Python lesson;
- SQL Course lesson with an embedded ConceptMotion table-filter explanation;
- SQL Advanced guided Try → Hint → Reveal → Compare exercise;
- PySpark display-only lesson;
- Practice/Review assessment and locally persisted result;
- Progress summary;
- small EN/NO application-locale chrome.

The SQL source displayed to learners is extracted deterministically from an unambiguous Deepnote wrapper; `_dntk.execute_sql(...)` is not shown as the lesson code. The Python, SQL, advanced SQL, and PySpark fixtures retain local source file and SHA-256 provenance. Figure/cell/source/runtime target IDs are stable and the content catalog validates at module load and in tests.

The lesson surface is deliberately not raw notebook chrome: objectives and explanations lead, source/reference output is compact, a semantic figure is used only where it explains row membership and stable identity, and exercises expose progressive help. PySpark shows saved output as reference evidence, states that no in-site Spark runtime exists, and offers source copy/download without a run action.

## Assessment and progress proof

The shared contracts and evaluator support single choice, multiple choice, true/false, ordering, matching, code choice, and figure/architecture choice. The Dubreu proof path uses original single-choice, true/false, and code-choice questions.

Practice feedback is available per answer; mock-exam correctness is deferred until submit. Submitted attempts include versioned answers and scores and persist through `@datapass/progress`. Domain/concept summaries are derived from the same state. Browser coverage verifies a submission survives reload. Legacy Challenge drafts/flags migrate into the V2 key while the legacy values remain intact.

## Scaffold proof

`pnpm run scaffold:app -- --name <kebab-name> --preset <preset>` exposes four deterministic recipes:

- `knowledge`
- `learning`
- `catalog`
- `portfolio-hub`

Each preset generates a package manifest, Vite/TypeScript setup, shared `AppShell` composition, styles, README, and baseline tests. The learning preset includes the shared learning package/styles and a lazy-editor policy. Scaffold QA generates every preset into an isolated temporary workspace, verifies deterministic file output and the absence of copied renderer source, then typechecks, runs two generated accessibility/layout smoke tests, and production-builds each app.

## Project Hub proof

Studio's `/projects` route renders a validated, source-controlled Project Registry through generic `@datapass/ui` catalog primitives. It provides URL-backed search, status/technology facets, sort, cards/table views, detail composition, freshness/status metadata, and direct website/source links. Registry status is descriptive local metadata; it is not live monitoring.

## Visual and browser validation

The authoritative browser suite covers Dubreu SQL, Python, advanced SQL, PySpark, assessment/progress, and Studio Project Hub at 1440 px and 390 CSS px. Primary surfaces assert no serious/critical Axe findings and no page-level horizontal overflow. Learning controls receive keyboard interaction coverage; figure rendering includes accessible fallback/source metadata and reduced-motion state coverage.

The Storybook production build contains 32 Golden Gallery stories, including the consumer-facing Notebook lesson, all four Challenge states, submitted assessment result, Project Hub, Knowledge article, distinct workflow topology/run views, EN/NO, reduced motion, and mobile widths.

Exact commands and counts are recorded in `V2_TEST_REPORT.md`; production chunk behavior is recorded in `V2_BUNDLE_REPORT.md`.

## Source-material limitation

The V2 handoff contained source manifests but not the private/full course payloads. This proof consumer uses original representative fixtures licensed/labeled in its content catalog. It does not claim to reproduce, translate, or migrate the unavailable private curriculum.

## Explicit non-claims

The consumer does **not** provide Spark execution, Python or SQL runtime execution, Jupyter kernel integration, live source monitoring, cloud sync/accounts, or npm package publication. Downloads are inert source files; Colab is an explicitly external link.
