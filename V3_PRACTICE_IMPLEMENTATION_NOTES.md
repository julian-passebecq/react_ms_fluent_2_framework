# V3 practice implementation evidence

## Source preservation

Read-only source: `julian-passebecq/leetcodedataeng`, pinned revision `a3bff6aeeb89af5e379b4d8c168b3b1f581fe026`. Verified with live `git ls-remote origin refs/heads/main`; the source checkout remained at older revision `722e4e889ff821e9ff712acc36680719f894afa3` and was not modified.

The full source inventory reconciles **323 distinct IDs/titles**: 211 curriculum lessons, 60 SQL challenges, 24 multi-engine challenges, and 28 Python drills. Import preserves **500 materialized variants**, **24 curriculum tracks**, and **10 cheat sheets**. Additional SQL/engine/Python topic records are also retained. No practice item is excluded.

`project/conceptmotion_studio/content/practice/source.manifest.json` records source revision, per-file SHA-256 values, exact collection/variant counts, and machine-readable empty `exclusions`. `source.snapshot.json` retains original data records; `catalog.json` contains the normalized shared content. Original concept/task/why/hints/pitfall, context, source pack, official-source metadata, starters, reference solutions, explanations, and source records remain available.

Original `THIRD_PARTY_NOTICES.md`, `ZILLACODE_APACHE_LICENSE.txt`, and `SQL_CHALLENGE_IMPORT.md` accompany the corpus. Original notices describe source UI/vendor assets; those components, CSS, renderer implementations, and logo assets are explicitly **not** migrated. No old trainer UI or renderer code was copied.

The maintainer-only snapshot command evaluates an allowlist of pinned data modules in a VM without importing their UI. This is not an untrusted-code execution service or a security sandbox, and challenge code remains inert strings. The application importer is pure TypeScript with no filesystem, network, clocks, or execution dependency.

## Reproduction

From `project/conceptmotion_studio`, using Node 24.19.0:

```text
node --experimental-vm-modules scripts/snapshot-practice-source.mjs D:/PROJ/leetcodedataeng
pnpm exec tsx scripts/import-practice.ts
pnpm exec tsx scripts/import-practice.ts --check
```

The checked-in source snapshot makes normal builds and CI independent of source-repository access. `--check` compares deterministic raw and public-projection bytes and requires 323 items / 500 variants. Actual snapshot/import/check commands passed locally.

GitHub visibility verification identified the upstream trainer as private. Public consumers therefore import only `catalog.public.json`, produced by shared pure `createPublicPracticeCatalog`: the source becomes opaque `source:practice-corpus`, while the pinned revision, all stable IDs, pedagogy, variants, source-pack attribution and permitted official sources remain. Full raw `sourceRecord` data and private repository references remain only in the non-bundled snapshot/catalog/manifest audit artifacts. A public-projection regression asserts every ID/title/variant survives and all three known private repository references are absent; a pure fixture also checks nested private URLs are redacted without changing public official URLs or the original provenance.

## Shared API and reuse

- `@datapass/content`: `ChallengeDefinition`, `ChallengeVariant`, `PracticeItem`, `PracticeCatalog`, source/track/cheat-sheet contracts; `validateChallenge`, `assertValidChallenge`, `importTrainerSnapshot`, `createPublicPracticeCatalog`. The former Studio types are re-exported from the shared package without changing old fixture identities.
- `@datapass/learning`: `ChallengeWorkbench` composes existing UI `ChallengeShell`, shared lazy `CodeEditor`/`CodeDiff`, production `FigureView`, and pure progress operations. No second editor or renderer stack exists.
- `@datapass/learning`: `usePracticeWorkspace`, parse/serialize helpers wrap the existing schema-v2 progress in an app-specific schema-v1 notes/backup envelope. Storage failures are visible; invalid saved bytes are protected until an explicit validated import. Existing V2 progress keys are untouched.
- Code Sandbox: shared Explorer/catalog URL state, cards/table, challenge composition, Figure, code, progress. App-specific code is navigation, catalog facets, learning-path/cheat-sheet composition and backup controls.
- Code Interview: shared AssessmentRunner, QuestionSpec/AssessmentSpec, progress domain breakdown, Figure and optional ChallengeWorkbench. App-specific code is the curated 36-question / nine-domain bank and session/timer policy. Quick=4 questions, Focused=8, Mock=12, Domain=4, Review=latest submitted incorrect results/explicit flags. Correct retries clear earlier mistakes regardless of stored assessment/attempt order; explicit flags remain until removed. New attempts record start/submission timestamps, with a legacy timestamp-ID fallback and deterministic tie rule. Code practice is explicitly ungraded.
- Shared visual content attaches SQL filtering, inner join, grouping and latest-row scenes plus algorithm/data scenes through verified practice IDs. Every mapped practice ID is tested against the 323-item corpus. Illustrative figures are clearly distinguished from actual challenge inputs or execution results; unmapped items show a truthful fallback.

