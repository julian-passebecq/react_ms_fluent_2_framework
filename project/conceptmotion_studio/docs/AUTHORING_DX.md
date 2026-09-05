# Datapass authoring and developer tools

Open the repository root in VS Code to load `.vscode` settings, tasks and snippets. Commands below run from `project/conceptmotion_studio`, using the pinned pnpm/Node toolchain. Extension recommendations are optional existing Playwright/Vitest integrations; there is no custom extension or MCP server.

## Start small

- Affected tests: `pnpm exec vitest run packages/content` (substitute the affected path).
- Storybook: `pnpm storybook`, then open [approved compositions](http://localhost:6006/?path=/story/v4-approved-compositions--compact-figure).
- One browser flow: `pnpm test:browser tests/browser/v3-pilot.spec.ts`.
- All six consumer builds: `pnpm build:consumer` followed by `pnpm build:v3`. Studio builds separately with `pnpm build`.
- Scaffold: `pnpm scaffold:app --name my-learning-app --preset learning` or `--preset catalog`. Existing directories are never overwritten; generated apps are explicit authoring actions, not new V4 products.
- Finished release tree only: `pnpm check`, followed by observed hosted CI on the exact final commit when release is requested.

VS Code tasks invoke these scripts directly. They do not reimplement checks or silently run a full release gate on save. No workspace folder is excluded from source control by these editor preferences.

## Structural schemas, authoritative runtime validation

Four local draft-07 schemas live in `schemas/authoring/`. Their `urn:datapass:schema:<kind>:1` identifiers are names, not remote services. They contain no remote `$ref` dependency. Monaco can import `figure.schema.json` directly; VS Code associates only `*.figure.json`, `*.diagram.json`, `*.app-recipe.json` and `*.challenge.json`. Imported practice catalogs and legacy JSON keep their own formats.

`dp-figure`, `dp-diagram`, `dp-app-recipe` and `dp-challenge` snippets expand to schema/runtime-tested default JSON. For example:

```sh
pnpm validate:specs figure schemas/authoring/examples/source-to-store.figure.json
pnpm test:dx
```

The validation command reports both structural-schema and runtime results. Invalid input exits nonzero. It never executes code, imports JavaScript from the input, or modifies the input file.

The typed factory is `scripts/authoring-schemas.ts`; generated JSON is checked in. When a validated structural contract changes, update the factory plus positive/negative runtime-paired fixtures, run `pnpm schemas:generate`, review the generated delta, then `pnpm test:dx`. The type check exhaustively checks top-level Figure/Diagram/AppRecipe property coverage and enum unions; FlowKind values come directly from the production registry. Runtime validators themselves are unchanged.

Important limits:

- Figure schemas validate the envelope, not arbitrary renderer payloads. `spec` remains renderer-neutral JSON, including additive explanation semantics. Validate/compile the corresponding renderer contract before claiming a working scene.
- Diagram graph references, unique object IDs, group cycles/ownership, ports and hub integrity remain runtime checks. Editor autocomplete cannot replace them.
- AppRecipe metadata is not scaffold CLI input. For compatibility its name validator accepts some names the scaffold generator rejects (for example a leading digit). The generator remains authoritative when creating an app.
- Challenge authoring covers the existing validated subset. Optional `figure`, variant notes/explanations and Figure status have historical runtime-validation gaps; schemas preserve these rather than silently changing runtime acceptance. Validate an attached Figure separately.
- Unknown extension fields remain allowed. Date parse semantics and cross-object ID uniqueness are runtime-only and have explicit parity-limit tests.

## Approved production compositions

All examples use production components and canonical local content, not alternate demonstration renderers:

- [Compact Figure](http://localhost:6006/?path=/story/v4-approved-compositions--compact-figure), [regular](http://localhost:6006/?path=/story/v4-approved-compositions--regular-figure), [expanded](http://localhost:6006/?path=/story/v4-approved-compositions--expanded-figure): `FigurePlayer` presentation props, not changes to FigureSpec.
- [Sources and details](http://localhost:6006/?path=/story/v4-approved-compositions--sources-and-details): shared closed-by-default `ContentDetails`; required attribution remains visible where required.
- [Learning reasoning](http://localhost:6006/?path=/story/v4-approved-compositions--learning-reasoning): explanation, semantic figure and a prediction prompt.
- [Challenge with Figure](http://localhost:6006/?path=/story/v4-approved-compositions--challenge-with-figure): shared challenge composition and explicit Visualize affordance.
- [Architecture semantic node](http://localhost:6006/?path=/story/v4-approved-compositions--architecture-semantic-node): shared Diagram/category/icon rendering.
- [Project Galaxy selection](http://localhost:6006/?path=/story/v4-approved-compositions--project-galaxy-selection): canonical public registry and shared deterministic layout; no private Pilot data.

Story metadata records usage boundaries and source files. Storybook build/index success is not a claim that every story received browser or accessibility certification.

## Agent instruction scope

Root AGENTS.md contains repository-wide boundaries; nested workspace AGENTS.md adds local commands and legacy separation without overriding current architecture. Copilot instructions share the same package map. This layering follows [official OpenAI AGENTS.md guidance](https://learn.chatgpt.com/docs/agent-configuration/agents-md). No global user settings, model configuration or credentials are changed.
