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
| `@datapass/canonical/visual-availability` | `visualPracticeIds`, `hasPracticeVisual` — lightweight 18-ID metadata without compiled scene imports |
| `@datapass/canonical/projects` | `projectRegistry`, version/review date, validation issues and entry notes — same ten public projects |

Treat exported canonical records as read-only. Author local additions separately. Public entrypoints do not expose historical raw practice catalogs/source snapshots or private project overlays. Keep the shipped practice notices/license and visible attribution appropriate to the material used. No ProjectRegistry → Galaxy mapper or domain API extension is added.

## Release contract and proof

The copied `consumer-release-gate.ts` requires exact source verification, frozen install, typecheck, consumer content validation, local unit tests, production build and browser checks, then verifies source again. The generated Playwright configuration serves **`vite preview` of `dist`**, uses a strict port with no existing-server reuse and checks both 1440px and 390px. Primary flows assert serious/critical Axe findings = 0, page overflow ≤ 1px, keyboard skip-link/main/action navigation and absence of page errors. Extend the test to all important product paths and states; a starter flow is not exhaustive application certification.

Keep semantic validation in the existing validators/compilers. `validateFigureSpec` certifies an envelope, not arbitrary renderer payloads. Use the applicable workflow/diagram/loop validators or compilers as well, and retain authoring schema checks where your app uses them. The generated content-validation script checks the content actually present in the starter and explicitly identifies where application-specific validation is added.

`pnpm test:external-consumer` proves two independently initialized repositories: an unmodified portfolio starter and a learning fixture with canonical practice data and real FigurePlayer playback. Each bootstraps and resolves a consumer lock with `pnpm install --lockfile-only`, then a second clean repository receives only authored files/that lock, installs frozen and runs the production gate. A deliberately mismatched dependency manifest must fail frozen installation. No framework node_modules or dependency aliases are supplied. Both output bundles, including source maps, pass the existing privacy scanner. Temporary directories are removed; failures retain browser artifacts under `test-results/external-consumer`.

The browser template preserves V4's existing narrow Axe exclusion for `[data-tabster-dummy]`, Fluent's hidden focus sentinels. It does not exclude application controls or disable an Axe rule. The learning proof explicitly tabs through the real Figure toolbar and activates steps with Enter. Serious/critical = 0 refers to the application surface with this established library exception.

Local development snapshots the allowlisted working-tree source into an isolated Git commit. Hosted CI fetches the exact framework commit under test through a local Git mirror, exercising the same fetch/selection/verification path. `qa/v4-external-consumer.json` records which mode and exact pin were tested. These fixtures prove the mechanism; they do not claim that any of the six independent consumer repositories has been rerun.
