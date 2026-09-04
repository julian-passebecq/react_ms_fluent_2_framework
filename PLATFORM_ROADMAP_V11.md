# Platform roadmap after Foundation v1.1

This roadmap separates product tracks so future Codex passes do not collapse everything into one monolith.

## Foundation v1.1 - NOW

Implement and prove:

- React + TypeScript + Fluent 2 shared application foundation;
- ConceptMotion core/svg/react package boundaries;
- stable semantic animation;
- Catalog;
- Workbench;
- Explainer;
- Challenge Workbench;
- Orchestration Workbench;
- Knowledge Atlas;
- EN/NO infrastructure;
- renderer-neutral `FigureFrame`;
- `@datapass/knowledge` source/change contracts;
- column-lineage-ready semantics;
- local change-impact demo;
- future code-analysis slot;
- visual regression/accessibility/build QA.

No live monitoring or D3 v2 work.

## Foundation v1.2 - stabilization (after audit)

Only if V1.1 audit identifies real needs:

- API cleanup;
- accessibility fixes;
- responsive fixes;
- visual regression baselines;
- migration helpers;
- performance/cleanup;
- Storybook/component documentation if incomplete.

Do not add a new product family merely to increment the version.

## D3 / Power BI v2

Sibling `@datapass/charts` track:

- same canonical D3 renderer for web/React/Power BI where feasible;
- first-class modern Power BI adapter;
- editorial chart grammar;
- annotations/facets/highlights/direct labels;
- Economist/BBC/FT-inspired structural presets;
- chart recommendation/doctor rules;
- SVG/export profiles;
- GeoStory and narrative storytelling primitives;
- world/city maps, routes, temporal events, flow particles;
- story/tour controller;
- optional Canvas backend later.

## Knowledge Update Engine v2

Separate but compatible track:

- source registry adapters;
- scheduled collection;
- current/history storage;
- normalized `ChangeEvent`;
- change diff/evidence;
- optional AI mapping to feature IDs;
- impacted docs/figures/challenges/book sections;
- review queue;
- notification/PR generation only after confidence and auditability are solid.

Re-use lessons from Microsoft Product Watch's static refresh/history architecture.

## Code Intelligence v2

Optional adapters, not universal execution:

- DAX formatting + diagnostics;
- T-SQL/SQL lineage parsing;
- language-specific syntax/lint where practical;
- generated ConceptMotion lineage from parser output;
- explicit privacy/network disclosures.

Still no requirement for executing every supported language.

## Data Forge integration

Data Forge remains a separate product and consumes the platform:

- `@datapass/ui`;
- `@datapass/knowledge` where generated docs/reference metadata are useful;
- ConceptMotion for schema/model/lineage/workflow explanation;
- future `@datapass/charts` for analytical previews and Power BI output;
- future code-tool adapters where useful.

## Future expressive visual profile

A `sketch`/whiteboard-like renderer skin can be added after the professional foundation is stable.

It is a style profile, not a separate application framework.
