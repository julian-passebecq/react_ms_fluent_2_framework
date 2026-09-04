# V3 reuse report

## Evidence of reuse

| Requirement | Shared implementation | Consumers / evidence |
| --- | --- | --- |
| Same semantic learning figures | `content/visuals` + FigurePlayer → FigureView → ConceptMotion | Algorithm Atlas catalogs all 30; Formation capstones reference the same IDs; practice IDs attach the same Figure objects to Code Sandbox/Interview. Migration tests compile every scene and assert invariants. |
| Same diagram/radial semantics | DiagramSpec + pure `radialDiagramLayout`/`layeredDiagramLayout` + existing SVG graph adapter | Architecture Atlas and Pilot Project Galaxy. No second renderer, no random force simulation, no vendor asset paths in specs. |
| Same challenge/assessment/progress semantics | Shared content ChallengeDefinition, learning ChallengeWorkbench/AssessmentRunner, ProgressStateV2 operations | Sandbox is a 323-item exploration/workbench; Interview is a separate 36-question session/review app with optional ungraded practice. Independent app identity and persistence keys. |
| Same public project data | `content/projects.registry.json` → validated `content/projects.ts` | Preserved Studio Project Hub and Pilot cards/table/galaxy. Local overlays never mutate canonical public records or public export. |
| One editor integration | `@datapass/code` lazy Monaco loader/editor/JSON/diff | Studio Challenge/Workflow/Visual Sandbox, Formation exercises and both coding apps. No app imports Monaco directly. |
| Production authoring path | JsonSpecEditor → bounded Figure validator → FigurePlayer/FigureView | Visual Sandbox edits the same Figure contracts and uses the same renderers as consumers. Storybook is additional evidence, not its substitute. |
| Same UI and visual language | Fluent v9 + shared Datapass tokens/classes | Warm neutral canvas, navy ink, restrained teal and sparse amber across seven entry points. Consumer-specific layout remains local. |

## Library changes versus app policy

Library changes are limited to additive challenge/import contracts, the reusable challenge composition, Figure playback/selection/export, opt-in deterministic layouts, shared visual tokens and coverage guards. No product-specific corpus is imported into a reusable package. Core and knowledge purity checks remain unchanged; the learning package's existing composition boundary now explicitly allows shared UI composites.

The 30 visuals are authored semantic content, not 30 bespoke components. All use existing renderer families (classification A); layout is an additive generic extension (B). There are zero new renderer families. Architecture's sixteen translations are normalized content variants and are not double-counted as migrated Algorithm Atlas scenes.

Consumer policy remains separate: Formation course structure; Sandbox catalog facets and learning paths; Interview timing/session selection; Atlas source/stage lenses; Pilot notes and privacy; Visual Sandbox validation workflow. This avoids turning one consumer into a framework dependency.

## Preserved V2 and intentionally unshared state

The old JS Studio, 186 concepts, 36 scenes, 28 legacy renderer families, 16 sheets, 15 cross-language actions, four scaffold recipes and all V1.1/V2 browser tests remain. One workflow model still explains Airflow/Fabric-ADF/Lakeflow. Source monitoring and all execution remain out of scope.

Progress is shared semantically, not synchronized between apps. Different persistence keys prevent a new consumer from overwriting old V2 progress. Pilot's private notes schema belongs to Pilot; no backend or universal data layer was added. Shared source content is pinned/read-only, not fetched live.

## Verification

The package-boundary audit covers 12 boundaries. Unit/component tests cover shared APIs and reference integrity; browser tests traverse each consumer at 1440px and 390px. Bundle checks verify initial-route exclusion of Monaco. Exact current command totals and CI outcomes are in [V3_TEST_REPORT.md](V3_TEST_REPORT.md); detailed content mappings are in [V3_VISUAL_MIGRATION_REPORT.md](V3_VISUAL_MIGRATION_REPORT.md).
