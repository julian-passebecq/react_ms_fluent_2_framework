# V4 bundle and privacy report

Small V4 polish follow-up from `c434bc2` (5 September 2026): the current `qa/v4-studio-bundle.json` and `qa/v4-bundles.json` were refreshed by the final release check. All existing byte ceilings, lazy-Monaco checks and the nine-output privacy scan passed; no dependency or package was added. The tables below preserve the preceding V4 consolidation measurements. The follow-up's test/release evidence is recorded at the top of `V4_TEST_REPORT.md`.

Measured from fresh finished-tree production builds on 5 September 2026, including the hosted-failure fallback-font correction, Windows, Node 24.19.0 / pnpm 11.19.0 / Vite 8.2.2. All bundle assertions passed. Historical V3 JSON/reports remain unchanged; current machine-readable evidence is in `project/conceptmotion_studio/qa/v4-studio-bundle.json`, `v4-bundles.json` and `v4-bundle-privacy.json`.

## Initial static JavaScript

The existing manifest gate follows static entry imports, not dynamic imports. Values are uncompressed bytes; CSS, source maps, workers and lazy route/editor chunks are not counted as initial JavaScript. Ceilings were not increased.

| Consumer | V3 bytes | V4 bytes | Delta | Existing ceiling | Initial Monaco |
| --- | ---: | ---: | ---: | ---: | --- |
| Formation | 473,373 | 483,416 | +10,043 | 650,000 | Excluded |
| Code Sandbox | 366,362 | 366,665 | +303 | 550,000 | Excluded |
| Code Interview | 448,147 | 448,446 | +299 | 650,000 | Excluded |
| Algorithm Atlas | 492,315 | 502,646 | +10,331 | 700,000 | Excluded |
| Architecture Atlas | 449,546 | 460,104 | +10,558 | 650,000 | Excluded |
| Pilot Center | 441,213 | 441,507 | +294 | 650,000 | Excluded |

Studio's Catalog closure is **705,500 bytes** (V3: 705,177), Knowledge **853,868** (842,430), Workflow **842,081** (831,662), and Challenge **861,608** (851,127). Catalog and Knowledge exclude Monaco; Workflow and Challenge reach it only dynamically. The Visual Sandbox remains a lazy route using the same shared editor implementation.

V4 adds disclosure/presentation and semantic explanation support without moving the full practice corpus into catalog entry paths. The lightweight practice-visual availability projection is equality-tested against actual mappings. These measurements demonstrate retained boundaries, not an overall bundle-size reduction claim.

## Lazy payloads and warnings

- Code Sandbox's full practice chunk is **706.55 kB raw / 127.17 kB gzip**. All 323 items and 500 variants remain.
- Code Interview's lazy Session chunk is **949.51 kB raw / 195.88 kB gzip**; review guidance and shared Figure presentation are loaded with the session, not the initial selection page.
- Pilot's lazy Projects chunk is **144.23 kB raw / 41.23 kB gzip**. Projects, Ideas and Backups remain separate routes.
- Algorithm's lazy SceneDetail is **119.82 kB raw / 34.03 kB gzip**; Studio's Visual Sandbox page is **45.74 kB raw / 16.76 kB gzip**.
- Coding consumers' Monaco implementation remains approximately **2676.21 kB raw / 689.06 kB gzip**; JSON language service is **1207.73 / 307.21**. Studio's editor closure remains exactly **3,906,487 bytes**, unchanged from V3. Local editor/JSON workers are separate assets.

Vite's existing >500 kB warnings are still visible for intentionally large lazy editor/corpus chunks and Storybook. No warning limit or initial-route ceiling was weakened. Storybook is an authoring/gallery build, not a consumer entry-size benchmark.

## Privacy, dependencies and enforcement

The finished-tree privacy scan passed across **nine outputs: 316 textual artifacts, 15 binary assets skipped, zero prohibited source-repository URL findings**. Scanned formats include JavaScript, CSS, HTML, JSON, SVG and source maps.

| Output | Text files scanned | Binary files skipped |
| --- | ---: | ---: |
| Studio | 72 | 2 |
| Formation | 53 | 2 |
| Code Sandbox | 49 | 1 |
| Code Interview | 35 | 1 |
| Algorithm Atlas | 10 | 0 |
| Architecture Atlas | 10 | 0 |
| Pilot Center | 20 | 0 |
| Storybook | 63 | 9 |
| Preserved legacy | 4 | 0 |

The existing private-overlay graph/sentinel checks also passed for all six consumers. Runtime public-export tests remain separate from this static scan. This scanner detects known private-source URL forms; it is not a general data-loss-prevention service.

No new runtime package or renderer family was created. Three learning consumers now explicitly depend on the existing `@conceptmotion/react` workspace package to reuse its reduced-motion hook. Exact Ajv 8.17.1 is developer-only; root Storybook tooling declares the existing Fluent 9.74.7 version. Neither dependency adds Ajv to consumer or pure-package runtime contracts. The expanded boundary gate rejects direct application Monaco imports.

## Reproduction and limits

From `project/conceptmotion_studio`, run `pnpm run build`, `build:consumer`, `build:v3`, `build:legacy`, `build:storybook`, then `test:privacy`. The legacy `build:v3` script name intentionally remains compatible. CI retains these gates and uploads the V4 bundle JSON with coverage and browser evidence.

Independent apps deduplicate common packages within each build, not across a deployment CDN. Source maps stay enabled and privacy-scanned. No hosted site deployment, network-performance benchmark or arbitrary obfuscation audit is claimed. Exact local release sequencing and final hosted verification procedure are in [V4_TEST_REPORT.md](V4_TEST_REPORT.md).
