# Reference manifest

## Current project baseline

`project/conceptmotion_studio/` is the existing implementation to improve. It is not disposable scaffolding.

Codex must inspect and preserve useful behavior before refactoring.

## User visual references

`reference_material/user_media/`

Includes supplied screenshots/video/contact sheets used to communicate desired interaction and UI direction, including:

- interactive explanatory motion;
- moving table/algorithm behavior;
- concise portfolio progression/workbench UI;
- Fluent/FabricStack visual references.

These files are inspiration. Do not rasterize them into the product or clone branded layouts pixel-for-pixel.

## Data Forge consumer references

`reference_material/data_forge/`

Contains only the subset needed to understand how the future Data Forge product should consume this foundation. Do not implement Forge in this pass.

## D3 SDK v7 read-only reference

`reference_material/d3viz_v7_reference/`

Contains the important architectural files from the user's separate D3 visualization SDK/generator, including:

- `AI_VISUALIZATION_PROMPT.md`;
- `USER_D3_GENERATOR_HANDOFF.md`;
- `chart-spec.schema.json`;
- `d3viz-core.js`;
- `motion.js`;
- `advanced-patterns.js`;
- `pattern-catalog.json`;
- `exporters.js`;
- `themes.js`;
- `examples.js`;
- `generator.js` plus sandbox HTML/CSS;
- README/QA notes.

Purpose: understand the existing factorized D3 direction so Foundation v1.1 leaves clean integration points.

The full user-supplied v7 snapshot is also included as `reference_material/d3viz-generator-v7-full-reference.zip` if Codex needs broader source context. It is still read-only for Foundation v1.1.

Do NOT implement or refactor that SDK in this pass. Future work is specified in `D3_SDK_V2_BRIDGE_AND_ROADMAP.md` and `D3_GEOSTORY_V2.md`.

## Prior research

`prior_research/` preserves useful earlier research on diagram generation, information architecture, style systems and product strategy. New architecture in this handoff takes precedence where there is conflict.

## Source packages reviewed but intentionally not embedded

The broader working session also contained source archives for Fluent UI, Office UI Fabric, Fabric sample workloads, Power BI React, BBC/ggplot references, FT/Economist visual references, ZillaCode/LeetCode clones and private training notebooks.

They are not all recopied into this handoff because that would bloat the package and encourage source-copying. Use official packages/APIs and the summarized requirements.

The paid SQL/Jupyter training archives are private reference material. Do not republish their prose/notebooks unless redistribution rights are confirmed.

## V1.1 added read-only references

`reference_material/v11_sources/`

- `SQLQueryLineage-main.zip` - future parser-adapter reference; MIT project, do not integrate the parser in Foundation v1.1.
- `DaxFormatter-master.zip` - future DAX format/diagnostics adapter reference; do not call the external formatting service in Foundation v1.1.
- `SQLBI-Whiteboard-README.md`, `SQLBI-Whiteboard-wimport.md`, `SQLBI-Whiteboard-export.md` - conceptual reference for vector/SVG preservation, compact code containers, replay and export. Do not port WPF/ink architecture.
- `WEB_RESEARCH_V11.md` - official source URLs and the historical D3-in-Power-BI note.

`reference_material/user_media_v11/`

Contains user-supplied visual references for:

- compact concept-category icons;
- code-led teaching;
- hand-drawn/whiteboard-style explanatory diagrams.

They are visual inspiration only. Do not clone/reuse copyrighted video/course content.

## V1.1 future-only schemas

`reference_material/schema_drafts/`

- `knowledge-entry.schema.reference.json` - source-aware documentation metadata draft.
- `change-event.schema.reference.json` - normalized future update/change event draft.
- `narrative-story.schema.reference.json` - V2-only narrative/map story draft; do not implement its renderer in v1.1.
