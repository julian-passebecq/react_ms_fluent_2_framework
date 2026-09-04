# Diagram & Visualization Strategy

The uploaded repositories contain several powerful diagramming products, but V1 should not embed all of them.

## Core outputs

### Mermaid — use now

Generate Mermaid text from the canonical `DataModelSpec`.

Use:

#### ER diagrams
For relational/star models:
- entities
- attributes
- crow's-foot cardinality.

#### Flowcharts
For:
- Source -> Bronze -> Silver -> Gold -> BI/ML
- dbt/Airflow dependency overview.

#### Architecture diagrams
Use Mermaid architecture syntax where it improves cloud/system documentation.

Mermaid is suitable because:
- text is version-control friendly,
- diagrams can live in generated README files,
- it renders naturally in a React web UI,
- the supplied repository includes ER and architecture diagram support.

Do not vendor the entire Mermaid source repository.
Use the package dependency.

---

# Draw.io — useful concept, optional export later

The supplied draw.io source includes a SQL plugin that:
- parses `CREATE TABLE`
- identifies PK/FK
- builds visual table cells
- links relationships.

Important product lesson:

> If Forge generates clean DDL and a canonical model spec, users can visualize it in many external tools.

Potential V1.5:
- export `.drawio` / diagrams.net file, or
- provide DDL explicitly suitable for draw.io SQL import.

Do not embed the 60+ MB draw.io application in Forge V1.

Also respect draw.io icon/stencil licensing restrictions.

---

# Excalidraw — not core V1

Useful interaction ideas:
- JSON document format
- zoom/pan
- arrow binding
- export SVG/PNG
- shape libraries.

But Forge is not a free-form whiteboard.

Do not add Excalidraw unless a later “Architecture Sketch” feature has a clear user need.

---

# Python `diagrams` library — not required

Useful idea:
- architecture as code
- provider icons
- version-controlled diagrams.

But adding Python solely to generate architecture pictures is unnecessary because:
- Forge already has Mermaid,
- the backend is C#,
- the web app can render Mermaid/D3.

Optional later exporter only.

---

# Cloudcraft — not V1

Useful idea:
- programmatic cloud blueprints
- reverse engineering
- export/import.

But it depends on an external Cloudcraft API/service.

Do not make it a Forge dependency.

---

# D3 — use selectively

D3 is not the main app framework.

Use D3 for visuals that ordinary charts/diagrams do not explain well:

- filter animation
- join fanout
- ROW_NUMBER/window animation
- SCD2 timeline
- CDC event application
- skew/partition visual
- generated distribution preview.

For ordinary KPI charts:
use lightweight React/Fluent/chart components.

---

# Animated chart repositories

The uploaded animated chart repositories are useful as small UI references, but not essential architecture dependencies.

Avoid adding libraries only because they animate.

Use:
- simple chart library / Fluent-compatible charts for dashboards
- D3 for custom explanatory animation.

The React Native chart repository is irrelevant to the web V1.
