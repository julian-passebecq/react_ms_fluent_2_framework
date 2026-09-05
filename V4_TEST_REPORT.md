# V4 test and release report

## Small V4 polish pass — 5 September 2026

Started with clean local/fetched `main` at `c434bc2aa8d74e44fc58a445af9b669c584e81cd`, whose [hosted run 33932844984](https://github.com/julian-passebecq/react_ms_fluent_2_framework/actions/runs/33932844984) was observed completed/success. This pass changes existing consumer copy, Formation section navigation, shared pan guidance and the existing loop recommended viewport only. No shared API, package, renderer family, dependency, content ID or persistence key is added or migrated. Node 24.19.0 and pnpm 11.19.0 were used from the active workspace.

| Verification | Observed result |
| --- | --- |
| Baseline affected Figure/content/reasoning/Architecture unit tests | 17 tests / four files passed. |
| `pnpm exec vitest run packages/figure/tests packages/learning/tests/practice.test.tsx apps/formation/src/data/contentCatalog.test.ts apps/formation/src/data/reasoning.test.ts apps/formation/src/pages/PracticePage.test.tsx apps/algorithm-atlas/src/refinements.test.ts apps/architecture-atlas/src/data.test.ts` | 49 tests / nine files passed, 11.96 s. |
| `pnpm exec tsc -b --pretty false`, then Vite builds for Formation, Code Sandbox, Algorithm Atlas and Architecture Atlas | Passed. |
| Targeted browser selection across `v4-polish`, `v4-visuals`, `v3-atlases` and `v3-foundation` | 12 desktop/phone cases passed, 1.7 min; navigation focus/route/answer retention, 34 refined frames, Architecture paths/panning and existing Formation assessment/progress. |
| `pnpm test:browser tests/browser/v4-polish.spec.ts --grep 'V4 consumer copy'` after adding practice/progress routes and the final assessment-title copy change | Two cases passed, 25.8 s, covering 15 normal routes at both widths. |
| **One final `pnpm check` on the finished implementation** | **PASS, exit 0, 479.366 s**. 329 unit tests / 56 files (24.14 s), all six coverage floors, deterministic 323 items / 500 variants and two notebooks, legacy smoke, DX/schema/boundary/scaffold checks, all seven app builds plus legacy and 46-story Storybook, nine-output privacy scan, and **56/56 browser cases (6.0 min)**. |

The full gate ran once without interruption or retries. Generated log: `project/conceptmotion_studio/qa/v4-polish-release.log` (ignored). Existing screenshot comparisons, one-pixel overflow thresholds, fallback-font checks, reduced-motion paths and serious/critical Axe assertions remain enabled and unchanged. New tests strengthen focus/route/answer continuity, compact bottom-space bounds and the pan region's accessible description. Only copy-based expectations changed in existing tests. No authoring contracts or validators changed.

Seven representative polish screenshots are retained: four new reasoning-navigation captures, compact binary-search desktop/phone captures and the Architecture phone figure. Other automatically regenerated captures were restored to their prior tracked bytes to keep this pass small; the complete current evidence is uploaded by CI. Fresh V4 bundle JSON remains included, with unchanged budgets and lazy-editor/privacy boundaries. Reports were updated after the gate; implementation and tests were not changed afterward.

The final delivery message records the exact pushed commit and its matching observed hosted CI result. The baseline run above is not evidence for the follow-up commit. Larger layout/content changes are deliberately outside this pass, as documented in the visual review.

## Scope and environment

Baseline: exact final V3 `36c01d404e0acfd0bf9b55417ad48b4e9285586c`, clean `main`, with successful hosted baseline [run 33924063684](https://github.com/julian-passebecq/react_ms_fluent_2_framework/actions/runs/33924063684). V4 testing took place on 5 September 2026 using Windows, Node 24.19.0, pnpm 11.19.0, TypeScript 7.0.2, Vite 8.2.2, Vitest 5.0.0 and Playwright 1.62.1/Chrome.

Commands below run from `project/conceptmotion_studio`. Development used affected tests/builds/browser flows, not repeated full release gates. The finished-tree local release was started once and resumed after one test-location correction, as documented below; an uninterrupted local `pnpm run check` success is not claimed.

## Initial finished-tree local release evidence

| Stage | Observed result |
| --- | --- |
| `pnpm install --frozen-lockfile` | PASS; all 20 workspace projects synchronized. |
| `pnpm run test:practice-import` | PASS; deterministic 323 items / 500 variants, unchanged pinned corpus. |
| `pnpm run test:legacy` | PASS; catalog 186 entries / 12 categories; 36 scenes; 16 printable sheets / 15 actions; three generator seeds; current v4.0.0 handoff with 28 renderers / 21 docs; Python helper four frames. |
| `pnpm run import:reference` | PASS; two deterministic notebooks; no cell execution. |
| `pnpm run test:unit` | PASS; **328 tests in 55 files**, 24.62 s, plus all six pure-package coverage floors. |
| `pnpm run test:dx` | PASS; authoring and Storybook TypeScript, four byte-stable schemas, **22 tests in one file**, 7.11 s. These tests also appear in the full unit count; do not add them again. |
| `pnpm run check:boundaries` | PASS; 109 package source files, 12 package boundaries, 81 app files checked for direct Monaco imports. |
| `pnpm run test:scaffold` | PASS; four presets, nine files each; deterministic generation and generated type/build/baseline tests. |
| `pnpm run build` | PASS after the test-location correction; all TypeScript project references, Studio production build and existing lazy-bundle assertions. |
| `pnpm run build:consumer` | PASS; Formation production build. |
| `pnpm run build:v3` | PASS; Sandbox, Interview, Algorithm, Architecture and Pilot production builds; all six consumer bundle/privacy boundaries. |
| `pnpm run build:legacy` | PASS; preserved JavaScript/D3 application. |
| `pnpm run build:storybook` | PASS; 3,364 transformed modules, Vite 6.57 s; all **46 required IDs**, including all 38 historical stories and eight V4 compositions. |
| `pnpm run test:privacy` | PASS; nine outputs, 316 text artifacts, 15 binary exclusions, zero prohibited source-repository URLs, including source-map scanning. |
| `pnpm run test:browser` | PASS; **50/50 tests**, 25 desktop + 25 phone, **5.4 min**; all four original screenshot comparisons retained. |

The initial `pnpm run check` passed every offline gate, then stopped at TypeScript: the new CSS-token parity test imported `node:fs` inside the browser-oriented UI project. It exited 1 after **72.874 s**. The parity assertion was moved unchanged into the existing Node tooling-test layer (`scripts/check-ui-presentation.test.mjs`); no runtime code, coverage floor or application type boundary was loosened. The affected command `pnpm exec vitest run packages/ui/tests/presentation.test.tsx scripts/check-ui-presentation.test.mjs` passed **four tests in two files, 5.77 s**. This moved one test between files: that first hosted candidate retained 328 tests in 56 files. The subsequent font regression adds one unit test and one desktop/phone browser definition.

The remaining release stages were resumed in their original order:

```text
pnpm run build && pnpm run build:consumer && pnpm run build:v3 &&
pnpm run build:legacy && pnpm run build:storybook &&
pnpm run test:privacy && pnpm run test:browser
```

The continuation completed with **exit 0 in 369.161 s**. All required local release stages therefore passed, with the single test-location correction explicitly accounted for. Local diagnostic logs are `qa/v4-release-gate.log` and `qa/v4-release-continuation.log` (ignored generated logs, not source artifacts). CI runs the full final test placement from a clean checkout.

## Pure-package coverage

Coverage remains based on aggregated V8 covered/total counters for each pure package, not an average of file percentages or an aggregate inflated with UI rendering. Every original package-specific statement/branch/function/line floor is unchanged. Missing or empty runtime packages fail. Machine-readable counters and the HTML report are emitted under `coverage/` and uploaded by CI.

| Package | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: |
| core | 83.87% | 78.46% | 94.04% | 88.39% |
| knowledge | 82.63% | 74.80% | 95.83% | 91.78% |
| content | 86.01% | 80.94% | 96.58% | 91.84% |
| notebook-import | 89.95% | 81.54% | 95.38% | 93.36% |
| progress | 80.70% | 75.18% | 96.25% | 91.13% |
| scaffold | 100.00% | 89.65% | 100.00% | 100.00% |

Aggregate counters: 2,736/3,216 statements, 2,388/3,029 branches, 562/589 functions, 2,315/2,549 lines. New pure `explanation.ts` reaches 100% statements/functions/lines and 98.43% branches. These figures do not certify untested UI behavior or full schema/runtime equivalence.

## Focused development regressions

Final affected UI/Figure/Visual Sandbox checks passed **27 tests in five files (12.26 s)** before release; the later test-location-only recheck is recorded above. Four V4 presentation browser cases passed at desktop/phone widths (33.6 s), covering all sizes, stable/exported semantic content, metadata/attribution, native panning/keyboard use and valid-pending/invalid/applied authoring states.

The visual partition passed **79 tests in nine files (10.09 s)**, its affected TypeScript/builds, and ten Atlas browser cases (48.2 s). Eleven existing scenes retain thirty-four semantic frames and thirty-seven code lines. Tests check algorithm outcomes, row grain/cardinality, retry identity, semantic code/entity/state references, deterministic viewports/exports, graph icon fallbacks, node-text containment and canonical Galaxy category/status/selection counts.

The practice partition passed **32 tests in six files (10.42 s)**, three affected consumer type/build checks and fourteen browser cases (2.1 min). A reproduced Formation attempt-remount failure was fixed with a red/green component regression. Final targeted follow-ups passed two Sandbox native-panning cases (38.9 s) and two compact Interview prelude/reasoning cases (13.1 s). Existing draft/progress keys, grading, backup/import/export and no-execution controls remain checked.

These targeted counts overlap the full matrix and are not additional unique tests. They record development evidence rather than imply multiple full release runs.

## Storybook and visual evidence

All eight new built-Storybook compositions received an isolated inline Node/Playwright smoke at 1440px and 390px: **16/16 cases passed**, no page overflow, no serious/critical Axe findings, no renderer/page errors. After final shared font/viewport refinements, the six affected Challenge/Architecture/Galaxy cases were refreshed and passed again. This is targeted manual browser evidence, not a newly checked-in release gate or complete historical Storybook accessibility certification.

Checked-in automated DX coverage validates task/settings/snippet parsing and targets, four schema defaults and negatives, thirty Figure envelopes, runtime-only limits, app Monaco prohibitions, eight production story mappings and the 46-ID gallery guard. Details and precise manual-smoke qualifications are in `qa/v4-dx-notes.md` and [V4_DX_REPORT.md](V4_DX_REPORT.md).

V4 captures are under `qa/v4-screenshots`; historical screenshots and handoff references are retained. The four existing Foundation screenshot comparisons keep their original 0.01 pixel-ratio threshold and Linux baselines. No screenshot gate, strict one-pixel page-overflow assertion, reduced-motion path or serious/critical Axe check was disabled. Intentionally updated V2/V3 consumer assertions follow reviewed public wording/metadata/presentation changes, not weaker functionality; [V4_VISUAL_REVIEW.md](V4_VISUAL_REVIEW.md) documents the comparison and limits.

The preserved Foundation/Pilot smoke scripts also regenerate old evidence filenames (not assertion baselines). Four such generated images were restored to their pre-run tracked bytes after the suite; current Knowledge captures were retained under V4 names and current Galaxy captures already exist in the V4 gallery. No historical screenshot or Foundation assertion-baseline change is included in the release. All 26 attached handoff byte-count/SHA-256 records were rechecked successfully before commit.

## Hosted verification and release identity

Initial V4 commit `2677585c28961d197c90ce0f1da75df2ad93e6f7` triggered [run 33931609911](https://github.com/julian-passebecq/react_ms_fluent_2_framework/actions/runs/33931609911). All non-browser stages passed, including the final test placement (56 unit files, 38.16 s), DX (2.35 s), builds and privacy. Browser results were **46 passed / four failed (9.5 min)**: the two new Architecture/Galaxy text-containment checks failed at both widths because Linux fallback fonts made `Data Factory Pipelines / Git` and `ML / Data Science Web` exceed their cards. The four original Linux screenshot comparisons passed unchanged.

This was a real cross-platform presentation defect, not a missing baseline. A forced-Arial browser regression reproduced the same Architecture overflow on Windows before the renderer correction. The follow-up changes only opt-in semantic title wrapping to a conservative glyph-width budget, retains 14px/two-line text and full accessible names, and adds wider-font/long-label regression coverage. Existing generic nodes, card geometry, screenshot baselines and all containment/overflow tolerances are unchanged.

The corrected wrapping normalizes whitespace once in linear time, then scans only the two visible lines and an ellipsis budget; a 100,000-character label regression guards against quadratic tail rescanning while preserving full accessible names and deterministic export. Focused SVG/Diagram/Figure tests passed **16 tests in four files (7.24 s)** with affected TypeScript. All seven application builds plus legacy and existing bundle assertions were refreshed successfully (**27.764 s**); Storybook rebuilt successfully (3,364 modules, **9.22 s**, all 46 IDs). The four affected built-Storybook desktop/phone cases passed again (**5.70 s**), with zero overflow, serious/critical Axe or page/renderer errors. The fresh nine-output privacy scan again passed with the same 316 text/15 binary/zero-finding totals. Updated bundle bytes are in the bundle report.

Final focused browser verification of the bounded implementation passed **six cases in 24.3 s**: Architecture, Galaxy and the new fallback-font case at both widths. The regression applies Arial, DejaVu Sans/fallback, Liberation Sans/fallback and Courier New to semantic titles while retaining 14px text and the original node-width +1px containment bound. Ten current consumer images and four affected Storybook captures were refreshed and inspected. The follow-up suite inventory is **329 unit tests in 56 files and 52 browser cases**; its complete clean hosted run is the final release acceptance, reported with the exact matching SHA in the final delivery message.

The [Datapass visual platform CI workflow](https://github.com/julian-passebecq/react_ms_fluent_2_framework/actions/workflows/ci.yml) retains all old stages and adds explicit DX/schema verification. It uses a frozen install and clean Ubuntu checkout, keeps visual regression enabled, and uploads `v4-quality-evidence` with coverage, screenshots and bundle reports. The successful V3 baseline run above is **not** evidence for V4.

This report is committed with the implementation, before that commit can trigger hosted CI. The exact final commit SHA, its matching Actions run URL and observed conclusion are supplied in the final delivery message after push/verification; they are not guessed here or recursively embedded by creating another report-only release commit. Completion requires that final run to conclude success.

Known limits remain explicit: schemas are structural assistance, workflow explanation tracks currently align to the first declared run, dense graphs use panning/text alternatives/inspectors on phones, and browser tests are Chrome desktop/390px layouts rather than a cross-browser certification. No site deployment, backend, Spark/Jupyter execution, auth or cloud integration is claimed.
