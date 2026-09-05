# V4 data-platform authoring report

## Starting checkpoint — 5 September 2026

The working tree was clean at `8fef4d0b542bfbb11b0ff80ec81710db3f6c8d55`, on `main`, with origin `julian-passebecq/react_ms_fluent_2_framework`. All numbered ZIP documents were read in order, followed by its manifest, repository guidance, the ten primary V4 handoff documents and current audit/reuse/test reports. All seven ZIP manifest byte-count/SHA-256 records were verified. The user's current request sets scope; historical instructions do not authorize consumer or integration work.

Before edits, affected core/lineage/Figure/canonical/explanation tests passed: **38 tests in seven files (12.49 s)**, using Node 24.19.0 and pnpm 11.19.0.

| Baseline target | Status | Evidence and smallest delta |
| --- | --- | --- |
| External Figure story seam | DELIVERED | Accepted baseline. Keep registry/player and external adapter contract unchanged. |
| Star model | PARTIAL | `examples/generators/data-model-star.json` is legacy v0.1 reference, not a V4 scene. Lineage has asset/field endpoints but lacks validated grain and PK/FK relationship semantics. Add narrow optional semantics to its existing validator/renderer. |
| Column / KPI lineage | PARTIAL | Production `LineageSpec` and `lineage.model` validate endpoints/derivations; examples are sparse. Add canonical chains, explicit cycle policy and readable semantic layout. |
| Architecture | PARTIAL | Production DiagramSpec and deterministic layouts work; provider vocabulary is app-local. Provide an independent canonical template, including Azure, without importing or changing app code. |
| Retry / backfill | DELIVERED | `de-backfill` already proves explicit date scopes and state carry-forward. Reuse its authored trace and separate topology from run presentation. |
| Portable authoring recipes | MISSING | No dedicated portable data-platform example set. One narrow canonical export removes app-relative imports and legacy-format guesswork. |
| Multi-Figure lesson | PARTIAL | FigurePlayer supports siblings; add a real data-platform composition and production browser proof. |

No renderer family, graph engine, consumer application or external integration was added.

## Delivered authoring surface

- `@datapass/canonical/data-platform` exposes 12 approved Figures and their typed source specs. It removes app-relative imports and the need to translate legacy generator JSON. The existing canonical package and selective source manifest gain one explicit subpath/file; package dependencies and lockfile versions do not change.
- `LineageSpec` gains optional fact/dimension grain, explicit many-to-one FK/PK relationships with filter direction, an endpoint cycle policy and shared layered layout selection. Validation remains in the existing core validator. No competing validator, universal model or schema family was introduced.
- The existing lineage renderer displays PK/FK roles, grain, cardinality and filter direction; typed model links are distinct from derivations. The existing layered Diagram layout determines rank/lane order. Renderer-owned card sizing and route presentation use that order; consumer content contains no coordinates. Opt-in horizontal/vertical layouts preserve readable fields and provide bounded long-chain presentation.
- Existing `diagram.flow`, `workflow.topology` and `workflow.run` provide architecture and DAG/run views. The accepted `de-backfill` Figure/trace is reused by identity. All five provider lenses keep the same responsibility/node/edge IDs. Operate/Govern context is explicit in prose and applies-to metadata.
- Nine Storybook compositions and two independent production lesson layouts prove real sibling Figure surfaces. The external learning fixture imports the new canonical subpath through the official frozen bootstrap, not app-relative source. This changes a framework-owned test fixture, not any consumer repository.
- A new browser assertion exposed a pre-existing SVG accessibility bug: shared selectable controls serialized `aria-pressed=true` as an empty attribute. The shared SVG helper now emits the required `"true"`/`"false"` strings, with unit and keyboard regressions. No Figure registry/player or external-renderer contract code changed.

Generic star/lineage Figure factories were deliberately not added: the existing Figure envelope plus canonical typed specs are already short. The small `lakehouseArchitecture(provider)` helper has a concrete purpose—reusing eight responsibilities and seven edge identities across five vocabulary lenses. No UI adapter, SQL parser, execution service or provider renderer is hidden behind it.

## Development verification

All commands run from `project/conceptmotion_studio`, Node **24.19.0**, pnpm **11.19.0**.

