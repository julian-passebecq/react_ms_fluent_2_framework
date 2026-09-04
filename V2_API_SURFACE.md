# Foundation V2 public API surface

This document inventories the V2 additions exported from the workspace package entry points under `project/conceptmotion_studio/packages/*/src/index.ts`. “Public” means supported for use by applications in this repository. Every package remains private and source-exported; this is not an npm publication or a semver compatibility promise.

## Boundary summary

| Package | Runtime/dependency boundary | V2 stability note |
| --- | --- | --- |
| `@datapass/content` | Pure TypeScript; no React, Fluent, Monaco, DOM, filesystem, fetch, or provider SDK dependency. | Serializable content contracts, stable IDs, validation, and deterministic JSON form the reusable interchange boundary. |
| `@datapass/notebook-import` | Pure TypeScript over caller-supplied strings/media; depends only on `@datapass/content`. It performs no filesystem access and has no notebook/runtime hooks. | Deterministic build-time importer. Importer version is `2.0.0`; unchanged inputs and options produce stable output. |
| `@datapass/code` | React/Monaco presentation package. Monaco is loaded behind the package's lazy React surface and uses editor and JSON workers only. It has no code-execution adapter. | One shared editor boundary for application code, diff, and JSON-spec surfaces. Language metadata explicitly reports `executable: false`. |
| `@datapass/figure` | React adapter package over `@datapass/content`, `@datapass/ui`, and ConceptMotion. Renderer algorithms remain in ConceptMotion packages. | Application-level renderer registry; `FigureSpec` remains serializable and renderer-neutral in `@datapass/content`. |
| `@datapass/progress` | Pure TypeScript storage schema and operations; no React, DOM, backend, or account dependency. Applications supply a storage adapter. | Schema and default local key are versioned at V2. Deterministic v1.1 migration is part of the public surface. |
| `@datapass/learning` | React + Fluent composition over code, content, figure, and progress packages. | Course/notebook/assessment UI only. Code is edited, displayed, or compared; it is not executed. |
| `@datapass/scaffold` | Pure deterministic generator depending only on `@datapass/content`; the separate CLI owns filesystem writes. | Four approved app presets generate shared-package consumers and baseline tests without copying renderer source. |
| `@datapass/ui` V2 catalog additions | React + Fluent generic UI. Pure catalog-state helpers are headless; only the browser adapter/hook use browser history. No Monaco or ConceptMotion semantic dependency. | Generic explorer primitives and URL-state helpers, not project-specific registry logic. |

## `@datapass/content`

Entry point: `project/conceptmotion_studio/packages/content/src/index.ts`.

### Serializable contracts

- Common content and source types: `ContentId`, `LicenseInfo`, `ContentSource`.
- Figure types: `FigureKind`, `FigureProfile`, `FigureSpec`.
- Runtime-target types: `RuntimeTargetKind`, `RuntimeTargetId`, `RuntimeTarget`.
- Notebook provenance and cell types: `NotebookProvenance`, `NotebookCellBase`, `CodeCellProvenance`, `MarkdownCell`, `CodeCell`, `TextOutputCell`, `TableOutputCell`, `MediaReference`, `ImageOutputCell`, `FigureCell`, `CalloutCell`, `ExerciseCell`, `NotebookCell`, `NotebookSpec`.
- Course types: `LessonSpec`, `CourseModule`, `CourseSpec`.
- Assessment types: `AssessmentMode`, `QuestionType`, `QuestionDifficulty`, `QuestionOption`, `CodeQuestionOption`, `FigureQuestionOption`, `MatchingPair`, `QuestionSpecBase`, `SingleChoiceQuestion`, `MultipleChoiceQuestion`, `TrueFalseQuestion`, `OrderingQuestion`, `MatchingQuestion`, `CodeChoiceQuestion`, `FigureChoiceQuestion`, `QuestionSpec`, `AssessmentSpec`.
- Registry and app types: `ProjectStatus`, `ProjectRecord`, `ProjectRegistry`, `AppPreset`, `AppRecipe`, `ContentCatalog`.
- Vocabulary/article types: `VocabularyEntry`, `VocabularyTopic`, `ArticleLesson`.
- JSON types: `JsonPrimitive`, `JsonValue`.
- Locale types and constants: `Locale`, `LocalizedText`, `SUPPORTED_LOCALES`.

`ContentCatalog.version` is the literal `"2"`. Notebook code/exercise execution fields describe intent (`none`, `external`, or a possible future browser adapter); they do not provide an execution engine.

### JSON, localization, and serialization

