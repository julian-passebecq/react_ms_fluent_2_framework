# V3 consumer validation

The desktop/phone matrix is 1440×1000 and 390×844 in Chrome, with reduced-motion emulation. Tests use the actual production components served by Vite; separate production builds and manifest audits cover release artifacts. No live deployment is claimed.

## Implemented paths and evidence

| Consumer | Validated path | Reuse and boundaries |
| --- | --- | --- |
| Formation | Catalog → Think in SQL → shared join Figure → four prediction answers → assessment submission → mark complete → reload; Python reasoning module; all original V2 notebook/exercise/PySpark/progress flows | Four existing course families, two new six-section reasoning modules, eight new questions. Figure content is shared with Algorithm Atlas. Private Dubreu course material was not supplied and is not claimed as imported. |
| Code Sandbox | Catalog and URL facets → challenge → hints → semantic figure/step → keyboard-edited draft → solution/compare → PySpark variant → notes/flags/mastery → backup/persistence | 323 exact source IDs and 500 variants; shared challenge, code, Figure and progress packages. Illustrations are explanatory adaptations, not executed challenge outputs. Unmapped concepts show a truthful fallback. |
| Code Interview | Distinct session selector → answers → submit → review → flags → domain progress | 36 curated questions across nine domains; quick/focused/mock/domain/review modes. Shared AssessmentRunner and progress; optional code practice is explicitly ungraded. No universal code judge. |
| Algorithm Atlas | Search catalog → Sliding window → reduced-motion step/selection → SVG export/reset | Thirty shared Figure artifacts, all existing semantic renderer families; semantic invariants and stable IDs tested for all thirty. No Monaco requests. |
| Architecture Atlas | Stage selection → Fabric lens → deterministic radial layout → node inspector → SVG export → workflow/lineage | Sixteen source-reference variants normalized to eight stage IDs, four workload families and four provider lenses. Workflow and column lineage reuse existing models. Names are pinned-source terminology, not live service verification. |
| Pilot Center | Cards/table/galaxy → keyboard project selection → local next action → reload; create/edit/filter/pin/delete/undo note → backup → invalid/valid restore → private overlay → public-only export | Same public registry as Studio; shared Diagram/radial/Figure path. Strict local state, visible storage failure, protected corrupt bytes, preview/confirmation for restore. Private overlays are never build imports. |
| Visual Sandbox | Select real Figure → keyboard-edit invalid JSON → keep last valid preview → reset/apply valid spec → SVG export → unknown adapter fallback | Production lazy JsonSpecEditor and FigurePlayer. Preview-width/locale/reduced-motion controls, JSON download, bounded semantic validation. Not a Storybook-only implementation. |

The full browser matrix requires zero serious/critical Axe findings and no page-level horizontal overflow on primary surfaces. Primary controls have keyboard paths. Narrow FigurePlayer canvases retain readable marks in a keyboard-focusable horizontal pan region; surrounding prose/captions remain full-width and readable. Panning does not create page overflow. The existing V2 table/workflow screenshot assertions remain enabled.

## Visual language and review

The bundled Formation image was used as direction, not copied as a literal page. Shared Fluent controls sit on warm neutral surfaces with navy text, restrained teal and sparse amber. Message-first titles/takeaways and textual explanations carry the lesson. Professional Figure profiles use shared renderer tokens; default V2 geometry is unchanged. No theme engine, neon hero or decorative force simulation was added.

Evidence is in `project/conceptmotion_studio/qa/screenshots/`, with desktop/phone pairs for Formation, both coding apps, both Atlases, Pilot and Visual Sandbox. Catalog/session-start images supplement in-flow images. Screenshots were inspected for readable controls, balanced spacing, restrained color, source labels and mobile usability. Automated Axe checks are not a substitute for an exhaustive assistive-technology audit.

## Content reconciliation and limitations

The complete practice source has 211 curriculum, 60 SQL, 24 engine and 28 Python items. Source IDs and original records are retained, with no item exclusions. The 30 migrated visuals are distinct semantic adaptations; only 18 practice-ID references across 17 scenes are mapped, so most of the 323 items intentionally do not claim a migrated animation.

Formation's original representative notebooks remain; no private-course conversion is fabricated. Interview questions are locally authored from the source topics, not a claim that all 323 items were converted into assessments. Progress is browser-local and app-specific; cross-app synchronization, multi-device accounts and remote grading are absent. External launch/download targets remain user actions outside the app.

All code/PySpark surfaces are display, explanation, editing and text comparison or external-launch only. No Spark/Jupyter/backend/auth/news/mail/social integration, D3 Power BI rewrite or GeoStory exists. Final exact old/new QA and hosted CI outcomes are recorded in [V3_TEST_REPORT.md](V3_TEST_REPORT.md).
