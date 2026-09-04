# V3 bundle report

Measured from fresh production builds on Windows using Node 24.19.0 / pnpm 11.19.0 / Vite 8.2.2. These are release artifacts, not development-server transfer sizes. Machine-readable evidence: `project/conceptmotion_studio/qa/v3-bundles.json`, `v3-bundle-privacy.json` and the preserved `v2-bundle.json`.

## Initial static JavaScript

The static closure follows entry imports but **not** dynamic imports. Values are uncompressed bytes, including shared static dependencies; CSS, source maps and lazily loaded route/editor assets are not added to this column.

| Consumer | Initial static bytes | Enforced ceiling | Initial Monaco |
| --- | ---: | ---: | --- |
| Formation | 473,373 | 650,000 | Excluded |
| Code Sandbox | 366,362 | 550,000 | Excluded |
| Code Interview | 448,147 | 650,000 | Excluded |
| Algorithm Atlas | 492,315 | 700,000 | Excluded |
| Architecture Atlas | 449,546 | 650,000 | Excluded |
| Pilot Center | 441,213 | 650,000 | Excluded |

The Studio's preserved manifest audit reports initial Catalog closure **705,177 bytes**, Knowledge closure **842,430**, Workflow closure **831,662**, and Challenge closure **851,127**. Catalog and Knowledge exclude Monaco; Workflow and Challenge reach it only dynamically. Visual Sandbox is also a lazy route using the same shared editor boundary.

## Meaningful lazy payloads

- Code Sandbox's full public practice chunk is **706.54 kB raw / 127.17 kB gzip**, down from the pre-projection raw-source chunk of 1050.51 / 148.64. The full 323 items and 500 variants remain; redundant private/raw provenance is outside the public graph.
- Code Interview's lazy Session chunk is **902.03 kB raw / 181.86 kB gzip**. Its initial session selection does not load the full corpus/editor.
- Pilot's Projects, Ideas and Backups are separate lazy routes. Projects is **131.47 kB raw / 37.54 kB gzip**.
- Shared Monaco implementation is approximately **2676.21 kB raw / 689.06 kB gzip** in coding consumers; JSON language service is about **1207.73 / 307.21**. The Studio audit counts **3,906,487 lazy editor bytes** including language chunks. Local editor/JSON workers are separate assets.

Vite's >500 kB warnings remain visible. V3 does not hide them by inflating the warning limit or blocking release solely on the intentionally lazy Monaco payload. The bounded initial-route ceilings prevent an editor or full corpus from silently becoming an entry dependency.

## Privacy and graph gates

`check-v3-bundles.mjs` requires a real entry, computes its static closure, rejects Monaco on non-code entry paths, requires a reachable lazy editor for Formation/Sandbox/Interview, enforces per-app ceilings, and rejects the private-overlay sentinel or private-file graph entry.

`test:privacy` scans **all nine outputs**: Studio, six consumers, Storybook and legacy. Fresh integrated result: **311 textual artifacts scanned, 15 binary assets skipped, zero prohibited source-repository URL findings**. JavaScript, CSS, HTML, JSON, SVG and source maps are included. Tests cover ordinary GitHub, raw/API/git/codeload paths and common JSON/HTML/percent-escaped forms. The scanner is a known-private-source regression guard, not a general DLP service or an evaluator of arbitrary obfuscated code.

The three source repositories were explicitly verified private. Public consumer objects use opaque source IDs, and the practice graph imports only `catalog.public.json`; raw audit records/manifests are not source imports. Pilot private overlays are read only via an explicit runtime file import. Unit/browser tests separately prove its actual public download omits runtime private URLs, notes and next actions.

## Reproduction and limitations

Run `pnpm run build`, `build:consumer`, `build:v3`, `build:legacy`, `build:storybook`, then `test:privacy`—or simply `pnpm run check`. CI runs these gates and uploads bundle/privacy evidence.

Each consumer is an independent build, so common packages are deduplicated within that app rather than shared through a deployment CDN. Source maps remain enabled for diagnostics and are privacy-scanned. No public hosting deployment or production network/performance benchmark is claimed. Final overall QA and hosted CI status are in [V3_TEST_REPORT.md](V3_TEST_REPORT.md).
