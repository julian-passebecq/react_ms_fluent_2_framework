# V4 developer-experience implementation and targeted evidence

## Delivered

- Root `.vscode`: optional existing Playwright/Vitest extension recommendations; local schema associations; 11 tasks using existing pnpm scripts/targeted Vitest with the correct nested-workspace cwd; four JSON snippets with tested defaults. No custom extension or MCP server.
- Root/nested AGENTS and Copilot instructions now describe the seven-consumer shared platform, package map, legacy separation, privacy/persistence boundaries and targeted-development versus final-release QA. Historical V1/V2/V3 research and reports remain intact. The OpenAI Docs skill informed the concise root/nested instruction layering, using the official source linked in `docs/AUTHORING_DX.md`; no global agent settings were changed.
- Four generated draft-07 editor structural schemas, a typed factory and byte-drift check, an authoring CLI reporting both schema and existing runtime validation results, and exhaustive top-level key/enum checks. Runtime validators are unchanged; Figure payloads and semantic explanation extensions remain renderer-neutral.
- `test:dx` type-checks the authoring scripts and Storybook sources/config, checks generated schemas, then runs the focused DX tests. It is included in offline checks and hosted CI. Existing gates and thresholds remain intact.
- Boundary audit additionally rejects literal direct Monaco imports in app TypeScript source, including dynamic/require forms; shared `@datapass/code` use remains allowed.
- Eight new production Storybook compositions and documentation metadata on all six existing story groups. The index check preserves all 38 V3 IDs and requires the eight V4 IDs. No story is replaced by an alternate renderer.
- Root dev-only dependencies: exact `ajv@8.17.1` and existing-project-version `@fluentui/react-components@9.74.7` for Storybook controls. The lock also includes the coordinated three-consumer `@conceptmotion/react` workspace links. No new pure-package/runtime dependency was introduced. Private root workspace version is 4.0.0; package contract versions remain unchanged.
- CI retains its functional concurrency/cancellation policy under the V4 label and uploads `qa/v4-screenshots` in addition to old evidence. Bundle scripts keep all assertions and now write `qa/v4-studio-bundle.json`, `qa/v4-bundles.json` and `qa/v4-bundle-privacy.json`, preserving historical report files.

## Exact targeted checks

Commands ran from `project/conceptmotion_studio` with Node 24.19.0/pnpm 11.19.0. No full release gate was run by this implementation subtask.

| Check | Observed result |
| --- | --- |
| `pnpm install --frozen-lockfile` | PASS; all 20 workspace projects synchronized, 982 ms |
| `pnpm test:dx` | PASS; authoring + all Storybook TypeScript checks, four generated schemas unchanged, **22 tests / 1 file**, Vitest 9.62 s |
| `pnpm build:storybook` | PASS; 3364 transformed modules; Vite preview build 7.67 s; expected large lazy Monaco/addon warnings remain |
| `node scripts/check-storybook.mjs` | PASS; **46 indexed stories**, preserved 38 plus required eight |
| `pnpm validate:specs figure schemas/authoring/examples/source-to-store.figure.json` | PASS; structural and runtime results both true |
| `pnpm check:boundaries` | PASS; 109 package source files, 12 boundaries, **80 app files** checked for direct Monaco |
| Built-Storybook privacy scan using `requireBundlePrivacy(process.cwd(), ['storybook-static'])` | PASS; 63 text artifacts, including applicable maps/metadata; nine binary assets excluded; zero prohibited private-source URLs |

The 22 DX tests cover configuration parsing, real task commands/input/default paths, narrow local schema associations, all four snippet defaults, all 30 preserved migrated Figure envelopes, four scaffold presets, each required-field deletion, representative structural rejection, runtime-only graph/reference/date/duplicate-ID checks, deliberate historical optional-field acceptance, AppRecipe/scaffold-name distinction, eight real story metadata/source/guide mappings and the 46-story index regression guard.

