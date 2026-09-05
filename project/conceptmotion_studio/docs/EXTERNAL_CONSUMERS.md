# Independent V4 consumers

Use one **exact-commit source workspace**. A Node-only bootstrap fetches a shallow, blob-filtered Git commit, reads its distribution manifest, follows the consumer's `workspace:*` package dependency closure and checks out only explicitly allowed files. It never installs the framework workspace. pnpm resolves dependencies in the consumer repository and writes the consumer's own lockfile.

The helper is `scripts/bootstrap-framework.ts`; the authoritative allowlist is `consumer-source.json`. Package manifests and source bytes are used unchanged. Historical apps, reference material, source snapshots, private local overlays, the framework lockfile and framework node_modules are not materialized. Git servers without partial-clone support may transfer more objects; the checkout still contains only the selected source, and history stays shallow. This is a supported Vite/TypeScript source distribution, not npm publication or a plain-Node compiled SDK.

## Create a repository

Use the completed hardening commit or a later compatible commit. The old experiment pin `ce8353ee0878ca74b2fe24a1af7de657a6ba61f2` predates this helper/manifest and cannot provide the new distribution.

From a trusted framework checkout at that exact commit, using Node 24.19.0 / pnpm 11.19.0:

```text
cd project/conceptmotion_studio
pnpm install --frozen-lockfile
pnpm scaffold:app --name my-portfolio --preset portfolio-hub --mode external --output <new-absolute-directory-outside-framework> --commit <40-character-commit>
```

The directory must not exist. Existing internal `scaffold:app` invocations retain their original behavior. All four presets support external mode. It emits standalone TypeScript/Vite/Vitest/Playwright configs, an exact `datapass.json`, workspace wiring, Node-only bootstrap/release tools and a GitHub Actions example. The tools are copied verbatim from the framework, so consumers do not author six versions of the bootstrap. Generated copy/content and primary-flow assertions are starting points to adapt to the product.

From the newly generated consumer:

```text
pnpm framework:bootstrap
pnpm install
pnpm exec playwright install chrome
pnpm release:gate
```

Commit generated sources, `datapass.json`, the workflow and **your own `pnpm-lock.yaml`**. The generator cannot truthfully emit a lockfile before your selected dependencies have been resolved. Never copy the framework's lock or node_modules. `vendor/` and generated outputs are ignored.

Fresh clones and CI run bootstrap **before** `pnpm install --frozen-lockfile`. Bootstrap has no npm dependency and runs via Node's type stripping; Node 22.12+ supports the explicit flag, while tested CI pins Node 24.19.0. The release command refuses missing locks and wrong pnpm versions. Local/CI Chrome must be installed; Linux Actions uses `--with-deps chrome`.

The framework/runtime engine field remains `>=22.12.0`. pnpm 11.19.0 itself declares Node `>=22.13`; therefore use the supplied `.node-version` / CI Node 24.19.0 pin for the complete release toolchain. Only that exact Node/pnpm pair was exercised here.

## Existing repositories and upgrades

Generate a disposable external starter with the intended preset/pin and compare its bootstrap/config/workflow files to the existing consumer. Keep product source, stable IDs, progress keys and custom content. Declare required framework packages as `workspace:*` in the consumer root; pnpm workspace globs match only the selected vendored manifests. Do not retain framework install + node_modules symlink scripts.

Changing package selection or commit is deliberate: verify the current checkout against its old configuration, move the generated vendor directory outside the consumer, update the pin/dependencies, bootstrap, run a normal `pnpm install` to update your lock, review that delta and run the full gate. The helper refuses to repair/overwrite existing altered source. A repeat invocation at the same configuration verifies and leaves source alone.

Verification checks the exact Git HEAD, every selected blob hash, missing files, injected files and source symlinks. It permits pnpm's normal package-local node_modules. Do not treat a matching HEAD alone as source-integrity proof; the helper checks content even if a Git assume-unchanged flag masks edits. This protects against accidental vendor patches, not a hostile user who can rewrite the consumer's own verification script.

`datapass.json.repository` may point at an absolute local Git mirror for offline bootstrap, while still requiring the exact commit. Dependency installation requires the registry or a populated pnpm store. Network-unavailable compatibility mirrors do not become release evidence.

## Canonical public data

`@datapass/canonical` gives the existing `content/` directory a package identity. There is no root barrel or copied corpus. Its only dependencies are the existing pure core and content contracts; it has no UI, DOM, storage or network code. `@datapass/content` remains dependency-free.