- `toCanonicalJsonValue(value)` converts supported data to recursively key-sorted JSON data and rejects non-JSON/cyclic input.
- `serializeDeterministic(value, space?)` emits deterministic JSON.
- `parseJson(source)` parses unknown JSON data.
- `isLocalizedText(value)` and `resolveLocalizedText(value, locale?)` validate and resolve the small EN/NO localization contract.
- `serializeContentCatalog(catalog, space?)` validates and deterministically serializes a catalog.
- `parseContentCatalog(source)` parses and validates a catalog.

### Validation

Validation result exports are `ContentValidationSeverity`, `ContentValidationIssue`, and `ContentValidationResult`.

The package exports focused validators:

- `validateContentSource`
- `validateFigureSpec`
- `validateRuntimeTarget`
- `validateNotebookSpec`
- `validateLessonSpec`
- `validateCourseSpec`
- `validateQuestionSpec`
- `validateAssessmentSpec`
- `validateProjectRecord`
- `validateAppRecipe`
- `validateVocabularyEntry`
- `validateVocabularyTopic`
- `validateArticleLesson`
- `validateContentCatalog`

Supporting exports are `formatContentValidationIssues`, `assertValidContentCatalog`, `isQuestionSpec`, and `isNotebookCell`. Catalog validation also checks duplicate IDs and cross-references among sources, figures, notebooks, lessons, assessments, questions, projects, runtime targets, vocabulary, articles, and declared challenge IDs.

## `@datapass/notebook-import`

Entry point: `project/conceptmotion_studio/packages/notebook-import/src/index.ts`.

### Import API

- `NOTEBOOK_IMPORTER_VERSION` is the literal `"2.0.0"`.
- `importIpynb(source, options)` returns a structured `NotebookImportResult`; malformed or unsafe input is reported through deterministic issues rather than executed.
- `assertImportedNotebook(source, options)` returns a `NotebookSpec` or throws a formatted import error.
- `extractDeepnoteSql(source)` conservatively extracts the first literal SQL argument from one complete `_dntk.execute_sql(...)` wrapper and otherwise returns a safe fallback status.
- `detectNotebookLanguage(metadata, fallback?)` and `detectCodeCellLanguage(source, metadata, notebookLanguage)` normalize notebook/cell language metadata.

### Types

- Import diagnostics and results: `NotebookImportSeverity`, `NotebookImportIssue`, `NotebookImportResult`.
- Inputs/options: `NotebookImportOptions`, `NotebookLocalMediaInput`.
- Deterministic media: `ImportedMediaAsset`.
- Deepnote extraction: `DeepnoteSqlExtractionStatus`, `DeepnoteSqlExtraction`.

The importer accepts notebook JSON and optional local-media payloads from its caller. It never invokes `eval`, a kernel, Spark, SQL, or Python; saved outputs are labeled as reference outputs. Media paths, SHA-256 values, cell IDs, issues, and canonical JSON are deterministic.

## `@datapass/code`

Entry point: `project/conceptmotion_studio/packages/code/src/index.ts`.

### Components

- `CodeEditor` — controlled Monaco editor surface.
- `CodeDiff` — original/modified Monaco diff surface.
- `JsonSpecEditor` — JSON editor with caller-supplied diagnostics and optional local JSON schema.

All three components lazy-load the shared `MonacoSurfaces` implementation when mounted. Importing the package alone does not authorize or provide code execution.

### Language, options, and theme API

- Language exports: `codeLanguages`, `resolveMonacoLanguage`, `CodeLanguageId`, `CodeLanguageMetadata`.
- Option exports: `commonCodeEditorOptions`, `commonCodeDiffOptions`, `mergeCodeEditorOptions`, `mergeCodeDiffOptions`, `CodeEditorOptions`, `CodeDiffOptions`.
- Theme exports: `DATAPASS_MONACO_LIGHT_THEME`, `defaultDatapassMonacoThemeTokens`, `createDatapassMonacoTheme`, `resolveCodeTheme`, `CodeTheme`, `DatapassMonacoThemeTokens`.
- Diagnostics/schema types: `CodeMarker`, `CodeDiagnostic`, `JsonSchemaHook`.
- Component props: `CodeEditorProps`, `CodeDiffProps`, `JsonSpecEditorProps`.

JSON schemas are handed to Monaco's local JSON worker and are not fetched. Supported language metadata maps Bash, BigQuery SQL, C#, DAX, JSON, pandas, plain text, PowerShell, PySpark, Python, shell, SQL, and T-SQL to display/editing modes; every entry is non-executable.

## `@datapass/figure`

