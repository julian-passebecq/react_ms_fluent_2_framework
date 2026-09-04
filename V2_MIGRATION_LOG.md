# Foundation V2 migration log

Date: 2026-09-04  
Baseline: `julian-passebecq/react_ms_fluent_2_framework` `main` at `d4435f55eb64eb02147e8ff0d51e3014c189fa75`

## Scope and baseline handling

The V2 handoff was extracted beneath `reference_material/v2_handoff_2026-09-04/`. Its 29 declared SHA-256 entries were verified and its five JSON reference templates parsed before implementation. `START_HERE.md` and `CODEX_MASTER_PROMPT.md` were read before the remaining V2 documents. The existing Foundation v1.1 implementation and its gates were retained; V2 is an additive workspace evolution rather than a renderer rewrite.

The handoff contains manifests for private/source training material, not the private course payload itself. No private Dubreu notebooks were present in the workspace. The consumer therefore uses small, original, deterministic fixtures and labels their provenance; no missing curriculum was invented.

## Package and API migrations

- Added `@datapass/code` as the only Monaco integration boundary. Studio Challenge and Workflow now consume `CodeEditor`, `CodeDiff`, or `JsonSpecEditor`; route-level imports keep editor code out of Catalog and Knowledge startup graphs.
- Added pure `@datapass/content` contracts for figures, courses, lessons, notebooks and cells, assessments and all seven question types, runtime launch targets, projects/app recipes, vocabulary, and article lessons. Validation and deterministic JSON serialization are part of the same pure package.
- Added pure `@datapass/notebook-import`. It parses notebook JSON without evaluation, emits deterministic IDs and JSON, retains source path/SHA/license provenance, handles supported reference outputs, sanitizes or rejects unsafe/unsupported media, and conservatively unwraps unambiguous Deepnote SQL calls.
- Added `@datapass/figure` as the application-facing adapter registry. `FigureSpec` remains in the pure content layer; ConceptMotion, workflow topology/run, and safe static-image adapters resolve behind `FigureView`. Existing renderer algorithms and `FigureFrame` remain separate.
- Added pure `@datapass/progress` plus React `@datapass/learning`. The former owns versioned data, validation, storage adapters, deterministic migrations, and operations. The latter owns notebook/lesson rendering, guided Try → Hint → Reveal → Compare interaction, assessment rendering/grading, progress summaries, and runtime/download launch UI.
- Added reusable catalog URL-state and explorer primitives to `@datapass/ui`, without importing Monaco or ConceptMotion semantics.
- Added pure `@datapass/scaffold` recipes and deterministic file generation for `knowledge`, `learning`, `catalog`, and `portfolio-hub` applications.

The complete export inventory is in `V2_API_SURFACE.md`.

## Storage migration

V2 uses schema version `2` at `datapass:progress:v2`. On first load, `ProgressStore` checks the current V2 payload, then deterministically migrates these Foundation v1.1 keys when needed:

- `datapass:challenge-drafts:v1.1`
- `datapass:challenge-progress:v1.1`

Draft variants are grouped by stable challenge ID, legacy `mastered`, `review`, and `flagged` booleans are retained, and the derived status is deterministic. A valid migration is written to the V2 key by default. Legacy keys are read but not deleted or overwritten. Invalid current or legacy JSON produces warnings and a safe validated state. JSON import/export passes through V2 validation.

## Content and source migration

- `examples/notebooks/dubreu_sql_where_reference.ipynb` and `dubreu_pyspark_partition_reference.ipynb` are imported at build/test time by `pnpm run import:reference`; checked generated JSON is deterministic.
- The SQL fixture includes an unambiguous Deepnote wrapper so the lesson shows learner-facing SQL rather than `_dntk.execute_sql(...)`. The untouched wrapper remains represented in provenance/debug metadata.
- The SQL lesson receives explicit editorial Markdown and a `FigureCell` after import. These additions use stable IDs and do not mutate the source fixture.
- Python and advanced SQL use original source fixtures with recorded SHA-256 values. PySpark output is labeled as saved/reference output.
- Runtime target IDs flow from course to lesson/notebook. Downloads are local static files; the optional Colab link is explicitly external.
- Stable feature, source, concept, notebook, lesson, question, assessment, project, and runtime IDs are used throughout.