| Import | Stable exports |
| --- | --- |
| `@datapass/canonical/practice` | `practiceCatalog`, `practiceItems`, `practiceItemById` — same 323 items / 500 variants, sanitized public projection |
| `@datapass/canonical/visuals` | `migratedVisuals`, `migratedFigures`, `visualById`, `figureForPracticeId`, `visualSources`, `refinedVisualIds`, `VisualMigration` type — same 30 Figures |
| `@datapass/canonical/explanations` | `visualExplanationFigures`, `visualExplanationFigure` — 17 approved semantic teaching examples |
| `@datapass/canonical/data-platform` | `dataPlatformFigures`, `dataPlatformFigure`, typed star/column/KPI/medallion specs, `lakehouseArchitecture`, `backfillWorkflow` and `backfillTopology` — 12 approved Figures using existing renderer families |
| `@datapass/canonical/visual-availability` | `visualPracticeIds`, `hasPracticeVisual` — lightweight 18-ID metadata without compiled scene imports |
| `@datapass/canonical/projects` | `projectRegistry`, version/review date, validation issues and entry notes — same ten public projects |

Treat exported canonical records as read-only. Author local additions separately. Public entrypoints do not expose historical raw practice catalogs/source snapshots or private project overlays. Keep the shipped practice notices/license and visible attribution appropriate to the material used. No ProjectRegistry → Galaxy mapper is supplied. The [data-platform guide](../../../V4_DATA_PLATFORM_AUTHORING_GUIDE.md) provides compact typed examples and invalid cases for the existing lineage, Diagram and Workflow validators.

## Release contract and proof

The copied `consumer-release-gate.ts` requires exact source verification, frozen install, typecheck, consumer content validation, local unit tests, production build and browser checks, then verifies source again. The generated Playwright configuration serves **`vite preview` of `dist`**, uses a strict port with no existing-server reuse and checks both 1440px and 390px. Primary flows assert serious/critical Axe findings = 0, page overflow ≤ 1px, keyboard skip-link/main/action navigation and absence of page errors. Extend the test to all important product paths and states; a starter flow is not exhaustive application certification.

Keep semantic validation in the existing validators/compilers. `validateFigureSpec` certifies an envelope, not arbitrary renderer payloads. Use the applicable workflow/diagram/loop validators or compilers as well, and retain authoring schema checks where your app uses them. The generated content-validation script checks the content actually present in the starter and explicitly identifies where application-specific validation is added.

`pnpm test:external-consumer` proves three independently initialized repositories: an unmodified portfolio starter, a learning fixture with canonical practice data and real FigurePlayer playback, and an unrelated external story adapter composed from the learning preset. Each bootstraps and resolves a consumer lock with `pnpm install --lockfile-only`, then a second clean repository receives only authored files/that lock, installs frozen and runs the production gate. A deliberately mismatched dependency manifest must fail frozen installation. No framework node_modules or dependency aliases are supplied. All output bundles, including source maps, pass the existing privacy scanner. Temporary directories are removed; failures retain browser artifacts under `test-results/external-consumer`.

The browser template preserves V4's existing narrow Axe exclusion for `[data-tabster-dummy]`, Fluent's hidden focus sentinels. It does not exclude application controls or disable an Axe rule. The learning proof explicitly tabs through the real Figure toolbar and activates steps with Enter. Serious/critical = 0 refers to the application surface with this established library exception.

Local development snapshots the allowlisted working-tree source into an isolated Git commit. Hosted CI fetches the exact framework commit under test through a local Git mirror, exercising the same fetch/selection/verification path. `qa/v4-external-consumer.json` records which mode and exact pin were tested. These fixtures prove the mechanism; they do not claim that any of the six independent consumer repositories has been rerun.

## External visual labs and step-based stories

Use the existing `learning` preset: its package selection already includes UI, Figure and lazy Code surfaces. Presets supply a bootstrap and starter shell, not finished domain routes. Compose `CatalogShell`, `Workbench`, `FigurePlayer`/`FigureView` and `CodeEditor` in consumer source. No new `visualization-studio` preset is needed.

```text
pnpm scaffold:app --name my-visual-lab --preset learning --mode external --output <new-absolute-directory-outside-framework> --commit <accepted-40-character-SHA>
```

