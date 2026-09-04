# Foundation V2 test report

Date: 2026-09-04  
Repository baseline: `julian-passebecq/react_ms_fluent_2_framework` `main` at `d4435f55eb64eb02147e8ff0d51e3014c189fa75`  
Final environment: Windows, Node `v24.19.0`, pnpm `11.19.0`

## Result

**PASS.** The final post-fix `pnpm run check` exited 0. It is the authoritative superset gate and includes the preserved v1.1 smoke/build behavior plus the V2 importer, unit/coverage, package boundaries, generated applications, Studio, Dubreu consumer, legacy app, bundle assertions, Storybook, and desktop/phone browser matrix.

The baseline was verified before implementation: its clean `pnpm run check` passed 60 unit tests, 8 Playwright tests, all legacy smoke, and all builds at commit `d4435f55eb64eb02147e8ff0d51e3014c189fa75`.

## Exact final commands and results

Commands ran from `project/conceptmotion_studio` with the bundled compliant Node 24 runtime first on `PATH`.

| Command | Result |
| --- | --- |
| `node --version` | PASS — `v24.19.0`. |
| `pnpm --version` | PASS — `11.19.0`. |
| `git ls-remote origin refs/heads/main` | PASS — remote `main` resolved to the audited baseline `d4435f55eb64eb02147e8ff0d51e3014c189fa75`. |
| `pnpm install --frozen-lockfile` | PASS — all 15 workspace projects already up to date; 557 ms. |
| `pnpm run check:offline` | PASS — legacy smoke, 28 unit files/140 tests, coverage, 12 package boundaries across 99 source files, and all four generated-app validations. |
| `pnpm run check` | **PASS** — final authoritative run; 28 unit files/140 tests, all builds, 32-story Storybook build, and 20/20 Playwright tests in 2.3 minutes. |
| `git diff --check` | PASS — no whitespace errors. |

## Authoritative gate detail

### Preserved v1.1 smoke

- Catalog: 186 concepts / 12 categories.
- Scenes: 36 live scenes.
- Data integrity: 33 of 147 recommended interactive/story concepts live; 16 sheets; 15 cross-language actions.
- Generator specs: 3 seed contracts validated.
- Handoff: v2.0.0 metadata, 28 legacy renderer families, 21 required historical docs, raw source media excluded.
- Python smoke: `rolling-window-demo`, 4 frames, canonical nested data.
- Legacy production build: 595 modules; JS 399.86 kB / 129.99 kB gzip; CSS 20.08 kB / 4.79 kB gzip.

### Deterministic import and unit tests

- `pnpm run import:reference`: PASS — 2 notebooks, deterministic JSON, no execution.
- Vitest: 28 files passed, 140 tests passed.
- Coverage: 80.25% statements (1077/1342), 73.57% branches (1005/1366), 92.27% functions (239/259), 87.21% lines (928/1064).
- Coverage-scope note: as in v1.1, the numeric aggregate includes `packages/core/src/**/*.ts` and `packages/knowledge/src/**/*.ts`. Every V2 test file runs, but V2 source is not represented by that aggregate percentage.
- Boundary audit: 99 source files, 12 package boundaries clean.

Unit coverage includes serializable content validation/canonical JSON, notebook language and Deepnote parsing, deterministic/malformed/unsafe notebook import, all assessment question modes, practice versus mock feedback, V1.1 progress migration and V2 import/export, Figure adapters/static-source hardening/reduced motion, shared editor options, URL-backed catalog state, explorer rendering, Project Registry validation, Dubreu source/runtime references, and scaffold determinism.

### Scaffold validation

`pnpm run test:scaffold`: PASS.

- `knowledge`: 9 deterministic files; typecheck, production build, 2 generated tests passed.
- `learning`: 9 deterministic files; typecheck, production build, 2 generated tests passed.
- `catalog`: 9 deterministic files; typecheck, production build, 2 generated tests passed.
- `portfolio-hub`: 9 deterministic files; typecheck, production build, 2 generated tests passed.

Generated tests assert one named main landmark, working skip-link target, heading, labeled navigation, 320 px baseline, border-box sizing, and horizontal-overflow containment. The smoke also rejects nested main landmarks and copied renderer source.

### Typecheck and production builds

