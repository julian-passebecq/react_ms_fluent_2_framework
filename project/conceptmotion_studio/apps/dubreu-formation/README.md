# Dubreu Formation

Dubreu Formation is the Foundation V2 reference learning consumer. It proves that a focused course site can be assembled from shared Datapass contracts and Fluent surfaces without copying framework code into the application.

## Implemented proof

- a structured course catalog for Python, SQL, advanced SQL, and PySpark;
- deterministic SQL and PySpark `.ipynb` imports plus original-source downloads;
- a Python lesson and advanced SQL exercise backed by versioned local fixtures;
- notebook rendering for the concrete Markdown, code, saved reference-output, figure, and exercise fixtures through the shared cell contract;
- a ConceptMotion SQL-filter figure embedded through a `FigureCell`;
- shared lazy Monaco for editable Try → Hint → Reveal → Compare exercises and solution diffs;
- a mixed QCM assessment with single-choice, true/false, and code-choice questions;
- browser-local lesson, challenge, and assessment progress with JSON import/export and reset;
- small EN/NO application chrome and responsive desktop/phone layouts;
- explicit download and external-runtime targets with provenance and requirements.

The private Dubreu course corpus was not included in the supplied attachments. The app therefore uses clearly attributed original representative fixtures and does not claim private-course conversion.

## Runtime boundary

Python, SQL, and PySpark are presented for reading, explanation, editing, and text comparison. Saved outputs are labeled as reference output from the source material.

This application does **not** execute Python, SQL, Spark, or notebooks. It includes no Spark runtime, Jupyter kernel, Databricks execution, or universal code judge. The Colab target opens an external service; downloads are inert source files, and the learner decides whether and where to run them.

## Shared packages

The consumer composes:

- `@datapass/content` for the validated catalog, courses, notebooks, figures, questions, assessments, and runtime targets;
- `@datapass/notebook-import` indirectly through the deterministic workspace import script;
- `@datapass/learning` for notebook, guided exercise, assessment, runtime, and progress presentation;
- `@datapass/code` for the lazy editor/diff boundary;
- `@datapass/figure` and ConceptMotion for semantic figures;
- `@datapass/progress` for schema-v2 local state;
- `@datapass/ui` and Fluent v9 for the application shell and controls.

The source catalog is validated on module load. Imported artifacts live in `src/generated`; downloadable originals live in `public/notebooks`. Edit the source fixtures and rerun the importer instead of hand-editing generated notebook JSON.

## Run and verify

Run these commands from `project/conceptmotion_studio`:

```bash
pnpm run import:reference
pnpm run dev:consumer
```

Production and full validation commands are:

```bash
pnpm run build:consumer
pnpm run test:browser
pnpm run check
```

The development route is hash-based:

- `#/catalog`
- `#/lesson/<stable-lesson-id>`
- `#/practice`
- `#/progress`

Progress uses the guarded V2 storage model; the default shared key is `datapass:progress:v2`. It remains local unless explicitly exported by the learner.