- Before edits: **38 tests / seven files passed**, 12.49 s.
- Focused authoring/core/SVG/Figure regression set after the accessibility correction: **53 tests / seven files passed**, 11.04 s. It covers duplicate IDs, invalid assets/fields, missing grain, role mismatch, forbidden derivation cycles (including a 3,000-field chain), deterministic geometry/exports and unchanged external Figure behavior.
- `pnpm typecheck` passed. `pnpm test:dx` passed **22 tests**, authoring/Storybook/test TypeScript and all four unchanged schema drift checks. `pnpm validate:specs figure` passed for exported envelopes of all 12 canonical Figures; payload validators and workflow compilers run separately in unit/external validation.
- `pnpm check:boundaries` passed: 112 source files, 12 boundaries, 81 application files checked for direct Monaco.
- Storybook production build passed with **69 stories**: all previous 60 retained plus nine data-platform compositions.
- A development-only built-Storybook browser smoke passed **18/18** desktop/390px cases, including all five provider selections, correct sibling counts, no page/renderer errors, serious/critical Axe = 0 and page overflow ≤ 1px. The initial temporary smoke harness needed an explicit Playwright browser context for Axe; this did not change product code or checks.
- The first independent frozen learning proof passed **78/82** browser cases and found the four star/lesson selection failures described above. The tests were retained and the shared ARIA serialization was corrected. Production captures also motivated tighter variable-height card packing, separate model-link tracks and removal of overlapping redundant architecture context labels. No screenshot baseline or tolerance changed.
- The repeated independent learning proof passed **82/82** production browser cases in 2.7 minutes, including **28 new data-platform cases**. The complete proof stages took **291.001 s**, verified 127 distributed files and preserved the 170,180-byte consumer lock. Its local source snapshot was `60834880b01a5766bd8ddedc662de5d67d0b3a37`; this is development evidence, not the final release SHA. Final label contrast/content changes were then checked in built Storybook.
- Final phone review found overlapping wrapped headings in the two new Storybook lessons. Their local line height was corrected and the smoke added a heading-readability assertion. An initial full-gate attempt was interrupted during independent-consumer staging to make this correction before final acceptance. A final defensive authoring review also removed string coercion from the new enum/endpoint checks; malformed JSON now produces issues instead of invoking object coercion. Affected tests passed **21/21** after that correction, followed by DX/Storybook verification. The completed finished-tree run below is the release gate; the interrupted attempt is not counted as a pass.

## Finished-tree release gate

The complete, uninterrupted **`pnpm check` passed with exit 0 in 1,305.250 s (21m 45s)** on 5 September 2026. No implementation or test edits followed this run; only release evidence was recorded. Development runs overlap these release cases and are not additional unique acceptance tests.

| Gate | Observed result |
| --- | --- |
| Unit / semantics | 405 tests in 65 files passed; all existing per-package coverage floors passed. |
| Authoring DX | 22 tests passed, including structural schema parity, authoring and Storybook TypeScript. |
| Import / legacy / boundaries / scaffold | Deterministic corpus, preserved legacy smoke, package boundaries and generated scaffold checks passed. |
| Independent portfolio | Frozen bootstrap, lock-mismatch rejection, release checks and 2/2 browser cases passed. |
| Independent learning | Frozen bootstrap, canonical validation, release checks and 82/82 browser cases passed, including all 28 new data-platform cases. |
| Independent external story | Accepted seam unchanged; frozen release checks and 8/8 browser cases passed. |
| Production builds | All seven apps, separate legacy app and Storybook passed; all 69 stories indexed. Bundle assertions passed. |
| Public output privacy | Nine output directories, 322 text/source-map files scanned, zero violations. |
| Original browser suite | 56/56 desktop/390px cases passed in 6.8 minutes. Original comparison baselines, tolerances, overflow and Axe gates retained. |

There are **148 release browser cases** in total: 56 framework + 2 portfolio + 82 learning + 8 external story. The separate built-Storybook review passed 18/18 development cases. Forty-six new captures (28 production consumer, 18 Storybook) are retained in `qa/v4-data-platform/`; historical captures and comparison baselines are preserved. Existing development-server diagnostics about Keyborg disposal and Pilot paragraph nesting remain in the original browser log; no unrelated app source was changed to suppress them.

The full independent-consumer stage passed in **745.004 s** against local working-tree source snapshot `778123ad890eff2d9f98b2d812231dbb97a9cb99`. That snapshot is not the delivered commit. Distributed file counts / unchanged consumer-lock bytes were portfolio **66 / 150,935**, learning **127 / 170,180**, external story **91 / 167,450**. Hosted CI repeats these proofs using the exact pushed commit.

| Pure package | Statements | Branches | Functions | Lines |
| --- | --- | --- | --- | --- |
| core | 86.52% | 81.90% | 95.09% | 90.40% |
| knowledge | 82.63% | 74.80% | 95.83% | 91.78% |
| content | 86.01% | 80.94% | 96.58% | 91.84% |
| notebook-import | 89.95% | 81.54% | 95.38% | 93.36% |
| progress | 80.70% | 75.18% | 96.25% | 91.13% |
| scaffold | 100.00% | 90.24% | 100.00% | 100.00% |

## Boundaries and evidence

The generic external Figure seam, all seven app sources, legacy sources, research/reference material, private overlays, dependency versions and consumer repositories are unchanged. The old core/content/knowledge/progress purity rules and original coverage, screenshot, Axe, overflow and source-map privacy gates remain enabled. CI only adds the new screenshot directory to its existing artifact upload.

New captures are under `project/conceptmotion_studio/qa/v4-data-platform/`. Read the [capability matrix](V4_DATA_PLATFORM_CAPABILITY_MATRIX.md), [authoring guide](V4_DATA_PLATFORM_AUTHORING_GUIDE.md) and [gap ledger](V4_DATA_PLATFORM_GAPS.md) for supported semantics and remaining limits. In particular, composite/many-to-many models, SQL parsing, mixed-granularity cycle inference, arbitrary dense routing, spanning governance planes and an execution/readiness engine are not claimed.

This report is committed before its own hosted run. The final delivery records the new SHA, exact parent, hosted run ID/URL and observed conclusion; it does not create a recursive report-only follow-up commit.