- TypeScript project references: PASS.
- Studio: PASS — 3,317 modules.
- Dubreu Formation: PASS — 3,305 modules.
- Legacy: PASS — 595 modules.
- Storybook: PASS — 3,336 modules; 32 stories in the built index.
- Bundle manifest assertions: PASS — Catalog and Knowledge exclude Monaco; Workflow and Challenge reach Monaco only dynamically. Exact measurements are in `V2_BUNDLE_REPORT.md` and `project/conceptmotion_studio/qa/v2-bundle.json`.

Vite reports the expected large-chunk warning for the lazy Monaco/JSON editor payload. It does not affect the asserted initial route boundary and remains documented for future trimming.

### Browser tests

Playwright: **20/20 passed** using installed Chrome, one worker, and two projects:

- desktop: 1440 × 1000 CSS px;
- phone: 390 × 844 CSS px with touch enabled.

Each viewport runs 10 tests: four preserved Foundation flows, two Monaco-loading flows, and four V2 flows. The matrix covers Catalog/renderers, Workflow/spec validation/keyboard selection, Challenge migration/draft/status/hint/solution/diff, Knowledge Atlas/locale, Monaco request boundaries, Dubreu SQL/Python/PySpark lessons, advanced SQL Try → Hint → Reveal → Compare, practice/progress persistence, and Project Hub direct destinations.

New primary V2 surfaces assert:

- no serious or critical Axe findings;
- no page-level horizontal overflow;
- keyboard-operable learning controls;
- accessible editor/diff labels and figure fallbacks;
- true PySpark no-execution state and absence of Run/Execute actions;
- SQL learner source contains `SELECT` and excludes `_dntk.execute_sql`;
- V2 progress persists, while migrated v1.1 keys remain unchanged.

Deterministic visual evidence is saved under `project/conceptmotion_studio/qa/screenshots/`, including SQL lesson, advanced compare, PySpark display-only, progress, and Project Hub table images at both viewports. Existing v1.1 evidence was regenerated under the same final browser configuration.

Manual review of the final SQL desktop, advanced-SQL phone, PySpark phone, and Project Hub desktop evidence confirmed the intended restrained Fluent layout, truthful execution messaging, readable hierarchy, and absence of page-level clipping.

### Focused stability checks after QA-driven corrections

- `pnpm --filter @datapass/code test`: PASS — 4/4.
- `pnpm --filter @datapass/code typecheck`: PASS.
- `pnpm exec playwright test tests/browser/v2-foundation.spec.ts --grep "advanced SQL" --repeat-each=3`: PASS — 6/6 in 53.9 s.
- `pnpm exec playwright test tests/browser/v2-foundation.spec.ts --grep "Dubreu catalog and SQL lesson" --repeat-each=3`: PASS — 6/6 in 1.1 min.
- `pnpm exec playwright test tests/browser/foundation.spec.ts --grep "workflow presets" --repeat-each=3`: PASS — 6/6 in 1.1 min.

## QA-driven corrections before the final pass

Intermediate runs were intentionally not treated as completion:

1. The boundary audit initially interpreted a scaffold-emitted CSS import string as the scaffold package's own dependency. Side-effect detection is now anchored to real import statements; the final 12-boundary audit passes.
2. Axe exposed unnamed Monaco diff child textboxes and insufficient removed-text contrast. The shared adapter now keeps both native edit contexts labeled and uses AA-safe low-tint diff colors. Repeated and full browser runs pass.
3. A browser assertion sampled Monaco's virtualized SQL line during rendering. It now waits for visible `SELECT` content before verifying the Deepnote wrapper is absent.
4. A separate focus-state assertion on an SVG group was unstable with touch enabled. The test now uses the locator's real Enter keypress, which performs focus and verifies the actual keyboard activation result.

Dev-server output contains Fluent/Keyborg cleanup diagnostics during repeated page teardown and Node's `NO_COLOR`/`FORCE_COLOR` warning. The tests record no uncaught page errors, all production builds pass, and these diagnostics are not presented as product behavior.

## CI status

`.github/workflows/ci.yml` implements the frozen-install, typecheck, unit/coverage, boundary, scaffold, Studio/Dubreu/legacy, Storybook, and Chrome browser gates on Node 24.19.0. The equivalent local full gate is green. No hosted Actions run is claimed because this workspace has not been committed/pushed by this implementation task.

## Explicit non-claims

No QA result claims Spark execution, Python or SQL runtime execution, Jupyter kernel integration, live source monitoring, cloud sync/accounts, or npm package publication. Foundation V2 implements none of those capabilities.
