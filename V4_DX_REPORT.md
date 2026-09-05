# V4 developer-experience report

## Delivered repository-native tooling

Open the repository root in VS Code. `.vscode/settings.json` supplies narrow local JSON associations; `tasks.json` invokes existing workspace scripts with `project/conceptmotion_studio` as cwd; `datapass.code-snippets` contains Figure, Diagram, AppRecipe and Challenge defaults; `extensions.json` only recommends existing optional tooling. No global editor configuration, credentials, extension, background service or MCP server is installed.

Tasks cover development, Storybook, targeted Vitest/browser paths, type checks, consumer builds, schema/spec validation and the final release command. Consumer builds sequence the existing Formation and other-consumer scripts. No full gate runs on save. Task inputs and script/path targets are tested rather than maintained as unverified command examples.

Root/nested AGENTS and `.github/copilot-instructions.md` document current scope, pure-package boundaries, semantic IDs, Fluent controls, lazy Monaco, private-output rules, local persistence, approved reuse and targeted-versus-release verification. Historical prototype instructions are clearly separated from the active TypeScript workspace.

## Structural schema layer

Four local draft-07 schemas live in `project/conceptmotion_studio/schemas/authoring`. File associations are only `*.figure.json`, `*.diagram.json`, `*.app-recipe.json` and `*.challenge.json`; old generator formats and imported catalogs are not reinterpreted.

`scripts/authoring-schemas.ts` is the small typed factory. `schemas:generate` produces committed JSON; `schemas:check` detects drift. `validate:specs <kind> <file>` combines Ajv structural validation with existing runtime validators and exits nonzero for invalid input. It does not modify or execute input. Exact `ajv@8.17.1` is developer-only; consumers and pure runtime packages gain no Ajv dependency.

Coverage includes positive snippet/default examples, every required-field deletion, representative structural negatives, all thirty existing Figures, scaffold presets, a nested Diagram example, runtime-only reference failures and known schema/runtime differences. No production validator was tightened merely to fit an editor schema.

Important limitations are explicit:

- Figure envelopes remain renderer-neutral. A structural pass does not certify arbitrary `spec` payloads or explanation tracks.
- Cross-object identity/reference integrity, group cycles, ports/hubs, duplicate identities and date parsing remain runtime checks.
- AppRecipe metadata and scaffold CLI names have intentionally different accepted subsets.
- Existing unchecked optional fields, including Figure status and Challenge figure payloads, remain compatibility gaps in runtime contracts; the schema does not silently redefine them. Figure presentation safely ignores a non-string status.
- Unknown extensions remain allowed. Schemas are authoring assistance, not a replacement semantic engine.

Visual Sandbox passes the local Figure schema into the existing shared lazy JSON editor, distinguishes applied/valid-pending/invalid input, retains the last valid preview and links the authoring guide and local Storybook. Its bounded runtime parser additionally validates workflow explanation references before Apply.

## Approved examples and enforcement

Storybook preserves all 38 V3 story IDs and adds eight production compositions: compact, regular and expanded Figures; sources/details; learning reasoning; challenge with Figure; architecture semantic node; selected Project Galaxy. All use shared production components and canonical data. Descriptions identify source files, approved usage and boundaries. A built-index guard requires all 46 IDs; Storybook sources/config are now type-checked.

The package boundary audit additionally scans application source for static, lazy and require-style direct Monaco imports. Shared `@datapass/code` imports remain allowed. Existing boundary, bundle, source-map privacy and CI gates remain active; no import restriction was relaxed.

The isolated built-Storybook smoke inspected all eight new stories at 1440px and 390px, with screenshots under `qa/v4-screenshots/storybook-*.png`. This bounded check does not claim accessibility certification for every historical story. Exact development and release results are recorded in [V4_TEST_REPORT.md](V4_TEST_REPORT.md).

See the checked-in [authoring guide](project/conceptmotion_studio/docs/AUTHORING_DX.md) for commands, schema limits and direct local story links. Final overall verification and CI must be read from the test report, not inferred from editor autocomplete.
