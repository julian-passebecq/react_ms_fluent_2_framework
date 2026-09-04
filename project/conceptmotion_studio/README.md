# Datapass Visual Platform / ConceptMotion Studio

This directory is the runnable **V3 consumer-expansion** workspace. V3 extends the completed Foundation v1.1 baseline with reusable content, notebook, figure, learning, progress, catalog, and application-scaffold contracts. It does not restart or replace the v1.1 semantic/rendering foundation.

The default application is the TypeScript/Fluent Studio in `apps/studio`. `apps/formation` is the first serious proof consumer. The earlier JavaScript/D3 Studio in `src` remains available through the legacy commands.

## What V3 adds

Seven application entry points share the existing platform. Formation gains Think in SQL and Think in Python for Data Engineering; Code Sandbox migrates all 323 pinned source items without the old UI; Code Interview provides a distinct session/review flow. Algorithm Atlas shares 30 semantic Figure artifacts with learning consumers. Architecture Atlas and Pilot Center reuse the same deterministic radial/layered Diagram layout. Studio gains a production Visual Sandbox route.

The canonical public registry is `content/projects.registry.json`; shared visual artifacts and attribution live in `content/visuals`. The practice snapshot, hash manifest and licenses live in `content/practice`. No consumer data is imported into reusable packages.

Run the new consumers with `dev:code-sandbox`, `dev:code-interview`, `dev:algorithm-atlas`, `dev:architecture-atlas` and `dev:pilot-center` (ports 4176–4180). `build:v3` builds all five and audits all six non-Studio consumer manifests. `test:practice-import` checks exact deterministic output. `test:unit` enforces separate coverage floors for six pure packages. Full commands and eight V3 reports are linked from the [repository README](../../README.md).

## Preserved V2 foundation

- one shared, lazy `@datapass/code` boundary for Monaco editor, JSON editor, and diff surfaces;
- serializable `FigureSpec`, course, lesson, notebook-cell, assessment, project, runtime-target, vocabulary, and article contracts in pure `@datapass/content`;
- a deterministic, non-executing `.ipynb` importer with source hashes, stable cell IDs, saved-output provenance, safe media handling, and Deepnote SQL wrapper extraction;
- a renderer-adapter registry in `@datapass/figure`, keeping `FigureFrame` and content specs renderer-neutral;
- reusable notebook lessons, guided Try → Hint → Reveal → Compare exercises, assessment UI, runtime launchers, and progress summaries in `@datapass/learning`;
- versioned local progress, V1.1 challenge migration, assessment attempts, and domain/concept breakdowns in pure `@datapass/progress`;
- a validated Project Registry, Project Hub, URL-backed catalog/explorer primitives, and deterministic app recipes;
- a Storybook Golden Gallery and repository CI for the preserved and new gates.

## Workspace boundaries

| Package | Boundary |
| --- | --- |
| `@conceptmotion/core` | Preserved v1.1 pure TypeScript semantics. No React, Fluent, Monaco, browser DOM, D3, or product host APIs. |
| `@conceptmotion/svg` | Preserved v1.1 browser SVG lifecycle, keyed updates, layouts, themes, renderer registry, and freeze/export. Depends only on core. |
| `@conceptmotion/react` | Preserved thin React host for ConceptMotion renderers and reduced-motion behavior. |
| `@datapass/knowledge` | Preserved v1.1 pure source/feature/content/change contracts. No React, Fluent, DOM, fetch, crawler, or AI dependency. |
| `@datapass/content` | Pure serializable V2 content contracts, validation, localization, and canonical JSON. No UI, DOM, Monaco, fetch, or runtime execution. |
| `@datapass/notebook-import` | Pure deterministic `.ipynb` conversion into content contracts. It parses files and saved outputs; it never runs cells. |
| `@datapass/code` | The shared lazy Monaco boundary for challenge/spec editing and diff surfaces. Monaco does not belong to `@datapass/ui`. |
| `@datapass/figure` | React adapter registry that maps `FigureSpec.rendererId` to ConceptMotion, workflow, or safe static renderers. |
| `@datapass/progress` | Pure versioned progress state, migration, serialization, operations, and guarded storage adapters. |
| `@datapass/learning` | Fluent/React notebook, exercise, assessment, progress, and external-runtime presentation components. |
| `@datapass/ui` | Fluent v9 shell, explorer/catalog, Knowledge Atlas, challenge/workflow, and renderer-neutral figure primitives. |
| `@datapass/scaffold` | Deterministic recipes and generated files for `knowledge`, `learning`, `catalog`, and `portfolio-hub` applications. |

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for dependency direction and lifecycle details. The repository-level [`V2_API_SURFACE.md`](../../V2_API_SURFACE.md) records the public exports; [`V1_API_SURFACE.md`](../../V1_API_SURFACE.md) remains the historical v1.1 record.

