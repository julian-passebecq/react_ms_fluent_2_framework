# V4 factorisation report

## Audit method and starting evidence

Read-only source audit at `36c01d404e0acfd0bf9b55417ad48b4e9285586c`, before extraction. Counts describe distinct consumers unless a callsite count is stated. The seven `apps/*/src/styles.css` files, app composition, Figure/learning/progress packages and URL state helpers were inspected.

| Candidate | Evidence count | Decision | Reason |
| --- | --- | --- | --- |
| Semantic color/surface/radius tokens | 7 app styles use white surfaces; all 7 use equivalent but divergent warm/navy/teal/neutral palettes | EXTRACT SHARED | Existing Fluent theme + Datapass variables are the correct boundary; additive named tokens replace repeated literals without a theme framework. Exact navy literals occur in pairs, not seven identical declarations. |
| Figure size / metadata / export/panning composition | FigurePlayer directly used in 5 apps; FigureView also serves shared notebook/challenge paths | EXTRACT SHARED | Strong renderer-neutral Figure boundary; consumer size choice must not become scene content or copied renderer geometry. |
| Source/details disclosure | 3 audited learning consumers plus both Atlases expose similar source/audit blocks | EXTRACT SHARED | One accessible details composition; actual attribution and source interpretation remain consumer-owned. |
| Existing ProgressSummary implementation copy | 1 shared implementation, 3 consumers, 5 page callsites | DELETE / REPLACE | Add consumer/developer presentation there; no new progress wrapper. |
| Challenge manual Figure controls | 1 shared workbench used by 2 apps, alongside Formation/Atlas FigurePlayer | DELETE / REPLACE | Strong existing Figure boundary overrides the numeric three-consumer rule; retain challenge-specific navigation outside it. |
| Repeated reduced-motion subscriptions | Formation LessonPage, Sandbox ChallengePage, Interview SessionPage (3); Studio has a preview policy | DELETE / REPLACE | Reuse existing `useReducedMotion`; Studio override remains local authoring policy. |
| App shell/header/navigation | AppShell in 5 apps; PageHeader in 17 callsites across 5 apps; 2 Atlas-specific page silhouettes | KEEP LOCAL | Shared shell/header primitives already exist. No route framework or mandatory same-shaped page wrapper. |
| Catalog filters / metrics / URL state | Several catalogs with different entities; shared SearchFilterBar/EntityCard/URL helpers already present | KEEP LOCAL | Preserve consumer facet and route semantics; only tighten common presentation where proven. |
| Backup forms | 2 similar coding consumers; Formation uses a different store/migration policy | DEFER | Below three identical behavior consumers; do not invent a universal persistence adapter. |
| Local progress adapters | usePracticeWorkspace already shared by 2 coding apps; Formation has separate V1.1 migration | KEEP LOCAL | Shared semantics do not imply merged persistence keys or policies. |
| Pilot Idea Board and private overlays | 1 consumer | KEEP LOCAL | Deliberately local data model; no new cross-cutting state package. |
| Interview session/review policy | 1 consumer | KEEP LOCAL | Product-specific timing, question bank and review priorities. |
| Atlas provider/stage policy | 1 consumer | KEEP LOCAL | Provider lenses are content, not a new graph engine. |
| Responsive breakpoints/main layout | Identical 700px coding breakpoint in 2 apps; Atlases, Formation and Pilot use different layouts | KEEP LOCAL | Tokenize common surfaces, not consumer-specific layout decisions. |
| Code/data/state rendering cues | Existing loop focus plus new shared table/join/workflow cue requirements (4 renderer families) | EXTRACT SHARED | Stable semantic references and a shared SVG panel are a clear visualization boundary; no per-concept renderer. |
| Semantic graph icons/categories | Architecture and Pilot use the same Diagram/graph stack (2 consumers) | DELETE / REPLACE | Wire the existing semantic icon registry into the graph renderer instead of adding a second registry/component stack. |

## Outcome ledger

The table above records decisions made before coding. The delivered delta is confined to existing packages; no package, generic state store, router, renderer family or app was created.

