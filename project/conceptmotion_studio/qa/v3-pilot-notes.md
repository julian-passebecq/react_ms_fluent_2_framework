# Pilot Center implementation and QA notes

## Consumer boundary

- App: `apps/pilot-center`, package `@datapass/pilot-center`, development port 4180, output `dist-pilot-center`.
- Overview provides canonical project counts, locally overridden building count, open ideas, project next actions and a priority/pinned focus queue.
- Projects supplies cards, table, galaxy, project search/status filters, selected inspector, technologies/features, public source/website destinations and editable local next actions/status/annotations/private-repository links.
- Idea Board supplies create/edit/delete with immediate undo, pinning, status/priority/domain/context/project filters and text/tag search. The five metadata filters are collapsible to keep the phone layout practical. No freeform drag coordinates are required.
- Tools links the actual registry D3 destination and local Studio/Visual Sandbox routes. The local Studio server must be running on port 4173.
- Projects, Ideas and Backups are lazy React routes. There is no Monaco import or code execution surface.

## Exact reuse

| Source/package | Pilot use |
| --- | --- |
| `content/projects.ts` / `projects.registry.json` | The same ten public records used by Studio Project Hub; no duplicate consumer registry |
| `@datapass/ui` | AppShell, TopBar, SideNav, PageHeader, MetricStrip, EntityCard, EntityTable, TagList, LocaleProvider and shared professional theme |
| Fluent v9 | Buttons, badges, fields, inputs, selects and textareas |
| `@conceptmotion/core` | DiagramSpec plus the shared radial/hub layout contract |
| `@datapass/figure` | Production FigurePlayer/diagram.flow renderer, selection, reduced-motion state, text alternative and SVG export |
| `@datapass/content` | Project/Figure contracts, localized text resolution and canonical JSON serialization |
| `@datapass/progress` | Existing guarded replaceable storage adapter; no new browser-storage utility package |

`projectRegistryToDiagram()` is an app-pure content adapter, not a renderer. It sorts stable public IDs and emits one hub plus a dependency edge per project with `layout: { provider: 'radial', hubId: 'project-hub' }`. There is no custom D3 or React graph implementation. Galaxy node selection and the native accessible project selector both drive the same inspector. The visual agent removed synthetic PENDING status labels from opt-in generic diagrams; legacy Workflow/V2 statuses remain untouched.

App-specific code remains in seven small model/component modules plus App, styles and tests. No mega-package was introduced.

## Local data and privacy

Storage key: `datapass:pilot-center:v1`; independent schema version 1. The strict model covers IdeaNote and LocalProjectMetadata, supports safe HTTP(S) links without embedded credentials, validates every enum/known project reference/timestamp, rejects unsupported fields and duplicate IDs, limits backup input to 1 MB and notes to 2000, sorts IDs/tags and emits deterministic JSON. Import is validated first and then explicitly confirmed as replacement or overlay merge. Importing an overlay preserves ideas and unrelated project annotations.

An optional `content/projects.private.local.json` file is accepted only through a runtime file picker/pasted JSON. It is never a static import, fetch, or build input. All public-registry imports point to the canonical public artifact. Local status overrides do not mutate it.

Private backup downloads are clearly labeled and include local notes and URLs. A distinct public-registry-only download accepts canonical records, not PilotState; browser tests import a synthetic private overlay and verify the actual public download omits the private URL, annotation/next action and idea title. Unit tests also verify the public galaxy/registry exports omit synthetic private markers. No real private metadata was used in fixtures or committed.

Malformed existing storage is preserved verbatim and offered as a recovery download. In-memory edits cannot overwrite that value until an explicit validated restore; unavailable host storage produces an honest in-memory-only warning. There is no backend, sync, auth, cloud database, integration, Spark runtime or remote judge.

## Exact isolated QA

All commands were run from `project/conceptmotion_studio` using bundled Node 24.19.0.

- `pnpm exec tsc -b apps/pilot-center --pretty false`: PASS, exit 0 after final source changes.
- `pnpm exec vitest run apps/pilot-center`: PASS, 8 tests in 2 files (2.59 s). Covers deterministic round-trips, invalid/corrupt data, runtime-only overlays, public export privacy, stable pinned ordering and production Diagram/Figure validation/layout.
- `pnpm exec playwright test tests/browser/v3-pilot.spec.ts --reporter=line --output=test-results/pilot-agent`: final isolated run PASS, 4/4 tests in 22.6 s, desktop 1440×1000 and phone 390×844. Covers keyboard project selection and next-action persistence, cards/table/galaxy, zero Monaco requests, all primary surfaces with zero serious/critical Axe findings and no page-level overflow, note create/edit/pin/status/project/tag filtering/delete/undo/reload, deterministic backup, invalid-import non-mutation, preview-confirmed restore, runtime overlay file import and public-only export privacy.
- `pnpm exec vite build --config apps/pilot-center/vite.config.ts`: PASS, 2216 modules. Measured after route-splitting refinement: entry chunk 358.72 kB / 107.65 kB gzip; lazy Projects chunk 130.43 kB / 37.13 kB gzip; Ideas 6.17 kB / 2.11 kB gzip; Backups 3.94 kB / 1.64 kB gzip. These are individual chunks, not the complete initial dependency closure. The root final bundle report/gate is authoritative after shared-package updates.

Visual evidence was captured and inspected in `qa/screenshots/v3-pilot-{galaxy,ideas}-{desktop-chrome,phone-chrome}.png`. Early browser runs caught a real inline-anchor sidebar overlap, which was fixed with scoped block/grid navigation. The required-title locator was changed to its accessible textbox role to avoid Fluent's visual required marker; a screenshot-only locator was narrowed to the production SVG rather than also matching a Fluent chevron. No assertion, comparison tolerance or coverage gate was weakened.

## Remaining boundaries

This is intentionally one-browser/device local, with manual private backups and no multi-tab conflict-resolution or remote persistence. Public statuses are declared metadata, not uptime monitoring. The galaxy keeps a readable native project selector/inspector alternative on phones; the production FigurePlayer owns the narrow-canvas panning behavior and may receive shared refinements. Direct project links may point to source rather than a claimed deployment. Final integrated old/new gates and hosted CI are the root task's responsibility and must pass before release completion.