## Applications

### Studio

The Studio keeps every v1.1 surface and adds the V2 Project Hub:

- **Catalog** — searchable demonstration inventory; it loads without Monaco.
- **Workbench** — table filtering/sorting with stable identity, timeline, and inspector.
- **Explainers** — joins, loops, regression, data/control flow, model lineage, and column lineage.
- **Workflow** — one provider-neutral workflow model, deterministic run playback, and a lazy JSON spec editor.
- **Challenge** — progressive hints, ConceptMotion explanation, lazy code/solution/diff surfaces, and migrated local progress.
- **Knowledge Atlas** — local source/status/version/change fixtures and deterministic impact resolution; it loads without Monaco.
- **Project Hub** — validated, source-controlled destinations with search, facets, sort/view state, and direct links. Registry status is metadata, not live monitoring.

### Formation

`apps/formation` demonstrates Python, SQL, advanced SQL, and display-only PySpark lessons using the shared content and learning packages. It includes imported notebooks, a ConceptMotion figure embedded as a notebook cell, editable guided exercises, QCM/assessment, local progress import/export/reset, original-source downloads, and an optional external Colab link.

The available source attachments did not include the private Dubreu course corpus. The consumer therefore uses clearly attributed original representative fixtures rather than claiming conversion of unavailable material.

PySpark, Python, and SQL are **display, explanation, editing, and text comparison only** inside the site. Saved outputs are labeled reference evidence. There is no Spark execution, Python/SQL execution, Jupyter kernel, universal judge, or hidden runtime.

See [`apps/formation/README.md`](apps/formation/README.md) for consumer details.

## Requirements and commands

Use Node 22.12 or later and pnpm 11. Run commands from this directory.

```bash
pnpm install --frozen-lockfile
pnpm run check
```

| Command | Purpose |
| --- | --- |
| `pnpm run dev` | Run the V3 Studio. |
| `pnpm run dev:consumer` | Deterministically import reference notebooks, then run Formation. |
| `pnpm run dev:legacy` | Run the preserved JavaScript/D3 Studio. |
| `pnpm run storybook` | Run the Storybook Golden Gallery on port 6006. |
| `pnpm run import:reference` | Rebuild canonical Dubreu notebook JSON and public source downloads without execution. |
| `pnpm run typecheck` | Import reference notebooks, then type-check all workspace references. |
| `pnpm run test:unit` | Run the coverage-enabled unit and component suites. |
| `pnpm run test:legacy` | Run preserved catalog, scene, data, generator, handoff, and Python smoke tests. |
| `pnpm run check:boundaries` | Reject forbidden package dependencies and imports. |
| `pnpm run test:scaffold` | Generate, test, type-check, and build the app recipe proofs. |
| `pnpm run test:bundle` | Assert route/Monaco chunk boundaries in the Studio manifest. |
| `pnpm run build` | Type-check and build the Studio, then run bundle assertions. |
| `pnpm run build:consumer` | Import reference notebooks and build Formation. |
| `pnpm run build:legacy` | Build the preserved legacy application into `dist-legacy`. |
| `pnpm run build:storybook` | Build the Golden Gallery into `storybook-static`. |
| `pnpm run test:browser` | Run Playwright desktop and 390px phone checks. |
| `pnpm run check:offline` | Run legacy, coverage, boundary, and scaffold gates. |
| `pnpm run check` | Run the complete required V3 QA sequence. |

