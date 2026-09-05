# V4 developer experience — VS Code, Copilot, Codex

## Decision

Do not build a VS Code extension yet.

V4 should capture most of the value with repo-native tooling that works for humans, Copilot and Codex.

## `.vscode/`

Add/standardize:

- `extensions.json`
- `settings.json`
- `tasks.json`
- `datapass.code-snippets`

Suggested tasks:

```text
Datapass: Run affected unit tests
Datapass: Run Storybook
Datapass: Build all consumers
Datapass: Run browser smoke
Datapass: Run full release gate
Datapass: Scaffold learning app
Datapass: Scaffold catalog app
Datapass: Validate visual specs
```

Use existing scripts rather than duplicating logic in VS Code task definitions.

## AI instructions

Add/refine:

- root `AGENTS.md`
- `.github/copilot-instructions.md`

Make the architecture explicit:

```text
Catalog → @datapass/ui
Code editor/diff → @datapass/code
Learning/challenge/assessment → @datapass/learning
Figure → FigureSpec + @datapass/figure
Animated explanation → ConceptMotion semantic spec
Architecture/project graph → DiagramSpec + shared layout
Progress → @datapass/progress
```

Explicitly forbid direct Monaco imports in apps and bespoke SVG animation when an existing semantic renderer fits.

## JSON schemas

If current validators/contracts can support it cleanly, check in JSON Schemas for the most agent-authored serializable artifacts:

- FigureSpec
- DiagramSpec
- AppRecipe / scaffold recipe
- challenge/practice definition subset used for authored content

Associate schemas in VS Code settings for autocomplete/validation.

Do not create a second validation source of truth. If schemas cannot be generated or tested against current TypeScript validation, defer rather than allow drift.

## Storybook / Golden Gallery

Add documentation metadata for approved composition patterns, not only low-level components.

Useful V4 stories:

- compact / regular / expanded Figure presentation
- source/details disclosure
- learning reasoning section
- challenge with Figure
- architecture semantic node
- project galaxy selection state

Do not build an MCP server in V4 unless an existing Storybook-native mechanism makes it nearly free. Prepare metadata so MCP can be considered in V5.
