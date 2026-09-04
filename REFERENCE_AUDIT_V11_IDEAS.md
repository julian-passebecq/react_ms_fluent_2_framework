# Reference audit - v1.1 ideas

This is a decision note, not a list of features Codex must copy.

## Historical D3-in-Power-BI article

Reference:
`https://www.mssqltips.com/sqlservertip/5273/how-to-render-d3js-custom-charts-in-power-bi-desktop/`

The article is from 2018 and demonstrates the enduring motivation: reuse unusual D3 visualizations inside Power BI. Its implementation path relies on an older third-party D3.js Visual workflow and is historical only.

Do not use it as the v2 Power BI architecture. The existing handoff's modern custom-visual adapter direction remains the source of truth.

## Microsoft Product Watch

Existing repository:
`julian-passebecq/microsoft_news_hub_netlify_v2`

Useful ideas to preserve later:

- source registry;
- scheduled refresh;
- current data + historical archive separation;
- source health/status;
- product/topic classification;
- static JSON deployment.

Do not reuse its old UI as the Knowledge Atlas visual target.

Future goal:

```text
Product Watch detects source changes
              ↓
normalize ChangeEvent
              ↓
Knowledge Atlas / book impact queue
```

## SQLBI Whiteboard reference

Useful concepts:

- SVG/vector preservation;
- code containers and syntax coloring;
- replay/state history;
- structured import/export;
- compact controls.

Not useful for this foundation:

- native WPF architecture;
- low-level pen/touch input;
- full whiteboard document model;
- installer/release machinery.

## SQL Query Lineage reference

Useful concept:

- parser output is structured JSON and can become a renderer-neutral lineage specification.

V1.1 action:

- make column lineage semantics ready;
- use fixture data only.

## DAX Formatter reference

Useful concept:

- format + parse diagnostics can be one optional Challenge Workbench analysis adapter.

V1.1 action:

- extension slot only;
- no external service call.

## Social/video teaching references

The user-provided screenshots show three useful design ideas:

1. compact concept-category icon navigation;
2. code-led explanation with line emphasis;
3. hand-drawn system explanation with a very small number of objects.

Use these as inspiration for clarity and progressive disclosure, not as a request to clone the source content or build video playback.

## Technical documentation source strategy

Official vendor documentation should be source-of-truth for lifecycle/version claims.

For Microsoft Fabric, useful future official source families include:

- Microsoft Fabric What's New;
- What's New archive;
- Fabric roadmap;
- product/workload documentation;
- runtime release-channel notes;
- official blog/release notes where necessary.

Foundation v1.1 stores source identities/metadata only; future monitoring decides how each source is collected.
