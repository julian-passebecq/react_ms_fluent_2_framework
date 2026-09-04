# Foundation V2 architecture

Foundation V3 composes reusable content, import, figure, learning, progress, catalog, and app-generation contracts on top of the preserved Foundation v1.1 semantic/rendering packages. The Studio and Formation are consumers of those contracts; neither application is a library boundary.

## Dependency direction

```text
scripts/import-reference-notebooks
              |
              v
@datapass/notebook-import ---> @datapass/content <--- @datapass/scaffold
                                      ^
                                      |
apps/formation ---> @datapass/learning ---> @datapass/code ---> Monaco
              |                   |  |  |
              |                   |  |  `----> @datapass/progress
              |                   |  `-------> @datapass/figure
              |                   `----------> @datapass/content
              |
              `------------------------------> @datapass/ui

@datapass/figure ---> @datapass/content
        |        ---> @datapass/ui
        |        ---> @conceptmotion/react ---> @conceptmotion/svg ---> @conceptmotion/core
        `------------> @conceptmotion/core

apps/studio composes the V1.1 packages plus code/content/figure/progress/ui
legacy src/ remains side by side and is not imported by workspace packages
```

The important negative dependencies remain explicit:

- `@conceptmotion/core` has no React, Fluent, Monaco, browser DOM, D3, Power BI, or product-host dependency.
- `@datapass/knowledge` has no React, Fluent, DOM, crawler, fetch, network, or AI-service dependency.
- `@datapass/content` is pure TypeScript and has no workspace dependency, UI framework, DOM, Monaco, fetch, or runtime-provider dependency.
- `@datapass/notebook-import` depends only on content contracts; it does not host a kernel or execute source code.
- `@datapass/progress` is pure TypeScript. Browser storage is accessed only through a small guarded adapter supplied at the edge.
- `@datapass/code` owns Monaco. `@datapass/ui` and the pure packages do not import it.
- `@datapass/scaffold` depends only on content types. A generated recipe declares consumer dependencies; the generator does not hide another application framework.
- applications may compose packages, but no package imports from an application.

`scripts/check-boundaries.mjs` enforces the material package boundaries.

## Content composition contract

`@datapass/content` is the portable V2 interchange layer. It defines and validates:

- `ContentSource` and license/provenance metadata;
- serializable `FigureSpec` records with renderer IDs, stable feature/concept/source IDs, fallback text, static/reduced-motion state, and JSON payloads;
- discriminated notebook cells for Markdown, code, text/table/image saved output, figures, callouts, and guided exercises;
- `NotebookSpec`, `LessonSpec`, `CourseModule`, and `CourseSpec` relationships;
- seven assessment question shapes: single choice, multiple choice, true/false, ordering, matching, code choice, and figure choice;
- `AssessmentSpec`, `RuntimeTarget`, `ProjectRecord`, and `AppRecipe`;
- lightweight `VocabularyEntry`, `VocabularyTopic`, and `ArticleLesson` contracts for a future consumer;
- a canonical `ContentCatalog` joining these entities by stable ID.

Validation checks shape and reference integrity. Serialization recursively sorts object keys for deterministic JSON. Contracts may carry localized EN/NO text, but IDs and code are never translated.

The content package describes external runtime targets; it does not call them. A target must say whether it executes externally. Download targets are inert source artifacts.

## Deterministic notebook import

`@datapass/notebook-import` converts notebook JSON into `NotebookSpec` without evaluating any cell:

```text
.ipynb UTF-8 source
        |
        +--> parse + validate notebook structure
        +--> detect notebook and per-cell language
        +--> extract literal Deepnote SQL wrapper when unambiguous
        +--> sanitize Markdown / inert saved output / safe media references
        +--> stable cell IDs + source SHA-256 + importer version
        v