Entry point: `project/conceptmotion_studio/packages/figure/src/index.ts`.

- `FigureRendererRegistry` provides `register`, `replace`, `get`, `has`, and sorted `ids` operations.
- `createDefaultFigureRendererRegistry()` creates the production registry.
- `FigureView` resolves an application `FigureSpec`, validates its adapter, and preserves `FigureFrame` title, metadata, source IDs, verified date, fallback, and reduced-motion/static state.
- Types: `FigureRenderContext`, `FigureRendererAdapter`, `FigureViewProps`.

The default factory registers `table.transform`, `table.join`, `algorithm.loop`, `statistics.regression`, `diagram.flow`, `lineage.model`, `workflow.topology`, `workflow.run`, `static.text`, and `static.image`. Custom adapters own only validation and rendering; canonical geometry and semantic compilation do not move into this package.

## `@datapass/progress`

Entry point: `project/conceptmotion_studio/packages/progress/src/index.ts`.

### Schema and constants

- `PROGRESS_SCHEMA_VERSION` is `2`.
- `DEFAULT_PROGRESS_STORAGE_KEY` is `datapass:progress:v2`.
- Migration source keys are `LEGACY_CHALLENGE_DRAFTS_KEY` and `LEGACY_CHALLENGE_PROGRESS_KEY`.
- Status/value types: `ChallengeStatus`, `LessonStatus`, `AssessmentAttemptStatus`, `AssessmentAnswerValue`.
- State types: `ChallengeProgress`, `LessonPosition`, `LessonProgress`, `AssessmentAnswer`, `AssessmentScore`, `AssessmentAttempt`, `AssessmentProgress`, `ProgressStateV2`, `ProgressBreakdownMetric`, `ProgressBreakdown`.
- `createEmptyProgressState()` creates a valid empty V2 state.

### Immutable operations

- `setChallengeDraft`
- `updateChallengeProgress` with `ChallengeProgressPatch`
- `updateLessonProgress` with `LessonProgressPatch`
- `createAssessmentScore`
- `appendAssessmentAttempt`
- `computeProgressBreakdown`

### Migration, persistence, and JSON

- V1.1 migration: `parseLegacyProgressJson`, `migrateV11ChallengeState`, `migrateV11ChallengeJson`, plus `LegacyChallengeFlags` and `LegacyChallengeSnapshot`.
- Storage boundary: `ProgressStorageLike`, `ProgressStorageAdapter`, `MemoryProgressStorageAdapter`, `createGuardedStorageAdapter`, `createMemoryProgressStorage`.
- Store: `ProgressStore`, `ProgressStoreOptions`, `ProgressLoadSource`, `ProgressLoadResult`, `ProgressImportResult`.
- JSON: `serializeProgressState`, `parseProgressState`, and aliases `exportProgressJson`, `importProgressJson`.
- Validation: `ProgressValidationSeverity`, `ProgressValidationIssue`, `ProgressValidationResult`, `validateProgressState`, `formatProgressValidationIssues`, `assertValidProgressState`.

`ProgressStore` reads V2 first and can deterministically migrate the two v1.1 keys without deleting them. Browser `localStorage` is an application choice passed through `createGuardedStorageAdapter`; memory and other adapters remain supported. There is no remote persistence or identity model.

## `@datapass/learning`

Entry point: `project/conceptmotion_studio/packages/learning/src/index.ts`. Importing the root entry also imports the package stylesheet; `@datapass/learning/styles.css` is an explicit CSS subpath.

### Assessment

- `AssessmentRunner`, `AssessmentRunnerProps`
- `evaluateQuestion`, `QuestionEvaluation`
- `gradeAssessment`, `AssessmentSubmission`

The runner supports every `QuestionSpec` variant. Practice mode can reveal per-answer feedback; mock-exam correctness remains deferred until submission.

### Guided exercises and notebooks

- `GuidedExercise`, `GuidedExerciseProps`, `GuidedExerciseStep`
- `NotebookCell` (alias of `NotebookCellView`), `NotebookCellView`, `NotebookCellViewProps`
- `NotebookLesson`, `NotebookLessonProps`
- `isSafeNotebookMediaSource`, `parseSafeMarkdown`

Notebook rendering supports structured Markdown, code, reference text/table/image outputs, figures, callouts, and exercises. `GuidedExercise` implements Try → Hint → Reveal → Compare using the shared code surfaces and exposes no Run action.

### Progress, runtime links, and localization