Code Sandbox serves on 4176; Code Interview serves on 4177. Each has an independent build, app identity, local persistence key, and route-level lazy chunks. Static catalog/session-selection routes do not load Monaco. No Spark/Jupyter execution, remote judge, backend, auth, or integrations were added.

## Targeted QA

Local targeted commands:

```text
node node_modules/typescript/bin/tsc -p apps/code-sandbox/tsconfig.json --pretty false
node node_modules/typescript/bin/tsc -p apps/code-interview/tsconfig.json --pretty false
node node_modules/vitest/vitest.mjs run packages/content/tests/practice.test.ts packages/learning/tests/practice.test.tsx content/practice/practice.test.ts apps/code-interview/src/data/sessions.test.ts
node node_modules/@playwright/test/cli.js test --config qa/practice.playwright.config.ts
node node_modules/vite/bin/vite.js build --config apps/code-sandbox/vite.config.ts
node node_modules/vite/bin/vite.js build --config apps/code-interview/vite.config.ts
```

Both targeted app typechecks and the changed content/learning package typechecks passed. The final review-fix run passed **21 tests in four files**, including deterministic full-corpus reconciliation, contract rejection, independent variants, real visual-ID references, privacy-safe public projection, chronologically latest review results, bounded figure navigation, session sizes, workbench tabs/figure fallback and malformed-backup preservation. Workbench navigation uses the shared `figureStepCount` helper; repeated next clicks at the last frame cannot create hidden out-of-range steps.

The four initial desktop/390px browser flows passed in 32.6 seconds; strengthened real-Monaco draft editing and persistence then passed 4/4 in 35.1 seconds. The shared table Figure run passed 4/4 in 41.1 seconds; the final run after publication-boundary, review-queue and visual-bound fixes passed **4/4 in 30.5 seconds**. Monaco's native edit-context is keyboard-focused, as in the existing Foundation tests; pointer-click interception was a test interaction issue, not disabled coverage. These flows cover zero serious/critical Axe findings, page overflow, keyboard catalog/session activation, lazy Monaco, hints, real Figure rendering, solution/diff, PySpark boundaries, notes/drafts/flags/mastery, JSON backup, interview submission and mistake review. Final repository-wide/hosted results belong in `V3_TEST_REPORT.md`.

Both production builds passed (3315 transformed modules each). Targeted measured output before final integration: Sandbox entry 231.56 kB raw / 73.13 kB gzip; separate full-corpus chunk 1050.51 / 148.64. Interview entry 285.17 / 87.96; lazy Session chunk 1244.19 / 202.67. Shared lazy Monaco payload remains 2676.21 / 689.06. Vite reports expected large lazy corpus/editor chunks; no editor loads on initial non-code surfaces. Final integrated numbers supersede these in `V3_BUNDLE_REPORT.md`.

Representative screenshots: `qa/screenshots/v3-code-sandbox-{desktop,phone}-chrome.png` and `qa/screenshots/v3-code-interview-{desktop,phone}-chrome.png`. Desktop workbench and phone review images were visually inspected. Submitted interview answers remain disabled but their labels retain readable contrast.

Additional first-impression evidence: `v3-code-sandbox-catalog-{desktop,phone}-chrome.png` and `v3-code-interview-sessions-{desktop,phone}-chrome.png` in the same screenshot directory, captured at the initial scroll position. These supplement, rather than replace, interaction/review evidence.