canonical NotebookSpec JSON + issue list + copied media manifest
```

Cells with native IDs retain an ID-derived stable identity. Other cell IDs derive deterministically from type and content hash, with deterministic duplicate handling. Generated output is canonical, and rerunning `pnpm run import:reference` with unchanged input produces unchanged artifacts.

Deepnote `_dntk.execute_sql(...)` handling extracts only a complete, unambiguous literal SQL argument. It never invokes the wrapper. Ambiguous or dynamic wrappers are reported rather than guessed.

Notebook outputs are source evidence. Stream, error, supported table, image, and text representations can be preserved and are labeled as reference output; raw HTML is made inert. The importer contains no Python, SQL, Spark, or Jupyter execution hook.

The import script currently materializes the representative SQL and PySpark notebooks for Formation, copies the original downloadable sources, and records an import manifest. The private Dubreu course corpus was not present in the supplied attachments, so the implementation does not claim to have imported it.

## Shared lazy Monaco

`@datapass/code` is the only reusable Monaco boundary. It exports `CodeEditor`, `CodeDiff`, and `JsonSpecEditor` plus shared language, option, theme, marker, and schema types.

Each exported surface renders a small accessible loading state and uses `React.lazy()` to import the Monaco implementation. Studio route pages are also lazy. As a result:

- Catalog and Knowledge Atlas can load without requesting Monaco;
- Challenge, guided exercise, diff, and workflow JSON surfaces share one implementation;
- Monaco stays out of the generic Fluent UI package;
- editor languages, workers, defaults, and accessible theme tokens are configured centrally;
- adding an editor does not duplicate page-owned Monaco setup.

`scripts/check-bundle.mjs` validates the route/chunk relationship after the Studio production build. Lazy loading is a load-boundary claim, not a claim that Monaco itself is small.

## Figure pipeline

```text
serializable FigureSpec
        |
        v
FigureRendererRegistry lookup + adapter validation
        |
        +--> ConceptMotion semantic scene
        +--> shared workflow topology/run scene
        +--> safe static text/image
        `--> future chart/narrative adapter
        |
        v
FigureView ---> renderer-neutral @datapass/ui FigureFrame
```

`@datapass/figure` owns the React adapter registry, not semantic compilation. The default registry includes the preserved ConceptMotion families, separate workflow topology and deterministic-run adapters, and guarded static text/image adapters. A consumer can register another renderer without changing `FigureSpec` or `FigureFrame`.

`FigureView` resolves localized framing, source metadata, fallback text, explicit/static frame state, and reduced-motion state before delegating rendering. Unknown or invalid adapters fail visibly with the accessible fallback intact. Local static-image paths reject traversal; HTTPS sources reject credentials; unsafe schemes and SVG data URLs are not accepted.

`FigureFrame` and `VisualizationSurface` remain renderer-neutral so a future D3 chart or narrative adapter can use the same framing contract without making D3 a content dependency.

## Preserved ConceptMotion pipeline

Foundation v1.1 still owns the semantic/rendering lifecycle:

```text
versioned semantic spec
        |
        v
pure validation / compilation
        |
        +--> SemanticSnapshot --stable entity IDs--> TransitionPlan
        |
        v
renderer input adapter
        |
        v
SVG renderer: mount -> keyed update -> freeze or destroy
        |
        v
thin React host -> Figure adapter -> renderer-neutral FigureFrame
```

Semantic specs describe entities, relationships, state, ordering, and intent. Coordinates and SVG details remain in the rendering layer. Rows, tasks, points, and lineage relations keep their semantic IDs when display position or state changes, so keyed updates communicate causality.

The preserved core still supplies deterministic table filter/sort/join, loop and regression frames, diagram and lineage contracts, semantic flow/icon roles, and one provider-neutral `WorkflowSpec`. The SVG package still owns the keyed lifecycle, semantic theme roles, registry, reduced-motion duration, and canonical freeze behavior. The React package still owns only renderer lifecycle and preference plumbing, never semantic layout.

## Shared workflow and lineage boundaries

Airflow, Fabric Data Factory/Azure Data Factory, Databricks Lakeflow, and generic presentation continue to share one `WorkflowSpec`. Presets affect labels and presentation only. Nodes, groups, ports, conditions, data-flow kinds, cumulative run frames, status transitions, and stable IDs remain provider-neutral.