GitHub Actions mirrors the material gates in [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml). Exact delivery results belong in [`V3_TEST_REPORT.md`](../../V3_TEST_REPORT.md); this README does not infer a passing result.

To scaffold a sibling consumer:

```bash
pnpm scaffold:app --name my-learning-site --preset learning
```

Valid presets are `knowledge`, `learning`, `catalog`, and `portfolio-hub`. Generation is deterministic and refuses an existing target directory.

## Authoring model

Author stable IDs, content relationships, and semantic state before visual geometry:

```text
ContentCatalog / NotebookSpec / LessonSpec
                    |
             FigureSpec.rendererId
                    |
          FigureRendererRegistry adapter
                    |
       renderer-neutral FigureFrame surface
```

Reference notebooks are imported into canonical JSON at build/test time. The application renders the generated contracts; it does not evaluate notebook code. Runtime targets are explicit downloads or external launch links and must state where execution would occur.

## V1.1 compatibility and deliberate limits

Foundation V2 preserves the v1.1 gates:

- the legacy catalog, 36 live scenes, 28 renderer families, printable sheets, Python authoring helper, schemas, and generator research remain side by side;
- stable entity identity, semantic specs, the shared Airflow/Fabric-ADF/Lakeflow workflow model, column-lineage readiness, semantic icon fallbacks, reduced motion, and EN/NO application locale infrastructure remain intact;
- ConceptMotion core stays independent of React, Fluent, Monaco, Power BI, and browser DOM;
- Knowledge stays independent of React, Fluent, DOM, crawlers, fetch, and AI services;
- generic controls use Fluent v9, while Monaco remains limited to challenge/spec editing and diffs;
- package entry points are private workspace TypeScript sources, not prepared npm publications.

V2 does not add pipeline execution, notebook execution, a Spark runtime, a Jupyter kernel, a universal code judge, live monitoring/crawling, cloud accounts/sync, DAX Formatter calls, SQL parser integration, Data Forge generation, D3 SDK v2, GeoStory/Narrative Story, Canvas rendering, Web Components, or a Power BI adapter rewrite.

## Reports and history

The required V2 delivery reports are:

- [`V2_TEST_REPORT.md`](../../V2_TEST_REPORT.md)
- [`V2_AUDIT_SELF_REVIEW.md`](../../V2_AUDIT_SELF_REVIEW.md)
- [`V2_MIGRATION_LOG.md`](../../V2_MIGRATION_LOG.md)
- [`V2_API_SURFACE.md`](../../V2_API_SURFACE.md)
- [`V2_BUNDLE_REPORT.md`](../../V2_BUNDLE_REPORT.md)
- [`V2_CONSUMER_VALIDATION.md`](../../V2_CONSUMER_VALIDATION.md)

The preserved v1.1 reports and legacy maintenance references remain useful historical evidence:

- [`V1_TEST_REPORT.md`](../../V1_TEST_REPORT.md)
- [`V1_AUDIT_SELF_REVIEW.md`](../../V1_AUDIT_SELF_REVIEW.md)
- [`V1_MIGRATION_LOG.md`](../../V1_MIGRATION_LOG.md)
- [`V1_API_SURFACE.md`](../../V1_API_SURFACE.md)
- [`CODEX_HANDOFF.md`](CODEX_HANDOFF.md)
- [`AUDIT.md`](AUDIT.md)
- [`ROADMAP.md`](ROADMAP.md)
- [`QA_REPORT.md`](QA_REPORT.md)
- [`docs/AUTHORING_CONTRACT.md`](docs/AUTHORING_CONTRACT.md)