- `ProgressSummary`, `ProgressSummaryProps`, `ProgressSummaryScope`, `ProgressSummarySnapshot`, `summarizeProgress`
- `RuntimeLauncher`, `RuntimeLauncherProps`, `RuntimeTargetValidation`, `validateRuntimeTarget`
- `LearningLocale`, `resolveLearningText`, `resolveOptionalLearningText`

`RuntimeLauncher` validates configured local download paths or absolute credential-free HTTPS destinations. An external destination may execute under that service's controls, but the component itself only renders links/downloads.

## `@datapass/scaffold`

Entry point: `project/conceptmotion_studio/packages/scaffold/src/index.ts`.

- `APP_PRESETS`: `knowledge`, `learning`, `catalog`, and `portfolio-hub`.
- `createAppRecipe(preset, name?)` returns a deterministic `ScaffoldRecipe`.
- `generateAppFiles(options)` returns a sorted `GeneratedAppFiles` record without writing it.
- `validateAppName(value)` enforces a safe lowercase kebab-case direct app name.
- Types: re-exported `AppPreset`, `ScaffoldRecipe`, `GenerateAppOptions`, `GeneratedAppFiles`.

The separate workspace command `pnpm scaffold:app --name <name> --preset <preset>` owns filesystem creation under `apps/`. Generated applications compose workspace packages, Fluent, React, and Vite; they include deterministic source plus baseline accessibility/layout smoke tests. The generator does not copy ConceptMotion renderer source.

## `@datapass/ui` V2 catalog and explorer additions

Entry point: `project/conceptmotion_studio/packages/ui/src/index.ts`. Styles remain available at `@datapass/ui/styles.css`.

### URL-backed catalog state

- State/types: `CatalogViewMode`, `CatalogUrlState`, `CatalogUrlConfig`, `CatalogUrlAdapter`, `UseCatalogUrlStateOptions`, `CatalogItemAccessors`.
- Deterministic helpers: `normalizeCatalogUrlState`, `parseCatalogUrlState`, `serializeCatalogUrlState`, `setCatalogQuery`, `setCatalogSort`, `setCatalogView`, `setCatalogFacetValues`, `toggleCatalogFacetValue`, `filterAndSortCatalogItems`.
- Browser integration: `createBrowserCatalogUrlAdapter`, `useCatalogUrlState`.

The parse/normalize/serialize/filter helpers are deterministic and injectable. The default browser adapter uses `window.location`, History `replaceState`, and `popstate`; callers can provide another adapter or no adapter.

### Explorer components

- `CatalogView`, `CatalogViewProps`
- `EntityCard`, `EntityCardProps`
- `EntityTable`, `EntityTableProps`, `EntityTableColumn`
- `Metric`, `MetricProps`, `MetricTone`
- `MetricStrip`, `MetricStripProps`, `MetricItem`
- `FacetFilter`, `FacetFilterProps`, `FacetFilterOption`
- `SortControl`, `SortControlProps`, `SortOption`
- `ViewToggle`, `ViewToggleProps`, `ViewToggleOption`
- `TagList`, `TagListProps`, `TagListItem`
- `DetailDrawer`, `DetailDrawerProps`
- `FreshnessStamp`, `FreshnessStampProps`

`CatalogView` composes the retained `CatalogShell` and `SearchFilterBar` exports. Registry data, routes, and project-specific card content remain application concerns.

## Stability and extension rules

- Stable content, feature, source, figure, lesson, question, assessment, project, runtime-target, and progress IDs are the interoperability mechanism. Renaming an ID is a data migration, not presentation cleanup.
- Deterministic serializers and importer output are suitable for checked-in fixtures and diffs. Wall-clock timestamps enter only when explicitly supplied by the caller.
- `FigureSpec` and notebook/course/assessment/project contracts are the portable layer. React nodes, Monaco instances, Fluent components, provider SDK objects, and browser objects do not belong in those contracts.
- Figure renderer IDs are registry keys. New renderers should be added through an adapter; application specs must not hard-code vendor asset paths or renderer coordinates as shared application state.
- The progress schema and storage key are explicitly versioned. Future changes require validated migration rather than a parallel storage system.
- The packages are private workspace APIs at V2. Breaking changes may still occur before a separately reviewed publication contract exists.

## Explicit non-claims

Foundation V2 does **not** provide:

- Spark or PySpark execution;
- Python or SQL execution, or a universal code judge;
- Jupyter kernels, JupyterLab, or kernel gateway integration;
- live source monitoring, crawling, or automatic source refresh;
- cloud sync, user accounts, authentication, or remote progress storage;
- npm publication of any workspace package.

Saved notebook outputs are source evidence, not fresh execution results. External runtime targets are validated links or downloads only.