The Studio can display topology, play deterministic run fixtures, and validate a JSON spec in Monaco. It does not schedule or execute a pipeline.

`LineageSpec` retains stable asset, column, endpoint, and relation IDs plus optional derivation/expression metadata and source spans. This is column-lineage readiness and rendering interchange, not SQL parsing.

## Learning and assessment

`@datapass/learning` renders content contracts without owning their persistence or execution:

- `NotebookLesson` and `NotebookCell` render the notebook-cell union, saved-output labels, source context, and embedded `FigureSpec` cells;
- `GuidedExercise` controls the Try → Hint → Reveal → Compare disclosure sequence and uses the shared lazy editor/diff surfaces;
- `AssessmentRunner` evaluates the seven question contracts, submits attempts, and reveals explanations according to assessment mode;
- `RuntimeLauncher` validates downloads and explicit external links while keeping runtime requirements visible;
- `ProgressSummary` presents reusable aggregate state.

Evaluation is deterministic comparison against declared answers. It is not a universal code judge, and exercise source is not executed.

## Progress and migration

`@datapass/progress` defines schema version 2 under the default key `datapass:progress:v2`. It stores stable-ID keyed challenge drafts/status flags, lesson completion and recent position, and assessment attempts/answers/scores. Pure operations derive domain and concept breakdowns.

The adapter guards unavailable or throwing storage. Consumers can use browser storage or a memory adapter. Deterministic serialization supports local JSON export/import. The migration layer reads the V1.1 challenge keys and merges them into V2 without deleting or rewriting the historical values.

Progress is local to the browser unless the user exports it. There are no accounts, cloud synchronization, telemetry, or remote assessment services in V2.

## Catalog, Project Hub, and app recipes

`@datapass/ui` adds reusable entity cards/tables, metric strips, facets, sorting, view toggles, details, freshness display, and normalized URL query state. These are generic application controls built with Fluent v9; they do not embed project or course semantics.

The Studio Project Hub consumes a validated, source-controlled `ProjectRegistry` with stable IDs and direct website/source destinations. Status and verification timestamps are local metadata, explicitly not a live availability signal.

`@datapass/scaffold` exposes deterministic recipes for:

- `knowledge`;
- `learning`;
- `catalog`;
- `portfolio-hub`.

`pnpm scaffold:app --name <kebab-name> --preset <preset>` creates one new `apps/<name>` directory, refusing invalid/reserved names and an existing destination. Generated apps import shared packages, Fluent v9, shared CSS, one app root, and baseline accessibility/layout tests. The scaffold is a small file generator, not a Data Forge backend or a framework within the framework.

## Consumers

### Studio

The Studio composes the preserved Catalog, Workbench, Explainers, Workflow, Challenge, and Knowledge Atlas with the new Project Hub. Route-level lazy loading and the bundle audit keep Monaco away from non-editor entry paths. EN/NO application chrome, reduced motion, fallbacks, and stable semantic fixtures remain in place.

### Formation

Formation is a Fluent learning consumer built from shared packages. Its catalog links Python, SQL, advanced SQL, and display-only PySpark lessons. It renders imported/reference cells, an embedded ConceptMotion SQL-filter figure, guided editor/diff exercises, a mixed QCM assessment, local progress, downloads, and an optional external Colab launch.

Python, SQL, and PySpark execution remain external. The site has no Spark runtime and no Jupyter kernel. A saved output demonstrates source provenance, not a fresh browser run.

## Storybook and CI

The Storybook Golden Gallery exercises production package components and representative states across shell, explorer, figure, code, notebook/exercise/assessment, progress/runtime, and Project Hub surfaces. It uses the accessibility addon and the same Fluent/theme CSS boundaries as consumers.

The repository workflow at `.github/workflows/ci.yml` installs a frozen lockfile and runs TypeScript, unit coverage, boundary checks, scaffold smoke, Studio/bundle, Dubreu, legacy, Storybook, and desktop/phone browser gates. A workflow file is not evidence of a hosted green run; exact local and hosted results belong in the V3 test report.

