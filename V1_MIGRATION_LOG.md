# Foundation v1.1 migration log

## Scope

This log records how the existing ConceptMotion Studio was evolved into the Foundation v1.1 workspace. It documents compatibility decisions, not QA outcomes; exact commands and results are recorded separately in `V1_TEST_REPORT.md`.

## Baseline observations

The starting project was a working JavaScript/React/D3 Studio with a broad catalog, 36 live scenes, 28 renderer families, printable sheets, a Python authoring helper, JSON schemas, and cloud/data-model/lineage generator research.

The baseline also had constraints that made reuse difficult:

| Baseline characteristic | v1.1 implication |
| --- | --- |
| Reusable behavior lived inside the application tree | Extract real workspace packages with one-way dependencies |
| `src/renderers/index.js` combined many renderer families and used broad layer redraws in several paths | Add a small explicit family registry and keyed render/update lifecycle for the new foundation |
| Semantic calculation and visual rendering were not consistently separated | Move table, algorithm, transition, diagram, lineage, and workflow meaning into pure TypeScript |
| The application shell was bespoke React/CSS | Add reusable Fluent v9 application composites without changing renderer ownership |
| Legacy scenes included flat payloads while canonical v1 authoring used `data` | Preserve the legacy normalizer and avoid a forced all-scene conversion |
| Workflow, challenge, and source-aware documentation were product ideas rather than shared boundaries | Add provider-neutral and source-ID-driven contracts with deterministic local demonstrations |

## Migration strategy

The migration is side-by-side rather than destructive:

```text
src/                     preserved JavaScript/D3 Studio
apps/studio/             new Foundation v1.1 consumer app
packages/core/           new pure semantic package
packages/svg/            new framework-independent SVG package
packages/react/          new React adapter
packages/ui/             new Fluent application composites
packages/knowledge/      new pure source/change metadata package
```

The root workspace now uses pnpm and TypeScript project references. `pnpm run dev` and `pnpm run build` target the v1.1 Studio; `pnpm run dev:legacy` and `pnpm run build:legacy` retain an explicit route to the earlier app.

## Implemented changes

### Package boundaries

- Added `@conceptmotion/core` with no runtime dependencies and no React, DOM, Fluent, Monaco, D3, fetch, AI, Power BI, or product-host imports.
- Added `@datapass/knowledge` with no runtime dependencies and no UI, DOM, crawler, fetch, or AI behavior.
- Added `@conceptmotion/svg`, depending only on core.
- Added `@conceptmotion/react`, depending on core/SVG and using React/React DOM as peers.
- Added `@datapass/ui`, using React/React DOM and Fluent v9 as peers but not importing ConceptMotion semantics.
- Added `@datapass/studio` as the only layer allowed to compose every package plus Monaco.
- Added a source/manifest boundary audit so the dependency rules are executable rather than documentary only.

### Semantic and rendering model

- Added stable semantic entity/snapshot IDs and deterministic transition planning for enter, update, move, emphasis, and exit.
- Added pure table filter, stable sort, seven join types, loop-frame, regression-frame, diagram, workflow, and lineage semantics.
- Added one shared `WorkflowSpec` for generic, Airflow, Fabric Data Factory, Azure Data Factory, and Databricks Lakeflow presentation.
- Added cumulative, deterministic workflow run-frame compilation and allowed-status-transition validation. Runs are explanatory fixtures, not execution.
- Added column-lineage-ready asset/column/endpoint/relation contracts and a manual fixture. No SQL parser was introduced.
- Added semantic flow kinds whose line pattern, marker, label, and motion distinguish batch, stream, CDC, control, lineage, and outcomes without color alone.
- Added semantic icon IDs and a registry-controlled generic fallback chain. Specs do not contain vendor asset paths.
- Added seven focused SVG renderers with explicit mount/update/destroy/freeze lifecycle and keyed owned nodes.
- Added canonical SVG freeze/export that sorts attributes and removes runtime animation state by default.

### Application and documentation surfaces