An isolated Chrome smoke served the built Storybook output through a temporary local Vite preview and checked all eight new compositions at 1440×900 and 390×900: **16/16 PASS**. Every case had zero page overflow, zero serious/critical Axe findings, no renderer error and no browser page error. It exercised keyboard opening of the initially closed source disclosure, the real challenge Visualize action, and public Project Galaxy selection. Screenshots are `qa/v4-screenshots/storybook-<story>-<width>.png`; compact-phone, source-details-phone, architecture-desktop and Galaxy-desktop images were visually inspected. The isolated harness used explicit browser contexts and waited/retried only when Storybook's own a11y addon was already running Axe; assertions and addon behavior were not weakened.

These Storybook screenshots describe the isolated build made during shared implementation; the final integrated build/consumer visual evidence supersedes any in-flight shared visual changes.

After final opt-in viewport/panning and semantic graph font/aspect-fit adjustments, `pnpm build:storybook` passed again (3364 modules, Vite 6.51 s, all 46 required story IDs). A targeted refresh reran **six cases**: ChallengeWithFigure, ArchitectureSemanticNode and ProjectGalaxySelection, each at 1440×900 and 390×900. All six passed with zero page overflow, zero serious/critical Axe findings, no renderer errors and no page errors. Their existing `storybook-<story>-<width>.png` files were replaced with full-story captures, retaining the tested viewport widths. The updated desktop Architecture/Galaxy and phone Challenge images were inspected: graph labels are larger, all Galaxy nodes/selected public summary are captured, and phone figures remain internally pannable. The rebuilt Storybook privacy scan again passed: 63 text files, nine binary exclusions, zero prohibited URLs. The temporary preview was closed after the smoke.

The browser smoke was an isolated inline Node/Playwright harness using the built Storybook iframe URLs; it is targeted manual browser evidence, not a new checked-in release gate. Checked-in `test:dx` and the Storybook index check remain the reproducible automated DX gates.

## Compatibility and limits

Schemas are structural authoring assistance, not a second semantic implementation. Unknown extensions remain accepted. Graph references/cycles, variant ID uniqueness and timestamp parse semantics are runtime-only. Figure `spec` is opaque to the envelope schema. Existing optional `status`/challenge `figure`/variant note validation gaps remain documented, not silently tightened. AppRecipe metadata is not executable scaffold input.

An independent read-only review of shared disclosure/token/Figure presentation and Visual Sandbox code found one sizing compatibility regression: an invalid renderer payload could throw while computing an opt-in viewport before reaching the established accessible scene fallback. A read-only render diagnostic reproduced legacy fallback versus the thrown sized path. Root added a guarded viewport fallback and four-size regression coverage. No other material correctness/security finding was identified in the reviewed changes.

The separate legacy handoff smoke initially exposed `handoff.version` 3.0.0 versus the requested root package 4.0.0 bump. Root corrected the current handoff manifest and confirmed the unchanged test passes for v4.0.0, 28 renderers and 21 documentation entries. Root owns the final integrated old/new gate, current release reports and exact hosted CI evidence. No commit or push was performed by this subtask.

## Hosted fallback-font follow-up

Initial hosted V4 run 33931609911 exposed semantic title overflow in Architecture/Galaxy with Linux fallback fonts; all 46 other browser cases, including the four original screenshot comparisons, passed. After the renderer's bounded glyph-budget correction, Storybook rebuilt successfully (3,364 modules, Vite 9.22 s, all 46 required IDs). The four affected ArchitectureSemanticNode/ProjectGalaxySelection cases at 1440/390 passed in 5.70 s with zero overflow, serious/critical Axe findings and page/renderer errors. Only their four current Storybook screenshots were refreshed. Desktop Galaxy and phone Architecture captures were inspected; the temporary preview was closed. This remains targeted manual browser evidence, not a new release gate. The root test report records the renderer regressions, rebuilt output checks and exact hosted-verification handoff procedure.
