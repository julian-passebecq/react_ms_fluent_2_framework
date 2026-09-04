# Foundation v1.1 test report

Date: 2026-09-04  
Project: `project/conceptmotion_studio`  
Host: Windows, Node 24.19.0, npm 10.5.0, pnpm 11.19.0

## Final gate

Command:

```powershell
npm run check
```

Result: **PASS**. This runs the offline compatibility suite, semantic/unit tests with coverage, package-boundary audit, TypeScript project build, the new Studio production build, the preserved legacy build, and Playwright browser tests.

| Gate | Final result |
| --- | --- |
| Legacy catalogue smoke | 186 concepts / 12 categories |
| Legacy scene smoke | 36 scenes |
| Legacy data integrity | 186 concepts; 36 live scenes; 33/147 recommended interactive/story concepts live; 16 sheets; 15 cross-language actions |
| Generator contract smoke | 3 seed contracts validated |
| Handoff smoke | v1.1.0; 28 legacy renderers; 21 required docs |
| Python authoring smoke | 4-frame canonical nested-data scene passed |
| Vitest | 14 files / 60 tests passed |
| Coverage | 80.02% statements; 73.06% branches; 91.89% functions; 86.93% lines |
| Boundary audit | 61 source files; 5 package boundaries clean |
| TypeScript | `tsc -b --pretty false` passed |
| Studio production build | 3,457 modules transformed; completed in 3.90s |
| Legacy production build | 595 modules transformed; completed in 199ms |
| Playwright | 8/8 tests passed in 1.1m across Chrome desktop and phone projects |

The Studio build produced `project/conceptmotion_studio/dist/`. The final application CSS is 38.78 kB before gzip and contains the shared `@datapass/ui` layout rules. The build reports one non-fatal size warning for the Monaco chunk; this is recorded in the self-review.

## Required offline gate

Command:

```powershell
npm run check:offline
```

Result: **PASS** in 17.79s. The second, explicit run produced the same legacy counts, 14/14 passing test files, 60/60 passing tests, the coverage totals above, and 5/5 clean package boundaries.

## Browser and visual verification

Commands:

```powershell
pnpm exec playwright test --update-snapshots
pnpm run test:browser
```

Final result: **PASS**. Automated projects use Chrome at 1440×1000 and a touch-enabled 390×844 phone viewport. The suite verifies:

- all six Studio routes and every required explainer family;
- table filter/sort identity and timeline play, pause, step, scrub, reset, and reduced-motion behavior;
- Workflow presets, declared run state, keyboard selection, inspector, JSON validation, last-valid preview, and reset;
- Challenge Monaco editing, local drafts/status, progressive hints, optional visual, solution reveal, and diff;
- Knowledge Atlas section routes, official-source links, freshness/change impact, review state, and EN/NO persistence;
- focus transfer, no page-level horizontal overflow, shared stylesheet presence, and no page runtime errors;
- WCAG A/AA serious-or-critical Axe findings on Catalog, Workbench, Explainers, Workflow, Challenge, and Knowledge. Fluent Tabster focus sentinels are excluded because they are framework-owned, intentionally focusable, `aria-hidden` infrastructure.

Visual baselines are stored under `project/conceptmotion_studio/tests/browser/foundation.spec.ts-snapshots/`. Full-page evidence is stored under `project/conceptmotion_studio/qa/screenshots/` for Catalog, Workflow Spec, Challenge, and Knowledge at both desktop and phone sizes. A separate manual Chrome audit covered all six routes at 1280×900 and 320×700, with zero page overflow and no serious/critical Axe findings.

## Focused hardening checks

Additional focused commands passed during implementation:

```powershell
pnpm exec vitest run packages/svg/tests/renderers.test.ts packages/react/tests/components.test.tsx
pnpm run typecheck
```

Result: 2 files / 11 tests passed; TypeScript passed. This specifically rechecked keyed renderer continuity, deterministic freeze behavior, React lifecycle integration, interactive SVG role hierarchy, and keyboard selection after the final lineage accessibility fix.

The generated social preview was also inspected as a 1200×630 bitmap. `apps/studio/index.html` contains Open Graph and Twitter image metadata, and the production asset exists at `apps/studio/public/social-preview.png` (799,672 bytes).

## Environment notes

The host shell printed a pre-existing Conda `libmambapy.QueryFormat` startup warning before PowerShell commands. It did not alter command exit codes or project results. Vite/Vitest require Node 22.12 or newer; all recorded results used the bundled Node 24.19.0 runtime rather than the host's older default Node installation.
