# CODEX MASTER PROMPT — Datapass Visual Platform V2 post-v1 audit

You are extending an already-completed Foundation v1.1 repository. **Do not rebuild it.**

Baseline repository: `julian-passebecq/react_ms_fluent_2_framework`
Audited baseline commit: `d4435f55eb64eb02147e8ff0d51e3014c189fa75`
Main workspace: `project/conceptmotion_studio`

Read `START_HERE.md` and `V1_POST_IMPLEMENTATION_AUDIT.md` before touching code.

## 1. Mission

Convert the successful v1.1 foundation into a genuinely reusable consumer-app platform.

The first serious proof consumer is **Dubreu Formation**, a Fluent learning site built from supplied Python/SQL/PySpark course/notebook content.

The key product requirement is:

> The learner experience must be more useful and friendlier than opening random Jupyter/Deepnote notebooks. Use the shared Fluent workbench, Monaco, ConceptMotion figures, hints, solution diff, QCM and progress. PySpark notebooks are displayed/explained but are NOT executed in the website.

V2 is not a new visualization engine. It is the composition/productization layer that proves the v1.1 architecture is reusable.

## 2. Preserve v1.1

Before editing, run the existing complete gate. The following behavior must remain working:

- pure `@conceptmotion/core`;
- framework-neutral `@conceptmotion/svg`;
- thin `@conceptmotion/react`;
- Fluent `@datapass/ui`;
- pure `@datapass/knowledge`;
- stable entity identity/transitions;
- deterministic SVG freeze/export;
- table/join/loop/regression/diagram/lineage/workflow renderers;
- Challenge Workbench;
- Workflow Workbench;
- Knowledge Atlas;
- EN/NO infrastructure;
- reduced motion/accessibility;
- preserved legacy application/build/tests.

Do not weaken these to make V2 easier.

## 3. Fix the two biggest implementation gaps first

### 3.1 Monaco loading and duplication

The current app statically imports all route pages. Challenge and Workflow directly import `@monaco-editor/react`, and the existing build reports a very large Monaco chunk.

Required:

- create one reusable lazy code-editor adapter (`@datapass/code` or equivalent clean package/module);
- provide `CodeEditor`, `CodeDiff`, and `JsonSpecEditor`;
- migrate Challenge and Workflow to it;
- lazy-load heavy route pages/surfaces;
- prove Catalog and Knowledge can load without requesting Monaco;
- keep Monaco out of `@datapass/ui`;
- document actual before/after bundle results.

### 3.2 Serializable Figure/content contract

The existing `FigureFrame` is good renderer-neutral UI chrome but there is no serializable application-level `FigureSpec`.

Required:

- add a pure content contract package or equivalent clean pure TypeScript location;
- add `FigureSpec` with stable ID, renderer ID, metadata, fallback text, source/concept/feature IDs and static/reduced-motion state metadata;
- add an application-facing Figure renderer registry/adapter layer;
- bridge existing ConceptMotion renderers through it;
- keep renderer algorithms separate;
- keep `FigureFrame` rather than replacing it.

## 4. Add the content composition layer

Implement pure validated contracts for:

- `CourseSpec`;
- `CourseModule`;
- `LessonSpec`;
- `NotebookSpec`;
- notebook cell unions;
- `AssessmentSpec` / `QuestionSpec`;
- `ProjectRecord` / AppRecipe if this is the cleanest place without creating a dumping ground.

Pure contracts must not depend on React, Fluent, Monaco, browser DOM or runtime providers.

## 5. Build a deterministic `.ipynb` importer

The importer is a V2 core deliverable.

Required:

- parse notebook JSON without executing it;
- deterministic IDs and JSON output;
- source file/SHA provenance;
- Markdown cells;
- code cells;
- static/reference text/table/image outputs;
- deterministic local media handling;
- safe raw HTML handling;
- warnings for unsupported MIME types;
- tests for malformed notebooks;
- unchanged source reimport produces stable output.

### Deepnote SQL special handling

The supplied SQL course notebooks contain Deepnote wrapper cells such as `_dntk.execute_sql(...)`.

Implement a conservative **build-time** extractor that exposes the embedded SQL string as the learner-facing code when the wrapper is unambiguous.

- do not `eval`;
- preserve original source in provenance/debug metadata;
- fallback to the original source if extraction fails;
- test multiline SQL, quotes, comments and incomplete exercise placeholders.

This is important: learners should see the SQL, not Deepnote plumbing.

## 6. Build the Dubreu Formation reference consumer

Create it through the new shared architecture, preferably using the AppRecipe/scaffold path once that exists.

The site should be course-first rather than LeetCode-first.

Required representative IA:

- Python;
- SQL Course;
- SQL Advanced;
- PySpark;
- Practice/Review.

Required lesson experience:

```text
objective / explanation
        |
compact source example
        |
ConceptMotion explanation when useful
        |
Try in Monaco
        |
Hint -> Reveal -> Compare
        |
QCM / progress / next lesson
```

### PySpark rule

PySpark notebooks are display-only in the site for V2.

Allowed:

- render prose/code/reference outputs;
- ConceptMotion Spark concepts;
- QCM;
- copy code;
- download original notebook;
- configured external runtime launch links.

Forbidden:

- starting Spark;
- proxying Spark;
- Jupyter kernel management;
- pretending saved outputs are freshly executed;
- fake run buttons.

### SQL/Python pedagogy

Use the v1.1 visual work where appropriate.

Examples:

- SQL WHERE -> animated row filtering;
- ORDER BY -> stable row movement;
- GROUP BY -> grouping/aggregation animation;
- joins -> match/fanout/unmatched rows;
- CASE WHEN -> branch/classification;
- window functions -> moving/partition frame;
- rank/lag -> row reference/ranking state;
- Python loops -> current index/item;
- dict/list -> key/value/current element;
- pandas -> before/after dataframe transformations.

Do not animate every paragraph. Animation must explain causality/state.

## 7. Assessment + shared progress

Add QCM/practice/mock/interview foundations.

Required question types:

- single choice;
- multiple choice;
- true/false;
- ordering;
- matching;
- code choice;
- figure/architecture choice when useful.

Reuse/migrate current Challenge local state. Do not create an unrelated second storage system.

Required progress/attempt data:

- challenge drafts/mastered/review/flagged;
- lesson completion/recent position;
- assessment attempts/answers/scores;
- domain/concept breakdown;
- versioned local storage;
- deterministic migration from v1.1 keys.

No account/backend sync.

## 8. Catalog / Project Hub / app scaffolding

Extend the current basic Catalog shell into generic explorer primitives:

- EntityCard;
- Metric / MetricStrip;
- FacetFilter;
- SortControl;
- ViewToggle;
- TagList;
- thin DataGrid/table wrapper;
- DetailDrawer/Inspector composition;
- FreshnessStamp;
- URL-backed search/filter/sort state.

Add a canonical Project Registry and a Project Hub proof.

Add a tiny deterministic scaffold command/preset system for:

- `knowledge`;
- `learning`;
- `catalog`;
- `portfolio-hub`.

Generated apps must compose workspace packages and must not copy/fork renderer code.

## 8A. Vocabulary / article content

Keep the previously planned lightweight `VocabularyEntry`, `VocabularyTopic` and `ArticleLesson` contracts in the pure content layer so the Norwegian vocabulary/article site can be built quickly after V2. Add only contracts + a small fixture/story in this pass; do not build the full Norwegian site before the Dubreu/reference-platform gates pass.

## 9. Storybook Golden Gallery

Add Storybook and canonical production stories so humans/coding agents can discover approved components.

Required story families include:

- shell/navigation;
- catalog/explorer;
- FigureFrame/Figure;
- ConceptMotion table/join/loop/regression/lineage/workflow;
- CodeEditor/CodeDiff;
- Challenge states;
- Notebook lesson;
- Assessment question/results;
- Knowledge article;
- Project Hub;
- EN/NO;
- reduced motion;
- mobile widths.

Production code must not depend on Storybook.

## 10. CI and QA

Add GitHub Actions CI for at least:

- frozen install;
- typecheck;
- unit tests;
- boundary audit;
- production build;
- legacy build/smoke;
- Chrome browser smoke where practical.

Preserve local `pnpm run check` as the authoritative full gate.

Add V2 browser tests for Dubreu lesson, PySpark no-execution state, assessment and Project Hub/scaffold proof.

## 11. Layout improvement is optional after required work

The current deterministic layered layout is intentionally simple. If all required V2 work passes, add an optional ELK adapter behind the existing layout contracts for complex diagrams.

Do not replace current simple layout; preserve it as the light deterministic option.

Do not make React Flow node objects canonical.

## 12. Runtime/tool boundaries

Do not implement these as required V2 systems:

- JupyterLab;
- Jupyter kernel gateway;
- Spark execution;
- Spark Connect;
- Databricks execution;
- Streamlit main UI;
- FastAPI mandatory backend;
- Voila/Mercury servers;
- SQL/Python universal judge;
- cloud accounts/auth;
- live source crawling/monitoring;
- D3 SDK v2/Power BI/GeoStory rewrite;
- Data Forge backend.

A small `RuntimeLauncher` may safely open configured external URLs or downloads.

Browser DuckDB-WASM or Pyodide is a **stretch only after every required gate passes**. If implemented, keep it lazy and behind an `ExecutionAdapter`; the site must remain useful without it.

## 13. Source attachments

This handoff contains source manifests, not the private/full course payloads. If the actual training attachments are available in the working directory, use them according to `reference_material/DUBREU_SOURCE_MANIFEST.md` and `reference_material/PYSPARK_SOURCE_MANIFEST.md`.

Do not invent missing private curriculum content.

Select Star SQL source notes include its stated license requirements. Preserve attribution/share-alike obligations for adapted prose.

## 14. Required reports

Return:

- `V2_TEST_REPORT.md` — exact commands/results;
- `V2_AUDIT_SELF_REVIEW.md` — unresolved limitations/deferred scope;
- `V2_MIGRATION_LOG.md` — API/storage/content migrations;
- `V2_API_SURFACE.md` — new public contracts/components;
- `V2_BUNDLE_REPORT.md` — actual chunk/load behavior before/after;
- `V2_CONSUMER_VALIDATION.md` — Dubreu + scaffold/Project Hub proof.

## 15. Definition of done

V2 is done when:

1. v1.1 still passes;
2. Monaco is shared/lazy;
3. Figure/content/course/notebook/assessment contracts are reusable;
4. notebooks import deterministically without execution;
5. Dubreu proves a real learning consumer is friendlier than raw notebooks;
6. PySpark is truthfully display-only;
7. project/catalog/app scaffolding makes the next small site cheap;
8. Storybook/CI make reuse sustainable;
9. no new framework/runtime has contaminated the semantic core.