## Locale, motion, and accessibility

Content and UI use compatible localized values:

```ts
type LocalizedText = string | Partial<Record<'en' | 'no', string>>;
```

Resolution tries the requested locale, English, then another non-empty value. EN/NO support is small application infrastructure, not full course translation.

Application shells expose skip links and labeled landmarks. Figure hosts expose text fallbacks. Selectable semantic marks have keyboard behavior, flow kinds include non-color cues, and reduced motion selects an explicit/static meaningful state. Browser gates exercise desktop and 390px phone layouts and automated accessibility checks on primary V2 surfaces.

## V1.1 compatibility gates

V2 preserves rather than weakens the completed v1.1 foundation:

- the legacy `src` app, 36 live scenes, 28 renderer families, catalog, printable sheets, schemas, examples, Python helper, and generator contracts remain intact;
- legacy flat scenes and canonical v1 `data` payloads continue through the legacy normalizer;
- stable identity, semantic-first specs, Fluent v9 controls, renderer lifecycle, source-aware Knowledge Atlas, EN/NO chrome, reduced motion, and deterministic local fixtures remain required;
- the ConceptMotion and Knowledge purity boundaries remain unchanged;
- Airflow/Fabric-ADF/Lakeflow continue to share one workflow semantic model;
- package entry points remain private workspace TypeScript sources rather than an npm publication claim.

The focused ConceptMotion renderer registry remains an extensible foundation, not a claim that every legacy renderer family has been migrated.

## Intentionally outside Foundation V3

- Python, SQL, Spark, Databricks, pipeline, or notebook execution;
- Jupyter kernels or a universal code judge;
- live source monitoring, crawling, notifications, or AI rewriting;
- accounts, cloud progress sync, or remote assessment services;
- DAX Formatter network calls or SQL parser integration;
- Data Forge backend/generator implementation;
- D3 SDK v2, GeoStory/Narrative Story, or an analytical chart grammar;
- Canvas/Web Component backends or a Power BI adapter rewrite;
- full content translation or npm publication.

These are explicit future/consumer boundaries rather than hidden package capabilities.

## V3 consumer/reuse layer

The dependency direction remains semantic core → SVG → thin React adapters, and pure content/progress → Figure/learning presentation → consumer apps. `content/` at the workspace root owns public registry records, pinned practice data and shared visual artifacts. Reusable packages do not import consumer content.

- Formation uses the shared 30-artifact visual library for its SQL/Python reasoning modules; Algorithm Atlas catalogs those same objects, not copies.
- `ChallengeDefinition` moves additively from Studio into pure content; `ChallengeWorkbench` composes the existing ChallengeShell, Figure and lazy editor/diff. Code Sandbox and Code Interview share this surface and progress helpers while retaining separate navigation, content policies and persistence keys.
- `DiagramSpec.layout` opts into deterministic radial or layered providers. Layout returns node/group bounds and edge routes in pure core. SVG consumes those routes; legacy layouts remain unchanged when no provider is specified. Architecture Atlas and Pilot Center both call this path.
- `FigurePlayer` combines FigureView with timeline, stable-ID selection, captions, reduced-motion behavior and export of the currently rendered SVG. Unsupported adapters retain accessible fallback and do not advertise SVG export.
- Studio's lazy Visual Sandbox edits the production Figure contract through the shared JsonSpecEditor. Structural/resource validation protects the renderer; invalid source keeps the last valid preview. The tool never evaluates authored code.
- Pilot imports only the public registry during builds. Private overlays are runtime file imports, validated before a preview/confirmation step. Browser-local notes/overlays use their own schema and recovery guard. Public export is separately constructed from source-controlled registry fields.

Seven app project references, all consumer production manifests, 38 Golden Gallery stories, the full pinned practice importer and six independent pure-package coverage floors are part of CI. See the repository V3 reports for measured results; architectural intent is not a claim of test success.
