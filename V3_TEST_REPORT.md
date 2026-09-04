# V3 test report

## Environment and baseline

Local validation: Windows, Node **24.19.0**, pnpm **11.19.0**, TypeScript **7.0.2**, Vite **8.2.2**, Vitest **5.0.0**, Playwright **1.62.1**, Chrome desktop 1440×1000 and phone 390×844. Commands ran from `project/conceptmotion_studio` on 4–5 September 2026. The workspace has 20 projects and seven application TypeScript references.

Starting main: `8cccd77ecd0d0b60b1d28ee2e41cffe5ec78a26f`.

The required CI repair was completed **before V3 implementation**. Commit `df98913de2a4b01a319db627b740cdd8513c05cd` added four reviewed Linux screenshot baselines from failed-run artifact 9952583496. [GitHub Actions run 33916767119](https://github.com/julian-passebecq/react_ms_fluent_2_framework/actions/runs/33916767119) concluded **success**. Original run 33913887435 failed only those missing baselines. Visual comparisons and the 1% tolerance remain enabled and unchanged.

## Final local gate

`pnpm install --frozen-lockfile`: **PASS**, exit 0, all 20 workspace projects already synchronized.

The initial `pnpm run check` passed with 262 unit tests and 36 browser tests. After the hosted Linux layout corrections, every constituent stage was rerun: `pnpm run check:offline`, `build`, `build:consumer`, `build:v3`, `build:legacy`, `build:storybook`, `test:privacy`, and a separate `test:browser` run. No old gate was skipped. The table records the latest results.

| Command / stage | Exact result |
| --- | --- |
| `test:practice-import` | PASS; raw audit and public projection byte-equivalent to deterministic generation; 323 distinct IDs, 500 variants, no excluded items |
| `test:legacy` | PASS; 186 concepts / 12 categories, 36 scenes, 28 legacy renderer families, 16 sheets, 15 cross-language actions, three generator contracts, 21 handoff-document checks, Python rolling-window canonical-data smoke |
| `test:unit` | PASS; **262 tests in 46 files**, 30.75 seconds; all six pure-package coverage floors passed |
| `check:boundaries` | PASS; **106 source files, 12 package boundaries** |
| `test:scaffold` | PASS; knowledge, learning, catalog and portfolio-hub; nine files each, deterministic generation plus typecheck/build/baseline tests |
| `build` / `typecheck` / Studio bundle audit | PASS; all app references; Catalog/Knowledge exclude Monaco and code/spec routes reach it lazily |
| `build:consumer` | PASS; Formation and deterministic notebook import |
| `build:v3` | PASS; five new apps, six consumer manifest budgets and lazy-editor/private-overlay checks |
| `build:legacy` | PASS; preserved JS/D3 app |
| `build:storybook` | PASS; **38 Golden Gallery stories** indexed; six new reuse stories plus all 32 existing stories |
| `test:privacy` | PASS; **nine outputs, 311 textual files**, including source maps; zero prohibited private-source URL findings; 15 binary assets excluded |
| `test:browser` | PASS; **40/40 desktop/phone tests**, 4.7 minutes; all old/new flows, enabled screenshots, keyboard, primary-surface Axe, overflow and submitted-label color assertions |
| `git diff --check` | PASS; no whitespace errors |

An earlier complete integration pass also passed 235 unit tests and 36 browser tests in 4.1 minutes. The latest checks supersede the earlier runs and include the final resource/privacy/accessibility/review and cross-platform layout corrections. Every stage, including the full 40-case browser run, completed with exit 0.

## Pure-package coverage

Counters are aggregated per package, not averaged per file. Missing/empty runtime packages fail. Numbers in parentheses are enforced regression floors, selected against the audited baseline. UI tests remain functional/browser evidence rather than inflating this gate.

| Package | Statements | Branches | Functions | Lines |
| --- | --- | --- | --- | --- |
| core | 82.60% (75%) | 76.81% (70%) | 93.88% (88%) | 87.87% (82%) |
| knowledge | 82.63% (80%) | 74.80% (70%) | 95.83% (90%) | 91.78% (88%) |
| content | 85.51% (75%) | 80.43% (65%) | 96.58% (85%) | 91.52% (82%) |
| notebook-import | 89.95% (75%) | 81.54% (65%) | 95.38% (85%) | 93.36% (80%) |
| progress | 80.70% (72%) | 75.18% (62%) | 96.25% (90%) | 91.13% (85%) |
| scaffold | 100.00% (95%) | 89.65% (85%) | 100.00% (95%) | 100.00% (95%) |

Overall measured pure-package counters: statements **84.50% (2666/3155)**, branches **78.08% (2309/2957)**, functions **95.36% (556/583)**, lines **90.58% (2271/2507)**. This aggregate is informational; each package's own floors decide failure. HTML and JSON/Markdown summaries are generated in `coverage/` and uploaded by CI.

## New regression evidence

Tests cover all 30 visual artifacts and their numerical/identity/causal invariants; 32 architecture layout combinations; radial determinism/non-overlap and group/self-edge/cycle cases; same-family SVG ARIA uniqueness and deterministic export; real practice-ID mappings; all 323 contracts; raw/public projection privacy; latest-answer review; clamped visual controls; malformed-backup protection and private/public export separation; quoted scaffold titles; UTF-8/structural/table/join preview budgets; and the privacy/coverage checkers themselves.

Browser tests traverse Formation course/figure/assessment/progress, Sandbox catalog/hint/visual/editor/solution/compare/backup, Interview submission/review/flags, both Atlases, Pilot project/galaxy/structured notes/import/export, and Visual Sandbox valid/invalid/fallback/export. Primary audited surfaces have zero serious/critical Axe violations and no page-level horizontal overflow. Narrow FigurePlayer canvases support keyboard panning; source text and captions remain accessible.

## Corrections and warnings

Development runs exposed real navigation/contrast/typing issues and a Monaco test targeting error. Final review additionally fixed review-queue semantics, out-of-range figure steps, Windows LF corpus handling, oversized join allocation, Python lesson Figure metadata, repeated SVG accessibility IDs and private-source publication. None was waived by removing an assertion or disabling screenshots. Targeted fixes were tested before the full rerun.

The first V3 hosted run exposed two Linux-only phone overflows: Sandbox's native track Select and Pilot's implicit backup grid minimum. Scoped shrinkable Field/Select wrappers and an explicit `minmax(0, 1fr)` grid track fix their intrinsic-width cause. Font-stress regressions test the longest Sandbox option at 390/360/320 pixels and Pilot's wider select metrics, long filename, keyboard preview and per-control containment. The Sandbox regression failed before its fix with 18 pixels of overflow; all **12 targeted browser cases passed in 1.4 minutes** afterward. The original one-pixel overflow threshold, Axe assertions and screenshot comparisons remain unchanged.

Final screenshot review caught an Interview disabled-label specificity issue outside Axe's inactive-control contrast checks. The new explicit color assertion reproduced gray `rgb(189, 189, 189)` before the fix. A disabled-input sibling selector now keeps all six answer labels at navy `rgb(23, 43, 66)` while all six radios remain disabled. Both targeted desktop/phone Interview cases passed **2/2 in 11.7 seconds**, and refreshed screenshots were inspected. Consumer builds, manifest budgets and the nine-output privacy scan were rerun after this CSS correction. A final full browser rerun, including the color assertions, passed **40/40 in 4.7 minutes** and supersedes the preceding 4.6-minute local browser run.

Expected non-fatal warnings remain: Vite's large lazy Monaco/JSON/corpus chunks, terminal NO_COLOR/FORCE_COLOR interaction and Vitest's environment-performance suggestion. These are not failed gates. Browser checks use Vite-served production components; independent production builds/manifests and output privacy checks are also required. Storybook build success does not claim an automated accessibility audit of every story.

## Hosted V3 delivery

The repaired V2 baseline is hosted-green as recorded above. [First V3 run 33921026472](https://github.com/julian-passebecq/react_ms_fluent_2_framework/actions/runs/33921026472), for `f7737fbc0825323408c88e2534f7a5fcd0083604`, concluded **failure**: all non-browser stages passed, and 34/36 browser cases passed; only the two Linux phone overflow checks above failed. All pre-existing screenshot comparisons passed.

The responsive fix is pushed as `57a79fca5fe4ff3a78b08cc18b2bce98d7a68074`. Its [hosted run 33923038383](https://github.com/julian-passebecq/react_ms_fluent_2_framework/actions/runs/33923038383) concluded **success**: all stages passed, including all **40 browser tests in 6.1 minutes**. The quality job completed in **8 minutes 14 seconds** on Ubuntu. This is observed hosted V3 success, including the Linux layout fixes and enabled original screenshot comparisons.

GitHub emitted one non-failing action-runtime warning: the pinned v4 actions and pnpm setup action declare Node 20 and were forced to the hosted Node 24 action runtime. Application/toolchain commands explicitly use Node 24.19.0. No action warning was suppressed or QA gate bypassed.

The delivery commit adds these observed audit results, refreshed evidence and the separately tested Interview label-specificity correction. Its own hosted check is required before handoff. To avoid a self-referential commit hash in this file, the final delivery message provides that exact immutable SHA, run URL and observed conclusion; the linked successful code-validation run above remains reproducible evidence.

Evidence lives in `qa/screenshots/`, `qa/v3-bundles.json`, `qa/v3-bundle-privacy.json`, `coverage/` and the GitHub Actions artifacts. The final delivery message identifies the final pushed SHA and its exact Actions conclusion.
