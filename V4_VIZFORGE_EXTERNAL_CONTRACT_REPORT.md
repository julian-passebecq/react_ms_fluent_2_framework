# V4 external renderer contract — 5 September 2026

## Scope and starting evidence

Repository: `julian-passebecq/react_ms_fluent_2_framework`. The clean starting HEAD was exactly `19c87dceeaac4ef6a1f642a28ef0033a140c8545`. The attached V2 pack was read in numeric order, including `00_READ_FIRST.md`, `02_FRAMEWORK_VIZFORGE_SEAM_PROMPT.md` and `09_D3_STORYTELLING_ADDENDUM.md`. Its consumer rerun prompts are reference only for this task. Issue #1, the V4 handoff/audit/factorisation/test reports, external bootstrap/allowlist, Figure APIs, all four scaffold presets and D3/Power BI bridge documents informed the bounded implementation.

All ten supplied manifest byte counts and SHA-256 hashes matched. No consumer repository or VizForge repository was modified. Test fixtures live here and create disposable independent repositories using the existing bootstrap proof. No D3/chart/map/story grammar, Power BI implementation, package, scaffold preset or visual engine was added to the framework.

| Audited requirement | Baseline | Minimal delta |
| --- | --- | --- |
| Generic Figure envelope/registry/context | Delivered | Reuse unchanged FigureSpec JSON payload, consumer-owned registry, frameIndex and reducedMotion. |
| External step playback | Partial | FigurePlayer gated the toolbar on a ConceptMotion SVG marker. Gate playback on a validated Figure renderer instead; retain marker-specific SVG export and panning. |
| Invalid/missing renderer fallback | Partial | Existing missing-registration and validation-issue alerts work. Catch a throwing payload validator into that same alert/text-alternative path. |
| Catalog + Workbench + Figure + Code scaffold | Delivered packages | Compose the existing learning preset; remove unused canonical/learning/progress starter dependencies before first bootstrap. No additional preset. |
| Independent multi-step production proof | Missing | Add a consumer-owned three-position SVG adapter with an opaque `beats` payload, clean frozen release and desktop/390px browser evidence. |
| Existing teaching semantics | Delivered | Preserve all 17 examples and existing SQL, algorithm, collection, workflow and diagram code/content. |

## Integration pattern

From the pinned framework workspace, run:

```text
pnpm scaffold:app --name my-visual-lab --preset learning --mode external --output <new-absolute-directory-outside-framework> --commit <accepted-40-character-SHA>
```

Keep `@datapass/ui`, `@datapass/content`, `@datapass/figure` and `@datapass/code`. The fixture replaces the starter catalog with its own content, removes unused `@datapass/{canonical,learning,progress}` dependencies and the learning stylesheet, then uses the official bootstrap unchanged. Run bootstrap before installation; resolve and commit the consumer's own lock, then run `pnpm release:gate` with Node 24.19.0 and pnpm 11.19.0. Fresh clones install frozen. Do not patch vendor source.

