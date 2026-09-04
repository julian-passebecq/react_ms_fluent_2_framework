# ConceptMotion Studio

ConceptMotion Studio is a standalone **visual explanation library + catalogue** for modern data work. It is broader than a classical algorithm visualizer: the same system is intended to explain SQL joins/windows/indexing, DAX context, pandas/PySpark transformations, Kimball modeling, Airflow DAG behavior, Parquet storage, statistics/ML, Git/Docker mechanics, and printable shortcuts.

The primary author is expected to be an **AI agent**. The AI should usually generate semantic scene state rather than bespoke SVG/DOM animation code.

> Codex takeover: start with [`CODEX_HANDOFF.md`](./CODEX_HANDOFF.md) and [`AGENTS.md`](./AGENTS.md).

## Current handoff inventory

- **186** catalogued concepts across **12** domains.
- **36** implemented live scenes.
- **28** D3 renderer families.
- **16** printable catalogue sheets.
- **15** cross-language semantic actions.
- **8** syntax lenses: Python, pandas, T-SQL, BigQuery, DuckDB, PySpark, Polars, DAX.
- React application shell + D3 SVG renderers.
- Dependency-free Python authoring helper.
- Offline semantic/data integrity tests.

The catalogue is intentionally more exhaustive than the live implementation. `Surface` describes the recommended teaching treatment; `LIVE` means it is actually implemented today; `PLANNED` means it belongs to the roadmap. Join storyboards now also construct the output relation explicitly, so match multiplicity and NULL-extension are visible.

## Learning surfaces

| Surface | Best for | Examples |
| --- | --- | --- |
| **Storyboard** | causality/state over time | sorting, SQL window frame, DAG readiness, SCD2, shuffle |
| **Interactive diagram** | structure + parameters | DAX context, star schema, B-tree, PCA |
| **Paper / handwritten sheet** | dense recall | ML summary, Airflow checklist, VS Code shortcuts |
| **Cross-language sheet** | same semantic action, different syntax | filter, group, join, dedup, rolling window |
| **Catalogue** | exhaustive discoverability | planned concepts without a live scene yet |

## Run

```bash
npm install
npm run dev
```

Offline checks that do not require installed front-end dependencies:

```bash
npm run check:offline
```

Full QA/build after install:

```bash
npm run check
```

## Architecture

```text
Catalogue taxonomy / AI prompt / Python metadata
                    │
                    ▼
             semantic scene spec
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
     Storyboard           Paper/Cheat Sheet
          │                   │
          ▼                   ▼
   D3 renderer registry     HTML/CSS print
          │
          ▼
     React application
```

React owns navigation and controls. D3 owns the SVG visualization subtree. Python can author scene JSON but is not the browser renderer.

## Canonical scene v1

New authored scenes should place renderer-specific static payload under `data`:

```js
{
  version: '1',
  id: 'spark-skew',
  title: 'Spark skew',
  renderer: 'partition',
  data: {
    buckets: [...],
    records: [...]
  },
  code: [
    'df.groupBy("customer_id")',
    '  .agg(F.sum("amount"))'
  ],
  frames: [
    {
      operation: 'HASH KEY',
      caption: 'Every record receives a deterministic target partition.',
      positions: { r1: 'p0', r2: 'p1' },
      codeFocus: [0]
    }
  ]
}
```

The bundled scenes are still mostly a legacy flat shape. `src/lib/scene.js` normalizes both while the migration is in progress.

## High-value project rules

1. State the learning invariant first.
2. Choose an existing renderer before inventing geometry.
3. Give moving objects stable IDs.
4. Encode semantic state, not pixel keyframes.
5. Make one conceptual change per frame.
6. Synchronize code lines with the visible operation.
7. Captions explain why the state changed.
8. Every frame must work with reduced motion.
9. Do not claim a planned catalogue entry is already live.
10. Use authoritative domain sources for engine-specific behavior.

## Handoff documentation

- `CODEX_HANDOFF.md` — goal, what was done, doubts, priorities, moving-video description.
- `AGENTS.md` — instructions for Codex.
- `AUDIT.md` — code/product/QA audit.
- `ROADMAP.md` — renderer-first implementation plan.
- `QA_REPORT.md` — tests run and unverified items.
- `docs/ARCHITECTURE.md` — scene/runtime architecture.
- `docs/AUTHORING_CONTRACT.md` — AI scene-writing rules.
- `research/user-reference-notes.md` — descriptions of the user's Bubble Sort video and paper/handwritten references.
- `research/MOVING_VIDEO_SPEC.md` — reconstructed frame-by-frame motion contract and acceptance criteria for the supplied Bubble Sort video.
- `research/visual-references.md` — web/official sources and what each is useful for.
- `research/SOURCE_AUDIT.md` — provenance classes, source trust rules, and exactly what each source informed.

## Research principle

External visual examples are used as **interaction/design references**, not copied assets. Engine semantics should come from authoritative sources where available: Apache Airflow, Microsoft/SQLBI for Power BI/DAX, Apache Parquet, Kimball, etc.