Before the first bootstrap/install, a visual-only consumer can remove `@datapass/canonical`, `@datapass/learning` and `@datapass/progress` from its generated dependencies, replace the starter's project catalog/content validation with its own content, and remove the learning CSS import. Retain `@datapass/{ui,figure,code,content}` as `workspace:*`. The external story proof makes exactly this adaptation without altering the preset or any vendored source. Resolve and commit the consumer's own lock as above. [Issue #1](https://github.com/julian-passebecq/react_ms_fluent_2_framework/issues/1) records the final accepted SHA and matching hosted run for this contract.

The runnable consumer-owned example is in `tests/external-story/src/story.tsx` and `App.tsx`. Its `beats` payload is intentionally unknown to Figure's built-in step inference:

```tsx
import type { FigureSpec } from '@datapass/content';
import { FigurePlayer, FigureRendererRegistry } from '@datapass/figure';
import { DemoVisual, isDemoPayload, payload } from './my-renderer';

const registry = new FigureRendererRegistry().register({
  id: 'external.story.demo',
  validate: figure => isDemoPayload(figure.spec) ? [] : ['Unsupported story payload.'],
  render: ({ figure, frameIndex = 0, reducedMotion }) =>
    <DemoVisual payload={figure.spec} step={frameIndex} reducedMotion={reducedMotion} />,
});
const figure: FigureSpec = {
  id: 'my-story', kind: 'concept', rendererId: 'external.story.demo',
  title: 'My story', subtitle: 'Follow the changing state.',
  takeaway: 'One useful conclusion.', fallbackText: 'A complete text alternative.',
  spec: payload,
};

export function Story() {
  return <FigurePlayer figure={figure} registry={registry}
    stepCount={payload.beats.length}
    captions={payload.beats.map(beat => beat.annotation)}
    presentationSize="compact" showInspector={false}
    source="Human-readable attribution" note="A useful note" />;
}
```

`DemoVisual`, its payload validator and any D3 dependency belong to the consumer. `render` should return a React component when the adapter needs hooks; do not call hooks directly in the adapter callback. Keep the registry stable across renders. Use a fresh `FigureRendererRegistry` for only external adapters, or extend `createDefaultFigureRendererRegistry()` on your own instance to also use existing renderers.

| Concern | Integration contract |
| --- | --- |
| Steps | Supply a positive integer `stepCount` and localized `captions` for an arbitrary payload. `FigureRenderContext.frameIndex` is zero-based. Previous/next/reset/seek and play/pause work independently of SVG type; autoplay starts off. `frameIndex` plus `onFrameChange` supports consumer-controlled state. Existing built-in inference stays intact. |
| Static presentation | `FigureView` respects numeric `staticState`/`reducedMotionState`, unless `frameIndex` is provided. `FigurePlayer` starts at step zero; its explicit controlled frame takes precedence. |
| Motion | FigurePlayer follows the OS preference or explicit `reducedMotion` prop, forwards it to the adapter and stops/disables autoplay when reduced. Manual stepping remains available. The adapter owns interpolation and cleanup; it must honor the flag. FigureView accepts an explicit preference for static embedding. |
| Responsive layout | The adapter owns its responsive subtree: the fixture uses a fluid SVG viewBox and bounded height. Use local CSS/ResizeObserver for more complex layouts. `presentationSize` is an optional context hint, not pixel dimensions or a content field. |
| Narrative | Generic title/subtitle/takeaway/fallback remain FigureSpec metadata; visible source/note are React slots. Pass per-step annotations through `captions` and/or render them inside the consumer visual. Source IDs remain opt-in details. |
| Invalid content | Validate the envelope with `validateFigureSpec` and the payload with the consumer's validator. Adapter validation issues (including thrown validation errors) and missing registrations show Figure's accessible alert and text alternative, with no playback toolbar. Validate every supported step shape before rendering. |
| Export/panning | Automatic SVG export and fixed-canvas keyboard panning remain specific to existing ConceptMotion SVGs. External adapters own export via `exportAction` and their own responsive/scroll behavior. Never add a fake `data-conceptmotion` marker. Canvas/WebGL export is not supplied. |
| Dependencies | The adapter imports no ConceptMotion or D3 from the framework. `@datapass/figure` still has its existing ConceptMotion dependency closure for built-in compatibility; this pass does not claim a separately packaged Figure-only runtime. Modern distributed packages do not add D3. The separately preserved legacy app retains its existing D3 dependency. |

Run `pnpm test:external-consumer external-story` for the focused clean-install production proof. It covers desktop/390px, actual CSS midpoint motion and stable point identity, keyboard stepping, play/pause/reset/seek, reduced motion, static FigureView, metadata/fallback, lazy Monaco, Axe and overflow. It also rejects D3/Power BI dependencies and excludes canonical data from this fixture's materialized source.

D3 story templates, chart grammars, map engines, editorial sequencing and Power BI DataView/host/packaging stay in the independent consumer. The framework supplies an integer step and generic presentation; this proof does not certify any specific future line/ranking/scatter/map template or a VizForge release. Third-party rendering/effect exceptions after successful validation remain the adapter's responsibility; this is not a renderer sandbox or a universal error boundary.