The [external consumer guide](project/conceptmotion_studio/docs/EXTERNAL_CONSUMERS.md#external-visual-labs-and-step-based-stories) contains the import/adapter example and detailed responsibility table. The runnable proof is [story.tsx](project/conceptmotion_studio/tests/external-story/src/story.tsx), composed in [App.tsx](project/conceptmotion_studio/tests/external-story/src/App.tsx).

The consumer creates `new FigureRendererRegistry().register(storyAdapter)` and passes it to real FigurePlayer/FigureView. The adapter ID is `external.story.demo`; it is never registered globally or shipped in the distribution allowlist. It uses ordinary React/SVG and generic UI tokens, with no ConceptMotion/D3 import and no spoofed ConceptMotion DOM marker. Its own validator checks the payload version and every step shape. `validateFigureSpec` separately validates the generic envelope.

FigurePlayer receives `stepCount={payload.beats.length}` and `captions={payload.beats.map(beat => beat.annotation)}`. Figure's built-in step inference deliberately returns one for this unknown payload. The adapter receives the selected zero-based `frameIndex` and reduced-motion flag. Its stable point moves through three named positions; the renderer owns its CSS interpolation and fluid SVG viewport. Caption, title, subtitle, takeaway, source, note and text alternative remain generic Figure presentation.

## Compatibility and limits

No public TypeScript signature or schema changed. No tokens, dependencies, renderer IDs, canonical teaching Figures, deterministic layouts, persistence keys, consumer apps or legacy implementation changed. Existing ConceptMotion step inference, SVG export, panning and semantic validation remain in place. Playback starts off; previous/next/reset/seek pause it; OS reduced motion stops/disables automatic playback while manual steps remain usable. Controlled frame/callback behavior and FigureView static/reduced-motion state precedence are retained.

The framework's generic readiness marker is internal composition plumbing; external adapters do not set it. Payload-validation failures and missing registrations remove playback controls and show an accessible alert plus text alternative. External render/effect exceptions after successful validation remain the adapter's responsibility; this is not a universal error boundary or sandbox.

The current Figure package still depends on existing ConceptMotion packages for compatibility. The fixture imports none directly; no independently packaged Figure-only bundle is claimed. Modern distributed packages contain no added D3 dependency; the separately preserved legacy application keeps its existing D3 dependency. External export uses `exportAction`; fixed-canvas pan helpers and automatic SVG freezing remain ConceptMotion-specific. Consumers own responsive sizing, observer/timer cleanup and any later D3 interpolation, chart/map grammar, narrative sequencing, exporters and Power BI host adaptation.

The supported browser proof is Chrome at 1440px and 390px. This demonstrates generic state/motion integration, not a VizForge release or any particular future line comparison, ranking race, scatter evolution or map template.

## Verification

Commands run from `project/conceptmotion_studio` with Node **24.19.0** and pnpm **11.19.0**.

- Before edits: affected Figure/scaffold baseline **27 tests in five files passed**.
- Affected Figure suite: **24 tests in four files passed**, including external HTML playback, controlled/static state, invalid-to-valid recovery, throwing validators and both existing ConceptMotion failure paths. The HTML-adapter assertion was scoped to the renderer surface after the first run correctly found Fluent's unrelated select-arrow SVG in the toolbar.
- `pnpm build`: **passed**, including project-reference typecheck and the original lazy/bundle assertions.
- `pnpm test:dx`: **22 tests passed**, authoring/Storybook types and all four schema drift checks passed. `pnpm validate:specs figure qa/v4-vizforge-figure.json` passed for a representative external Figure envelope; its payload uses the separate consumer validator. `pnpm check:boundaries` passed with 112 source files, 12 package boundaries and 81 app files.
- Focused independent story proof: **8/8 production browser cases passed in 32.8 seconds**, plus frozen install, source/lock integrity, content validation, two consumer unit tests, production build and privacy checks. The proof stages took **187.973 seconds** (temporary-directory cleanup is outside that timing). It verified **91** immutable distributed files and a **167,450-byte** consumer lock against local source snapshot `6387796faf233d8813e2135e49118a020bc1ada3`, not the final release SHA.
- Desktop and phone captures were visually reviewed: [desktop](project/conceptmotion_studio/qa/v4-visual-explanations/external-story-desktop.png), [390px](project/conceptmotion_studio/qa/v4-visual-explanations/external-story-phone.png). The normal-motion test checks the same DOM point and an actual CSS transition midpoint, then verifies autoplay-off, keyboard next/previous/seek, play/pause/end/reset. Other cases verify OS motion changes, zero running animations under reduced motion, all three fallback modes of failure, static FigureView and Code loading only on request. Serious/critical Axe findings are zero and page overflow is at most one pixel, using the unchanged narrow Tabster-sentinel exception.
- Development-only corrections: negative-test data needed an explicit `JsonValue[]` annotation; the first browser run passed six cases and failed two source-text selectors because the shared SourceNote supplies its own labels. The fixture's duplicate labels and selectors were corrected. No existing gate or tolerance changed.

### Completed local release

One uninterrupted finished-tree **`pnpm check` passed with exit 0 in 1,091.513 seconds (18m 12s)**. No implementation/test changes followed that gate; only this results section and generated evidence were finalized. The ignored diagnostic log is `project/conceptmotion_studio/qa/v4-vizforge-release.log`.

| Gate | Observed result |
| --- | --- |
| Practice and legacy integrity | PASS: preserved 323 practice items / 500 variants, deterministic notebook imports and original legacy smoke. |
| Unit/semantic coverage | PASS: **384 tests in 63 files**, with all six original per-package coverage floors enabled and passing. |
| Authoring and boundaries | PASS: 22 DX tests, four unchanged schemas, 112 source files / 12 boundaries and 81 application files checked for direct Monaco. |
| Scaffolds | PASS: all four original presets and generated typecheck/build/baseline tests. |
| Independent consumers | PASS: portfolio **2/2**, learning **54/54**, external story **8/8** production browser cases, plus separate frozen installs, source/lock verification, validation, unit tests, production builds and privacy scans. |
| Production builds | PASS: all seven apps, the separate legacy app, and Storybook with all 60 approved stories retained. |
| Public privacy | PASS: all nine existing outputs, including source maps; all three independent outputs also passed the same scanner. |
| Original framework browsers | PASS: **56/56** desktop/390px cases in 6.1 minutes; original screenshot comparisons, accessibility and overflow gates retained. |

There are **120 browser cases** across the original framework and three independent release matrices. Targeted runs above overlap these cases and are not additional unique acceptance tests.

The full gate's independent stages took **544.359 seconds** and used source snapshot `7e1baa952b8aada434c3279776bf243de947cbf5` in `working-tree-snapshot` mode. Portfolio verified 65 files and a 150,935-byte lock; learning 126 files and a 170,180-byte lock; external story 91 files and a 167,450-byte lock. In the historical evidence JSON's `preset` field, `external-story` names this test fixture, which is generated using the unchanged `learning` preset. Hosted CI must repeat the proof in `commit` mode on the final pushed SHA.

The two new story screenshots are retained alongside current bundle-size evidence. Regenerated historical QA screenshots were restored to their previous tracked bytes; no screenshot comparison baseline or tolerance changed. Existing internal-app development-server Keyborg/Pilot markup warnings remain visible in the log; passing gates do not claim those untouched apps have silent consoles. The independent story browser cases assert no page errors.

The external runner retains the two existing proofs and adds `pnpm test:external-consumer external-story`. Each proof creates a consumer lock, transfers only consumer-owned source and that lock to a fresh repository, verifies the exact source pin/blob contents, installs frozen, rejects a deliberately mismatched manifest/lock, validates/types/tests/builds, and runs production-preview Playwright. Source and lock integrity are checked again afterward. The new fixture also checks that canonical data is not materialized, its sources import no ConceptMotion/D3 renderer, and its dependency lock contains no D3/Power BI runtime. All three output bundles and source maps use the existing private-output scanner.

The report is committed before its own hosted CI can run. The final accepted SHA, exact hosted run URL/conclusion and final integration example will be posted to [issue #1](https://github.com/julian-passebecq/react_ms_fluent_2_framework/issues/1) after success and included in the delivery message. A working-tree proof snapshot or the baseline's green run is not accepted as final hosted evidence.
