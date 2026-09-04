# V2 implementation plan

## Phase 0 — verify baseline

Before editing:

1. confirm main baseline commit or reconcile if newer;
2. run `pnpm install --frozen-lockfile`;
3. run `pnpm run check`;
4. save baseline bundle/chunk sizes;
5. inspect existing public package exports and browser screenshots.

Do not begin V2 if the baseline is already failing without documenting the pre-existing failure.

## Phase 1 — editor/performance hardening

- introduce shared lazy Monaco adapter (`@datapass/code` or equivalent);
- migrate Challenge and Workflow to it;
- lazy-load heavy route pages;
- preserve editor behavior and tests;
- add bundle/load assertions.

This phase should reduce the cost of every future consumer.

## Phase 2 — pure content contracts

Add a pure content package or equivalent for:

- FigureSpec;
- NotebookSpec;
- CourseSpec / LessonSpec;
- AssessmentSpec / QuestionSpec;
- ProjectRecord / AppRecipe if it keeps boundaries clean.

Add validators and deterministic serialization.

Do not move ConceptMotion renderer internals into the content package.

## Phase 3 — Figure bridge

- create application-facing Figure renderer registry;
- register existing ConceptMotion renderer families through a thin adapter;
- reuse existing `FigureFrame`;
- support static/image fallback;
- prove a Figure can be embedded in Knowledge, Notebook and Assessment without those systems knowing renderer geometry.

## Phase 4 — Notebook/Course importer

Implement deterministic `.ipynb` import:

- Markdown/code/reference outputs/media;
- provenance/source hash;
- safe HTML handling;
- Deepnote SQL extraction;
- warnings;
- deterministic output;
- tests.

Add one small mapping/config mechanism for course/module/lesson organization.

## Phase 5 — Dubreu Formation reference consumer

Create the app through the new scaffold if possible.

Required representative routes/states:

- course catalog;
- SQL lesson;
- advanced SQL challenge;
- Python/notebook lesson;
- PySpark display-only lesson;
- practice/QCM/progress.

Use actual supplied content only when source attachments are available. Otherwise create minimal representative fixtures plus import instructions; do not invent the whole source corpus.

## Phase 6 — Assessment + progress

- unify/migrate local Challenge progress;
- add assessment attempts/results;
- implement practice and mock-exam behaviors;
- expose local JSON export/import if practical;
- add a small Dubreu assessment proof.

## Phase 7 — Catalog / Project Hub / scaffold

- complete Explorer primitives;
- Project Registry;
- Project Hub proof;
- deterministic AppRecipe/scaffold command;
- generated smoke app.

## Phase 8 — Storybook + CI

- add Golden Gallery stories;
- add GitHub Actions CI;
- keep existing local `check` gate;
- add Storybook build/smoke if stable.

## Phase 9 — optional layout/runtime stretch

Only after all required gates pass:

- optional ELK layout adapter behind existing layout contract;
- or a single browser SQL execution proof using DuckDB-WASM.

Do not implement both just to increase scope. Prefer the feature that best validates current consumer needs.

Pyodide, Spark Connect, Jupyter gateway, live monitoring and external backends remain deferred.

## Migration discipline

- preserve v1.1 API where reasonable;
- document all new exports;
- avoid renaming stable v1.1 types without a compelling reason;
- add migration aliases if changing local storage keys;
- do not rewrite legacy renderer families in this pass.
