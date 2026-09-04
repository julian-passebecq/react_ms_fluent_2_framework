# AGENTS.md — instructions for Codex

This repository is a standalone visual-explanation library/demo named **ConceptMotion Studio**.

Before changing code, read `CODEX_HANDOFF.md`, `AUDIT.md`, `ROADMAP.md`, and `research/SOURCE_AUDIT.md`. For motion work, also read `research/MOVING_VIDEO_SPEC.md`.

## Non-negotiable architecture rules

1. React owns application/UI state. D3 owns the SVG visualization subtree.
2. Prefer semantic scene state over bespoke DOM animation code.
3. Stable IDs are required for moving objects.
4. A catalogue entry is not a live scene unless it exists in `src/data/scenes.js`.
5. Do not create a new renderer just to restyle an existing geometry.
6. Light theme is the default. Dark mode is secondary.
7. Respect `prefers-reduced-motion`; every frame must remain understandable statically.
8. Do not copy external article/Instagram visual assets, logos or branding. Use references for interaction/design principles only.
9. Keep source-specific claims traceable in `research/visual-references.md` or a more specific research note.
10. Do not modify or re-integrate this project into `mlweb`; the user explicitly requested a standalone repo/ZIP.

## Coding direction

- Move pure semantics out of D3 renderers so they can be unit-tested.
- Split the monolithic renderer file as work expands.
- Prefer keyed D3 joins and `enter/update/exit` over `resetLayer()` for concepts where object tracking matters.
- Avoid animation that does not encode a causal/state change.
- Keep scene authoring schema versioned.
- Canonical new scene payload is `data: {...}` + `frames: [...]`; legacy flat scenes are normalized temporarily.

## Content direction

Highest-value user domains:

- SQL/T-SQL/BigQuery/DuckDB: joins, windows, indexing, query plans/performance.
- Python/pandas/PySpark/Polars: filtering, groupby, merge, partition/shuffle.
- DAX/Power BI: filter/row context, CALCULATE, relationship propagation, semantic model, performance.
- Data modeling: Kimball, grain, facts/dimensions, SCD1/2, semantic layer.
- Airflow/pipelines: readiness, trigger rules, retries, branching, backfill, troubleshooting.
- Storage/lakehouse: Parquet internals/pruning, Delta/Iceberg, compaction.
- Algorithms, statistics and classical ML.
- Git/Docker/tool shortcuts and printable cheat sheets.

## Required verification

Always run at least:

```bash
npm run check:offline
```

After dependencies are installed, also run:

```bash
npm run check
```

If you add/modify a renderer, add at least one live scene and a semantic/unit test. If you change visual behavior, inspect it in a real browser at desktop and mobile sizes.

## v0.5 reminder

After reading this file, also read the archive-root documents:

- `../CLOUD_DIAGRAM_GENERATOR.md`
- `../DATA_MODEL_GENERATOR.md`
- `../LIBRARY_PRODUCT_STRATEGY.md`

The next large product objective is to turn cloud diagrams and data models/lineage into first-class structured generator families.
