# V2 post-implementation audit

Audited GitHub commit: `8cccd77ecd0d0b60b1d28ee2e41cffe5ec78a26f`.

## Verdict

V2 is a strong foundation and should be **preserved**, not rewritten. It successfully added a serializable content boundary, deterministic notebook import, one shared Monaco boundary, renderer-neutral Figure adapters, versioned progress, learning/assessment surfaces, explorer/catalog primitives, deterministic scaffolds, Storybook and a reference learning consumer.

The main V3 need is not more foundational architecture. It is **real consumer pressure**: use those packages for Formation, Code Sandbox, Code Interview, Algorithm Atlas, Architecture Atlas and Pilot Center, then measure where reuse is real and where the contracts still need refinement.

## What V2 demonstrably got right

- `@datapass/content` is pure and serializable.
- `@datapass/notebook-import` is deterministic and non-executing.
- `@datapass/code` is the single Monaco integration boundary.
- `@datapass/figure` keeps `FigureSpec` separate from renderer geometry.
- `@datapass/progress` provides versioned local state and V1.1 migration.
- `@datapass/learning` composes notebooks, guided exercises, assessments, progress and runtime links.
- `@datapass/scaffold` proves four deterministic app presets.
- Studio and learning routes are split; non-code routes do not load Monaco.
- Storybook has a real Golden Gallery.
- Project Hub already proves generic catalog/search/facet/table/detail primitives.

## Release-engineering blocker discovered after push

GitHub Actions run `33913887435` failed at the final Playwright step. The failure is **not an application assertion regression**.

All earlier CI steps passed. Browser result: 16/20 passed. Four failures are `toHaveScreenshot` calls for which Linux baseline PNGs do not exist:

- table scene / desktop
- workflow scene / desktop
- table scene / phone
- workflow scene / phone

The CI runner wrote the actual images and failed because there was nothing to compare against. Fix by standardizing and checking in reviewed Linux baselines (prefer a reproducible Playwright Linux environment) or an equivalent cross-platform snapshot strategy. Do not weaken or remove visual regression coverage.

Hosted CI must be green at V3 completion.

## Medium-priority audit findings

### Coverage reporting is incomplete

All V2 tests run, but the numeric coverage aggregate is still scoped to `core` and `knowledge`. V3 should add meaningful coverage reporting/thresholds for pure packages where it is cheap and useful: `content`, `notebook-import`, `progress`, `scaffold`. Keep UI confidence primarily in component tests + Playwright rather than chasing arbitrary percentage targets.

### The canonical Project Registry is still app-local

`apps/studio/src/data/projectRegistry.ts` is useful but belongs to the Studio consumer. V3 should make public project metadata a shared source-controlled content artifact, consumed by Project Hub, Pilot Center and the project-galaxy figure.

Do not publish private repository URLs in a public bundle. Use a gitignored local overlay for private Pilot Center metadata if needed.

### V2 has only two full apps

The monorepo currently has Studio plus the Formation proof consumer. That was correct for V2. It is no longer enough to prove the platform boundary. V3 should add real consumer diversity rather than another package family.

### Some files are already large

Examples include the Project Hub page, the Formation content catalog, content validation and learning assessment/notebook implementation. They are not immediate defects. Avoid creating new giant app files. Split consumer content by domain/module where natural; only move code into shared packages after at least two consumers prove the pattern.

### Monaco is still large but correctly lazy

The V2 bundle reduction is material and route boundaries are correct. Do not spend V3 rewriting the editor just to reduce its lazy payload. Preserve this win.

## Naming correction

The visible reference consumer must now be **Formation**, not “Dubreu Formation”. Historical V2 reports and source-provenance IDs may retain `dubreu` where that accurately describes the source. Product chrome, package/app identity, metadata and new screenshots should use Formation.