## Application migration

- Studio pages are route-lazy. The new Project Hub uses the generic `@datapass/ui` catalog/table/detail primitives and a validated local Project Registry.
- Dubreu Formation is a separate proof consumer composed from workspace packages. It supplies Python, SQL Course, SQL Advanced, PySpark, Practice/Review, and Progress routes with EN/NO application chrome.
- PySpark is display/explanation/download only. No run button, Spark process, proxy, or kernel was added.
- Storybook provides a 32-story Golden Gallery of production surfaces, including Challenge states, Figure/Notebook composition, assessment result state, EN/NO, reduced motion, and mobile widths.
- `.github/workflows/ci.yml` mirrors the local gate with a frozen install, typecheck, unit/coverage, boundaries, scaffold validation, all builds, legacy smoke, Storybook, and Chrome browser tests.

## Generated social preview

The `imagegen` skill was used for one original Dubreu Formation social-preview asset. It influenced presentation only; it did not define product behavior or curriculum. The generated bitmap was copied to `project/conceptmotion_studio/apps/dubreu-formation/public/dubreu-formation-social.png` (1,179,534 bytes; SHA-256 `37c4f905e157ac21151314aa02074c8d30ef545f663e919efafeba447c5daf82`) and referenced by the consumer's Open Graph/Twitter metadata.

Exact generation prompt:

```text
Use case: ads-marketing
Asset type: 1.91:1 landscape website social preview (1910:1000 aspect ratio) for a restrained, professional technical learning app.
Primary request: Create a polished editorial abstract visualization of structured Python, SQL, and distributed-data learning. Show layered notebook and code cards as elegant abstract artifacts, a small semantic table-and-filter motif, and a subtle progress path connecting ideas. The image should feel like learning is carefully structured while execution happens elsewhere.
Scene/backdrop: Spacious off-white editorial canvas with generous negative space; no literal office or device scene.
Subject: A balanced composition of layered notebook/code cards, compact data-table cells, a restrained filter/funnel symbol, distributed-data nodes, and a subtle directional progress path. Use abstract syntax-colored lines and geometric tokens only—no readable code, labels, menus, results, or execution states.
Style/medium: Clean, premium flat/soft-3D hybrid illustration; crisp editorial geometry, gentle depth, subtle shadows, tactile layered paper-like cards; Microsoft Fluent-adjacent restraint without copying any branded interface, logo, or proprietary asset.
Composition/framing: True wide 1.91:1 social-card composition. Place the title and supporting line together in a calm, clearly readable typographic block with ample breathing room; arrange the abstract learning visualization as a complementary focal cluster without crowding. Maintain a strong hierarchy and safe margins on all sides.
Lighting/mood: Soft studio-like ambient light, calm confidence, technical precision, thoughtful and sophisticated rather than playful.
Color palette: Deep navy, slate, off-white, restrained teal accents, and sparse warm amber highlights. High-enough contrast for typography, muted overall saturation.
Text (verbatim): "Dubreu Formation"
Supporting text (verbatim): "Learn with structure. Execute elsewhere."
Typography: Render only those two exact text strings, spelled exactly and fully legible. The title "Dubreu Formation" is the dominant text; the supporting line is smaller but clearly readable. Modern refined sans-serif, restrained weight and spacing.
Constraints: No people. No vendor logos. No Jupyter, Spark, or Databricks logos or recognizable brand marks. No screenshots. No browser, window, app, notebook, terminal, or other UI chrome. Do not depict code as having been executed. No status badges, run buttons, prompts, outputs, charts with labels, or fake interface controls. No watermark. No extra text anywhere. No legible code or incidental pseudo-text. Avoid visual clutter, neon gradients, glossy sci-fi styling, and exaggerated 3D.
```

## Compatibility and explicit non-claims

No V1.1 storage was deleted, no canonical renderer geometry was moved into content, and no framework dependency was added to ConceptMotion core, `@datapass/knowledge`, `@datapass/content`, `@datapass/notebook-import`, `@datapass/progress`, or `@datapass/scaffold`.

Foundation V2 does **not** include Spark execution, Python or SQL runtime execution, Jupyter kernel integration, live source monitoring, cloud sync/accounts, or npm package publication. The optional Colab action only opens an external site; local downloads only transfer source files.
