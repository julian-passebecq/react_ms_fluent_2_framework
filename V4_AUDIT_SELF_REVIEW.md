# V4 consolidation audit

## Pre-implementation checkpoint — 5 September 2026

This matrix was recorded before product-source changes. The user request defines V4 scope; attached handoff text is supporting material, not independent authority to expand it. Historical V1/V2/V3 reports and source snapshots remain historical evidence.

Local and fetched remote `main` both resolve to `36c01d404e0acfd0bf9b55417ad48b4e9285586c`; the initial working tree was clean. [Hosted baseline run 33924063684](https://github.com/julian-passebecq/react_ms_fluent_2_framework/actions/runs/33924063684) is completed/success. The handoff is preserved under `reference_material/v4_handoff_2026-09-05/`; all 26 supplied byte-count/SHA-256 entries match.

All ten V4 read-first documents, the supplied policies/references, current V3 audit/test/reuse/visual-migration reports and applicable repository guidance were read before implementation. The supplied screenshots are baseline evidence, not replacement mockups.

Targeted baseline verification: 54 tests in five files passed in 14.46 seconds (Figure registry/player, layouts, all visual migrations and architecture variants); deterministic practice import verified 323 items/500 variants; package boundaries passed for 106 source files/12 packages. A separate DX baseline passed 17 tests in three files. No full release gate was run during this audit.

## Target-by-target baseline matrix

Status describes the starting tree, not a completion claim for V4. Only the listed real deltas are authorized for implementation.

| Target | Baseline status | Evidence and minimal delta |
| --- | --- | --- |
| Required V3 ancestry / hosted green | DELIVERED | Exact SHA and observed run above; preserve ancestry and final hosted verification. |
| Seven application entry points | DELIVERED | Studio, Formation, Sandbox, Interview, both Atlases and Pilot exist. Add no application. |
| Corpus, Figures and architecture inventory | DELIVERED | 323/500 deterministic corpus; 30 Figures; 16 architecture variants/32 layout combinations. Preserve IDs/counts. |
| Pure packages / lazy Monaco / local state | DELIVERED | Existing package gates, shared editor, progress and Pilot model. Keep contracts, keys and no-execution boundaries. |
| Consumer vs developer metadata | MISSING | FigureView emits raw concept/feature/source IDs; notebook/progress/workbench surfaces show importer/schema/runtime detail by default. Add opt-in details without hiding necessary attribution. |
| Formation product wording | PARTIAL | Chrome says Formation; catalog and notebook fixture prose still say Dubreu. Clean public prose and helper names, preserving historical source records and compatibility identifiers. |
| Formation compatibility identifiers | CONFLICTING | A blanket rename would break `*.dubreu.*` content IDs, notebook/draft references and old progress. Rename presentation/helper symbols only; retain stored identities. |
| Formation legacy copy assertion | CONFLICTING | `v2-foundation.spec.ts` requires visible private-Dubreu/runtime-count prose. Intentionally replace obsolete copy expectations with consumer-cleanliness, details and unchanged functional checks. |
| Formation course/reasoning hierarchy | PARTIAL | Working courses and capstones, but repeated headings/disclaimers and oversized FigurePlayer instances. Refine hierarchy and use presentation sizes. |
| Formation submitted assessment continuity | PARTIAL | Live attempt count determines keyed runner identity; verify/remedy remount on submission only with a reproducing regression. |
| Warm-neutral / navy / teal / amber system | PARTIAL | Shared Fluent theme and six Datapass CSS variables exist, but seven app styles repeat/equate palettes and surface rules. Add semantic tokens and opt-in consumer surface styling. |
| Compact / regular / expanded Figure presentation | MISSING | FigureView only offers minimumHeight; player hard-codes 960px mobile panning. Add consumer props and safe renderer viewport recommendations, never FigureSpec sizing fields or app-specific geometry. |
| Accessible panning / reduced motion / deterministic export | DELIVERED | Existing FigurePlayer and tests. Preserve these while testing every new size. |
| Proven factorisation audit | MISSING | V3 reuse report documents architecture but not seven-consumer duplication decisions. Record counts and KEEP LOCAL / EXTRACT SHARED / DELETE-REPLACE / DEFER decisions. |
| Shared source/details disclosure | MISSING | SourceNote exists but does not separate audit detail; need a small reusable disclosure across at least three consumers. |
| Reduced-motion hook reuse | PARTIAL | Shared hook exists; Formation, Sandbox and Interview duplicate matchMedia logic. Replace duplicates with that hook, not another abstraction. |
| 8–12 synchronized existing explanations | PARTIAL | Loop frames already have stable item/code/state semantics, but algorithm helper supplies one always-active code line; table/join/workflow lack shared explanation tracks. Refine a bounded existing set with semantic references. |
| Code Sandbox Visualize discoverability | MISSING | Real Figure mapping exists for 18 practice references/17 scenes; catalog and workbench do not distinguish mapped items. Advertise only actual mappings. |
| Code Sandbox workbench density/metadata | PARTIAL | Working tabs/editor/variants/progress; bespoke step buttons and raw source footer. Reuse shared Figure presentation and opt-in detail. |
| Code Interview question/review hierarchy | PARTIAL | Separate sessions and correct grading/review/flags exist. Add local reasoning/strong-answer/trade-off composition without a judge or state merger. |
| Algorithm Atlas density | PARTIAL | All 30 scenes and stepping work; sparse canvases, repeated titles and provenance noise. Use compact presentation and synchronized focus. |
| Architecture semantic nodes/icons | PARTIAL | Eight stage roles and shared layout exist; graph glyph selection ignores the semantic icon registry. Wire registered categories into the same graph renderer. |
| Pilot Galaxy hierarchy | PARTIAL | Canonical status/category data and deterministic radial graph exist. Add semantic grouping/hub/selection/status clarity without force simulation or state changes. |
| Visual Sandbox authoring clarity | PARTIAL | Real editor, bounded parser, retained valid preview and export exist. Add clearer dirty/valid/error state, presentation control and practical schema/docs links. |
| VS Code settings/tasks/extensions/snippets | MISSING | No root/workspace .vscode configuration; use existing scripts with correct nested cwd. |
| Root agent and Copilot guidance | PARTIAL | Root AGENTS is V1.1-only; Copilot guidance absent. Document current boundaries, approved reuse and targeted/release workflow. |
| Nested workspace agent guidance | CONFLICTING | Still describes only the old standalone demo and legacy live-scene inventory. Distinguish preserved legacy from typed platform and current QA. |
| Figure/Diagram/AppRecipe/Challenge editor schemas | MISSING | Existing schemas cover older generator formats. Add narrow tested structural schemas; runtime semantic validators remain authoritative. |
| Full schema/runtime equivalence | CONFLICTING | Runtime optional-field permissiveness and graph reference rules cannot be represented by a blindly strict schema. Document tested subset/runtime-only checks; do not tighten contracts to fit editor tooling. |
| Storybook existing Golden Gallery | DELIVERED | 38 stories and a11y/reduced-motion setup. Preserve all existing stories. |
| V4 composition documentation/stories | PARTIAL | Existing composites lack consistent approved-pattern descriptions. Add presentation/disclosure/reasoning/challenge/node/galaxy examples after APIs settle. |
| Direct app Monaco prohibition enforcement | PARTIAL | Apps comply; existing boundary scan concentrates on package code. Add app-source enforcement. |
| Existing QA and privacy gates | DELIVERED | Coverage, import, scaffolds, all builds, nine-output source-map privacy, screenshots, Axe and strict phone overflow. Preserve thresholds and add focused V4 regressions. |
| Backend/auth/cloud sync/execution/extension/new renderer expansion | DELIVERED | Absent as required. Keep all explicitly deferred systems out of this consolidation. |

## Implementation/release findings

The pre-implementation matrix above is immutable baseline evidence. The real delta has been implemented in the existing packages/consumers, with no app or renderer-family expansion.

| Target group | V4 outcome | Verification / disposition |
| --- | --- | --- |
| Baseline/inventory/identity preservation | DELIVERED | Exact V3 parent retained; deterministic 323/500 corpus, 30 Figures, 36 interview questions, canonical registry and all existing routes retained. |
| Consumer/developer language boundary | DELIVERED | Shared native details in Figure/notebook/progress/challenge surfaces, visible human attribution, optional developer inspection; public Formation wording cleaned with stable historical IDs/source bytes. |
| Shared visual/presentation layer | DELIVERED | Semantic tokens, compact/regular/expanded component props, stable content-fitted viewports, native-size narrow/split-pane panning. No sizing fields in FigureSpec. |
| Proven factorisation | DELIVERED | Reused existing shell/progress/reduced-motion boundaries, replaced workbench playback duplication, added only disclosure and semantic cue/presentation boundaries. Non-extractions remain explicitly local. |
| Existing explanations | DELIVERED | Eleven scenes, 34 preserved frames, 37 code lines; entity/code/state focus and invariant/export tests. No scene-count inflation. |
| Formation polish / assessment continuity | DELIVERED | Learning-first catalog/notebooks/checkpoints; reproduced attempt-remount failure fixed with red/green regression and explicit new-attempt action. |
| Sandbox / Interview | DELIVERED | Truthful Visualize indicators and shared player; distinct compact reasoning/answer/review hierarchy, ungraded local notes and strong-answer/trade-off guidance. |
| Algorithm / Architecture | DELIVERED | Compact teaching scenes; existing Diagram engine/registry now renders semantic node roles with readable labels and aspect-fitted layouts. |
| Pilot / Visual Sandbox | DELIVERED | Canonical category/status/selection Galaxy; local state unchanged. Authoring now distinguishes valid-pending/invalid/applied and preserves last-valid preview. |
| Editor/DX/Storybook/CI | DELIVERED | Native configuration, four tested structural schemas, direct-app Monaco prohibition, layered AGENTS/Copilot, 38 preserved + eight new stories with required-ID guard. |
| Existing QA/no-execution/private-output boundaries | DELIVERED | All old gates remain required; screenshot thresholds and coverage floors unchanged. V4 evidence is separated from historical reports/screenshots. Final observed gate/CI results are recorded in the test report. |
| Full schema/runtime equivalence | PARTIAL | Deliberate boundary: structural schema assistance is delivered; cross-object references/cycles and historically unchecked optional fields remain runtime concerns, with explicit limit tests. No contract is silently tightened. |

Independent integration review found and fixed two new edge cases: unchecked non-string Figure status must not be rendered as a React child, and opt-in sizing must not bypass existing malformed-scene fallback. Visual inspection additionally corrected split-pane text shrinkage, oversized layered canvases, radial node scale and an over-tall Interview prelude. These are tested corrections, not deferred blockers.

Remaining limitations are intentional: workflow explanation tracks align to the first declared run (the refined retry fixture has one run); dense graphs use text alternatives and inspectors on small screens; schemas do not certify arbitrary renderer payloads; local backups remain product-specific. No hosted site deployment or full historical Storybook accessibility certification is claimed.

The completed API/extraction inventory is in [V4_FACTORISATION_REPORT.md](V4_FACTORISATION_REPORT.md), before/after evidence and scene outcomes in [V4_VISUAL_REVIEW.md](V4_VISUAL_REVIEW.md), tooling limits in [V4_DX_REPORT.md](V4_DX_REPORT.md), compatibility in [V4_MIGRATION_LOG.md](V4_MIGRATION_LOG.md), and exact finished-tree/hosted evidence in [V4_TEST_REPORT.md](V4_TEST_REPORT.md) and [V4_BUNDLE_REPORT.md](V4_BUNDLE_REPORT.md).
