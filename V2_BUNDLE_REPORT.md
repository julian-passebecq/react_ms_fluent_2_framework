# Foundation V2 bundle and loading report

Date: 2026-09-04  
Before baseline: `main` at `d4435f55eb64eb02147e8ff0d51e3014c189fa75`

## Measurement method

The before values were captured from a clean production build of the audited baseline before V2 edits. The after values come from the final `pnpm run build`/Vite output and `scripts/check-bundle.mjs`. Sizes below are Vite decimal kB; gzip values are Vite's reported estimates. Route-load membership is derived from the built manifest graph, not filename guessing.

## Before and after

| Asset/group | V1.1 baseline | Foundation V2 | Interpretation |
| --- | ---: | ---: | --- |
| Studio CSS | 38.78 kB / 7.17 kB gzip | 43.21 kB / 7.86 kB gzip | V2 learning/catalog/project styles add a small shared increase. |
| Studio main | 383.24 kB / 114.79 kB gzip | 201.68 kB / 64.45 kB gzip | Route splitting removes page implementations from the shell. |
| Fluent shared chunk | 423.42 kB / 113.70 kB gzip | 489.42 kB / 131.56 kB gzip | New Fluent explorer and learning controls extend shared UI. |
| Monaco main chunk | 4,384.90 kB / 1,119.65 kB gzip | 2,676.25 kB / 689.08 kB gzip | Shared adapter and selected contributions reduce the core editor chunk. It is lazy in V2. |
| JSON Monaco contribution | Included in baseline editor graph | 1,207.73 kB / 307.21 kB gzip | Loaded for JSON/spec editing, not Catalog or Knowledge. |
| TypeScript worker | 6,913.68 kB baseline output | Not emitted | Unused TypeScript/JavaScript worker was removed from the configured editor surface. |
| HTML/CSS workers | 739.95 / 1,074.89 kB baseline output | Not emitted | Unused web-language workers were removed. |

V2 also emits route chunks including Project Hub (25.64 kB / 8.88 kB gzip) and Knowledge (18.54 kB / 6.82 kB gzip). These keep their feature code off the initial shell path.

## Built graph assertions

`qa/v2-bundle.json` is generated from the production manifest and records:

- initial static JavaScript: 691,833 bytes;
- Knowledge static JavaScript: 823,485 bytes;
- Workflow static JavaScript before opening its dynamic editor: 813,348 bytes;
- Challenge static JavaScript before opening its dynamic editor: 832,855 bytes;
- editor/language lazy JavaScript set: 3,906,487 bytes;
- Catalog initial route excludes Monaco;
- Knowledge initial route excludes Monaco;
- Workflow reaches Monaco only through a dynamic import;
- Challenge reaches Monaco only through a dynamic import.

The precise values are asserted against the final manifest by `pnpm run test:bundle`; a route-graph regression causes the build gate to fail.

## Consumer build

The Dubreu consumer independently route-splits its learning surfaces. Its final build reports a 210.26 kB / 66.64 kB gzip application entry, a 222.59 kB / 59.44 kB gzip content-catalog chunk, and the shared Monaco surface as a lazy 2,676.21 kB / 689.06 kB gzip chunk. A 1,207.73 kB / 307.21 kB gzip JSON contribution remains lazy. Non-code course/catalog startup does not require an in-site execution runtime.

## Assessment

V2 fixes the behavioral regression that mattered most: non-code routes no longer request Monaco. The shell/main payload is smaller, unused Monaco workers are absent, and one shared adapter replaces duplicated page configuration. The lazy editor payload remains large and is explicitly retained for challenge/spec/diff fidelity; further Monaco contribution trimming is deferred rather than hidden.

## Explicit non-claims

Bundle results do not imply Spark execution, Python/SQL runtime execution, Jupyter kernel integration, live source monitoring, cloud sync/accounts, or npm package publication. None is present in Foundation V2.
