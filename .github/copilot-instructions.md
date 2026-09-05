# Datapass repository guidance

Follow the current user scope and root/nested AGENTS.md. This is a reusable visual-learning platform, not a new app rewrite. Code/toolchain commands run from `project/conceptmotion_studio` with pnpm. Use existing packages:

- Catalog and Fluent composites → `@datapass/ui`.
- Code/editor/diff → lazy `@datapass/code`; no direct Monaco imports in apps.
- Learning/challenge/assessment → `@datapass/learning` and canonical content contracts.
- Figure → `FigureSpec` with `@datapass/figure`; presentation size belongs to component props, not content.
- Animation → existing ConceptMotion semantic specs, stable IDs and shared renderers; no bespoke SVG animation when an existing family fits.
- Architecture/project graphs → `DiagramSpec` and deterministic shared layout, never a second graph engine.
- Progress → `@datapass/progress`; keep persistence keys and private Pilot data compatible.

Core/content/knowledge/progress remain pure. Use Fluent v9 controls without wrapping every primitive. Extract repeated behavior only with three-consumer evidence or a clear semantic boundary. Keep consumer metadata concise and developer details opt-in; preserve required attribution and truthful execution labels.

Schemas in `schemas/authoring` are tested structural authoring aids, not replacement validators. Use `pnpm validate:specs` and renderer-specific tests; keep unknown extension fields compatible. Do not statically import private overlays or publish private source URLs in any output, including source maps.

During implementation run affected unit tests, affected builds and targeted browser flows. Run `pnpm check` once on the finished release tree, then verify hosted CI on the final commit when release is requested. Never disable comparisons, weaken Axe/overflow/privacy/coverage gates, or claim untested work passed.

No new backend, auth, cloud sync, universal judge, Spark/Jupyter execution, news/mail/social integration, D3 Power BI rewrite, GeoStory, VS Code extension or MCP server is authorized by repository guidance.