| Shared boundary | Delivered change | Consumers / evidence |
| --- | --- | --- |
| UI presentation | `ContentDetails`, semantic CSS/TypeScript surface tokens, opt-in `dp-consumer`, additive FigureFrame details slot | All seven entry points adopt the visual system; Figure/notebook/progress/challenge metadata share the native disclosure. A Node tooling test checks token parity; component tests cover closed/open disclosure and visible attribution. |
| Figure composition | Presentation size, consumer/developer metadata, human attribution, shared playback/selection/captions/export | Existing Atlas/Formation/Studio/Pilot uses plus the shared coding workbench. Size changes do not mutate FigureSpec; malformed sizing preserves accessible renderer fallback. |
| Challenge visualization | Removed local frame state, frame-count calculation and bespoke previous/next/reset controls | Sandbox and Interview use the same FigurePlayer through ChallengeWorkbench, preserving meaningful navigation rather than only reducing line count. |
| Reduced motion | Replaced three consumer matchMedia copies with the existing hook | Formation, Sandbox and Interview. Visual Sandbox retains an intentional authoring override control. |
| Semantic explanation | Optional pure track validation/resolution plus one SVG code/state cue panel | Eleven existing scenes, four existing renderer families; thirty Figure records and stable source/outcome identities retained. |
| Graph node semantics | Existing registry fallback is now used by opt-in semantic node cards; shared deterministic layout remains the engine | Architecture and Project Galaxy. Category/status/selection are semantic; provider content and registry policy stay local. |
| Visual availability | Lightweight canonical practice-ID projection separated from full compiled scenes | Sandbox catalog can advertise real mappings without statically importing the rendering corpus. Equality tests guard projection drift. |

## Changed public APIs and defaults

| Package | API delta | Compatibility |
| --- | --- | --- |
| `@datapass/ui` | `ContentDetails`, `ContentDetailsProps`, `datapassSurfaceTokens`; `FigureFrameProps.details` | Additive. Native details defaults closed and accepts normal details attributes. Existing SourceNote remains renderer-neutral and outside optional detail. Existing Datapass CSS variables alias the semantic tokens. |
| `@datapass/figure` | `FigurePresentationSize`, `FigureMetadataMode`; `FigureView`/`FigurePlayer` props `presentationSize`, `metadataMode`, `source`, `note`; size in adapter context | No FigureSpec change. Omitted size retains 960×540 and the old 600px pan breakpoint. Explicit sizes use content-aware stable viewports and native-size panning below 840px. Consumer metadata is the intentional new default; developer mode exposes raw metadata/selection. |
| `@datapass/figure` | Authored per-step caption inference when explicit captions are absent | Does not repeat a static takeaway as if it were changing state. Explicit localized caption arrays retain precedence; fallback text stays available. |
| `@datapass/learning` | `NotebookLesson`, `ProgressSummary`, `ChallengeWorkbench.metadataMode`; `ChallengeWorkbench.figureCaptions`; `AssessmentRunner.headingLevel` | Additive; metadata defaults consumer, standalone assessment heading defaults h1. Embedded compositions opt into h2. Existing stores and grading semantics are unchanged. |
| `@conceptmotion/core` | Explanation focus/code/state/step/track/context/result types; `validateExplanationTrack`, `resolveExplanationStep`; optional explanation in Loop/Workflow specs | Pure TypeScript; no React/DOM/Fluent/Monaco dependency. Stable entity/code/state references, one step per frame, finite scalar state and duplicate/reference validation. Existing specs without tracks remain valid. |
| `@conceptmotion/svg` | Optional explanation in table/join scene payloads; `resolveSceneExplanation`, `recommendedSceneViewport`; shared cue-panel helpers | Additive renderer adaptation. Same renderer IDs, pure deterministic viewport recommendations, stable keyed marks and deterministic exports. No scene-specific React animation or new renderer family. |

The semantic token vocabulary is `--dp-canvas-warm`, `--dp-surface-base`, `--dp-surface-raised`, `--dp-ink-primary`, `--dp-ink-secondary`, `--dp-accent-teal`, `--dp-accent-amber`, `--dp-border-subtle`, `--dp-elevation-low`, `--dp-radius-card` and `--dp-radius-control`. CSS and TypeScript token values are parity-tested.

## Deliberate non-extractions

Backups remain product-local because two superficially similar controls have different persistence policies. Interview reasoning/trade-off guidance stays in Interview. Pilot notes/private overlays and provider translations remain local domain policy. AppShell, PageHeader, catalogs, progress stores, routing and layout breakpoints were reused where appropriate, not wrapped in another platform layer. The legacy D3 application is not rewritten.

No claim is made that every repeated line disappeared. V4 removes proven behavioral/presentation duplication while retaining useful local composition. [V4_TEST_REPORT.md](V4_TEST_REPORT.md) records the targeted and final evidence; [V4_MIGRATION_LOG.md](V4_MIGRATION_LOG.md) records visible-default and identifier compatibility decisions.