- Added reusable Fluent v9 shell, navigation, page, catalog, workbench, explainer, challenge, workflow, knowledge, status, diagnostics, and timeline composites.
- Added renderer-neutral `FigureFrame`/`VisualizationSurface`; a plain SVG demonstration proves the child is not ConceptMotion-specific.
- Added EN/NO application locale selection with guarded persistence and deterministic fallback. Code and IDs remain unchanged.
- Added Catalog, Workbench, Explainers, Workflow, Challenge, and Knowledge Atlas routes in the new Studio.
- Restricted Monaco to the Studio's workflow spec and challenge code/diff surfaces.
- Added local challenge drafts and review/flag/mastery state. Static diagnostics are explicitly advisory; no code judge exists.
- Added local source/feature/status/version/change fixtures, freshness computation, and deterministic change impact through stable feature IDs.

## Compatibility decisions

| Decision | Compatibility result | Tradeoff |
| --- | --- | --- |
| Preserve `src`, legacy data, renderers, sheets, schemas, examples, research, and Python helper | Existing behavior and historical coverage remain inspectable and buildable | Two apps coexist during migration |
| Keep `src/lib/scene.js` normalization | Legacy flat scenes and canonical legacy-v1 `data` scenes remain accepted by the legacy app | New typed scene unions are not an automatic adapter for every old scene |
| Add a new seven-renderer default registry | New consumers get explicit types, lifecycle, stable keys, selection, reduced motion, and freeze/export | The 28 legacy renderer families are not claimed as migrated |
| Keep legacy generator contracts and smoke coverage | Cloud-diagram, data-model, and lineage research remains available to later consumers | Data Forge backend/generation is not implemented |
| Use presentation presets over provider-specific workflow models | Airflow/Fabric-ADF/Lakeflow share semantic topology and run state | Provider import/export and execution details are intentionally absent |
| Use semantic icon IDs with local generic fallbacks | Specs are portable and do not hard-code vendor asset files | Official vendor artwork is not bundled |
| Use package-local compatible `LocalizedText` shapes | Pure packages remain independent while consumers get the same fallback behavior | v1.1 does not introduce a shared locale package or full translation system |
| Export TypeScript source from private workspace packages | Vite/TypeScript workspace consumers can iterate without a package build pipeline | These entry points are not yet prepared npm distribution artifacts |
| Keep D3 only in the preserved app/root dependency | The new SVG core remains small and React-independent | This pass does not migrate or implement D3 SDK v2 |

## Runtime and consumer compatibility

- Workspace runtime: Node `>=22.12.0`, pnpm `11.19.0`.
- React adapter peer range: React and React DOM `>=18 <20`.
- UI peer range: React and React DOM `>=18 <20`; Fluent UI React Components `>=9 <10`.
- New renderer hosts require a browser-compatible SVG DOM. Pure core and knowledge APIs do not.
- The UI root entry imports its CSS, and `@datapass/ui/styles.css` is also an explicit export.
- SVG renderers accept semantic theme overrides rather than Fluent token objects.

## Deliberately incomplete migrations

- Legacy scenes and all 28 legacy renderer families were not bulk-converted to TypeScript.
- No general legacy-scene-to-`SvgSceneSpec` conversion layer was added.
- EN/NO covers reusable chrome and selected demo copy, not all catalog/challenge/source content.
- Knowledge status and change behavior uses source-controlled fixtures only; there is no fetch, crawler, alert, review bot, or AI rewriting.
- Column lineage is ready to receive parser output but does not parse SQL.
- Challenge diagnostics are local string heuristics and do not execute or semantically judge code.
- Workflow runs are deterministic playback and do not connect to Airflow, Fabric, ADF, or Lakeflow runtimes.
- D3 SDK v2, analytical chart grammar, GeoStory/Narrative Story, Canvas, Web Components, Data Forge, and Power BI work remain outside Foundation v1.1.

## Follow-on migration rule

Future renderer families should migrate one semantic contract and one verified consumer scene at a time. New work should keep stable IDs in the spec, semantic computation in core, geometry/lifecycle in SVG, React integration thin, and product layout in `@datapass/ui`.

