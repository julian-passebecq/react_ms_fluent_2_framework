# AGENTS.md

## Mission

Build a reusable Datapass visual-learning and source-aware documentation foundation, not another one-off website.

## Read first

1. `START_HERE.md`
2. `CODEX_MASTER_PROMPT.md`
3. `V1_1_DELTA.md`

## Rules

- Preserve working behavior while refactoring.
- New reusable library code should be TypeScript.
- ConceptMotion core cannot depend on React, Fluent, Monaco, Power BI or browser DOM.
- `@datapass/knowledge` cannot depend on React, Fluent, DOM, crawlers, fetch or AI services.
- Prefer semantic specs to coordinates.
- Preserve stable object identity when movement is part of the lesson.
- Use Fluent v9 for generic application controls; do not rebuild it.
- Use Monaco only for challenge/spec editing and diff surfaces.
- Keep default visuals restrained and professional.
- Motion must communicate meaning.
- Airflow/Fabric/ADF/Lakeflow must share one workflow semantic model.
- Do not build actual pipeline execution or a universal code judge.
- Implement small EN/NO application locale infrastructure, not full content translation.
- Add the Knowledge Atlas archetype with local source/status/version/change fixtures only.
- Use stable feature/source IDs for deterministic change-impact demonstration.
- Establish semantic icon IDs/registry fallbacks; do not hard-code vendor asset paths into specs.
- Column-lineage readiness is required; SQL parsing is not.
- Keep FigureFrame/VisualizationSurface renderer-neutral for future D3 chart/narrative integration.
- Treat `reference_material/d3viz_v7_reference/` as read-only architectural reference.
- Treat DAX Formatter, SQL Query Lineage and SQLBI Whiteboard material as read-only future/reference material.
- Do NOT implement D3 SDK v2, GeoStory/Narrative Story, live source monitoring, DAX network calls, SQL parser integration or the Power BI adapter rewrite in this pass.
- Run tests/build and record exact results.
- Do not claim completion for untested behavior.
- Do not implement Data Forge backend/generator itself in this pass.
