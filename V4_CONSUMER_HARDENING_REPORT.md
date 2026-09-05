# V4 external-consumer hardening report — 5 September 2026

## Scope and evidence

This follows historical V4 `ce8353ee0878ca74b2fe24a1af7de657a6ba61f2` without rewriting it. The user requested the evidence pack's master prompt against the framework repository. `00_READ_FIRST.md` was read first, then the master prompt/audit/matrix/scope/rerun reference, framework baseline and six consumer summaries/selected implementation evidence. All 16 supplied byte-count/SHA-256 records match. The pack was sufficient; no consumer repositories were crawled or modified.

## Stable architecture validated by the experiments

Shared shell/catalog, ChallengeWorkbench, notebook composition, progress, FigurePlayer, WorkflowSpec/DiagramSpec and deterministic layouts remain the boundaries. The six summaries report zero new renderer families and no consumer patches to shared framework source. Visual Algorithms validates authored semantics only at its audited head; its compatibility presenter is not evidence of real shared React runtime reuse. Formation still requires its missing source corpus to be restored in a separate rerun.

All seven framework applications, separate legacy application, stable content/persistence IDs, 323 practice items/500 variants, 30 Figures, EN/NO infrastructure, public registry and private-overlay rules remain intact. No semantic spec or renderer family was redesigned.

## Distribution and developer-experience defects fixed

| Delivered boundary | Change |
| --- | --- |
| Official bootstrap | `scripts/bootstrap-framework.ts`, copied verbatim by the external scaffold, uses Node/Git before dependency install. It fetches an exact commit with shallow/blob-filtered Git and materializes only the allowlisted package dependency closure. No framework install, copied historical monorepo, manifest rewriting or framework-node_modules symlink. |
| Source integrity | Exact Git HEAD plus every distributed Git blob hash; missing/injected/patched source fails, including edits hidden by Git assume-unchanged. Existing source is never silently repaired. Pin/package-selection upgrades are explicit. |
| Consumer-owned lock | Standalone pnpm workspace and dependency manifests, pinned pnpm 11.19.0. Initial consumer resolution produces its lock; fresh release requires frozen install and refuses missing/mismatched locks. The framework lock adds only the new canonical workspace importer; no dependency versions were changed. |
| Canonical data exports | `@datapass/canonical/{practice,visuals,visual-availability,projects}` names the existing `content/` directory. Four explicit read-only subpaths; no root barrel, corpus duplication, raw snapshot export or private overlay. Core/content remain pure; `@datapass/content` still has no dependencies. |
| External scaffold | Additive `generateExternalAppFiles` and `scaffold:app --mode external --output … --commit …` for all four existing presets. Standalone TypeScript/Vite/Vitest/Playwright configs, source bootstrap, release command, lock strategy and independent GitHub Actions workflow. Internal output remains compatible. |
| Release contract | Pin/source verification → frozen install → typecheck → content/spec validation → local tests → production build → production-preview Playwright at 1440px/390px → source verification. Strict preview port/no existing-server reuse, page errors, keyboard basics, ≤1px overflow, serious/critical Axe = 0 with V4's existing narrow Tabster-sentinel exclusion. |
| Framework regression proof | Two throwaway repositories outside all framework workspace ancestors: unmodified portfolio starter and genuine learning/Figure runtime fixture. Separate fresh repositories receive only consumer files/consumer lock, then bootstrap and run frozen production gates. Existing privacy scanner includes both external bundles/source maps. Hosted CI tests the exact commit, not the local development snapshot. |

The only new package identity is the explicit canonical-data boundary; the underlying data and implementation remain at their original paths. Source distribution is at package granularity. Source packages require Vite/TypeScript/tsx and are not advertised as compiled JavaScript for plain Node. Servers without partial-clone support may transfer more Git objects while the checkout remains selective.

## Verification

Development used Node **24.19.0** and pnpm **11.19.0**, from `project/conceptmotion_studio`.

| Check | Observed result before the full release gate |
| --- | --- |
| Affected baseline scaffold/practice/project/visual tests | 47 tests / four files passed. |
| Hardening source integrity, CLI, missing-lock, scaffold and canonical-export tests | 17 tests / four files passed. |
| Scaffold package coverage | 100% statements/functions/lines, >90% branches; existing package floors unchanged. |
| Root typecheck and external tooling typecheck | Passed. |
| `pnpm test:dx`, `pnpm schemas:check`, representative `pnpm validate:specs figure …` | Passed; 22 DX tests, four byte-stable schemas; real Figure structural/runtime validation. |
| Package/app boundaries | Passed; all original checks retained. |
| Portfolio production proof | Frozen install/typecheck/content/unit/build and two desktop/phone browser cases passed. |
| Learning production proof | Frozen install, deliberate lock mismatch rejection, canonical validators/semantic loop compilation, two local tests, production build/privacy and two keyboard Figure browser cases passed; final targeted run 96.809s. |

Development corrections were confined to the new tooling/tests: use Playwright's page media API, preserve the established Tabster sentinel exception and assert the refined Figure's actual semantic step IDs. No existing screenshot, overflow, privacy, Axe or coverage threshold was weakened. The new release tests are against Vite production preview, not a dev server or compatibility/static proxy.

**One complete finished-tree `pnpm check`: PASS, exit 0, 691.063 seconds.** The preceding framework `pnpm install --frozen-lockfile` also passed. The gate ran without interruption or retries: 341 unit tests in 59 files, all six original package coverage floors, deterministic practice/notebook imports, preserved legacy smoke, 22 DX tests/four schemas, all package/app boundaries and four internal scaffold proofs, both external production release proofs, all seven application builds, the separate legacy build, 46-story Storybook, nine-output privacy scan and **56/56 existing browser cases (6.0 minutes)**. The two external fixtures add **4/4 production desktop/phone cases**, for 60 browser cases across the existing and external gates.

The final external-fixture portion took 181.287 seconds (included in the full-gate duration). It tested working-tree snapshot `fe343683c51d554a18d78f97e64b748eb4b79fc6`, materializing 63 source files for Portfolio and 123 for Learning; their consumer-owned locks stayed byte-identical at 150,935 and 170,032 bytes after deliberate lock-mismatch rejection and frozen release. `qa/v4-external-consumer.json` records mode/pin/result and is uploaded by CI. This local snapshot is explicitly not the final framework commit.

Final scaffold coverage is 100% statements/functions/lines and 90.24% branches; other package metrics retain their V4 baseline values. The nine existing outputs contain 316 scanned text artifacts and 15 binary exclusions, with zero privacy violations; the two external bundles/source maps separately passed that same scanner. Full log: `project/conceptmotion_studio/qa/v4-hardening-release.log` (ignored local diagnostic). Automatically regenerated historical screenshot evidence was restored to its prior tracked bytes; screenshot comparison baselines and tolerances were never changed. Implementation and tests were unchanged after the completed gate.

The exact final SHA and matching hosted Actions URL/conclusion are provided in the delivery message after pushing; a baseline run is never treated as evidence for this follow-up. The committed report precedes its own hosted run, avoiding a recursive report-only release commit.

## Deliberately deferred consumer and future shared APIs

The [findings matrix](V4_CONSUMER_FINDINGS.md) separates baseline evidence from this pass. The [post-consumer backlog](V4_POST_CONSUMER_BACKLOG.md) individually records lexical translations, entity-neutral progress, sectioned notebooks, solution/media relationships, SQL window frames, workflow readiness/mapped instances/retry policy, Figure selection, stack presentation and Galaxy mapping. None was implemented here. No V5 charts/D3/GeoStory/Power BI work or backend/auth/execution/integration was started.

Future repeated-use priorities are to adopt this single mechanism and rerun Code Lab, Cloud Architecture and Norsk, then Formation, Visual Algorithms and Portfolio. Their six production releases are **not** certified by the framework's throwaway fixtures. Product content validation and primary flows must be extended per consumer; generated starter coverage is intentionally bounded.

See the [external-consumer guide](project/conceptmotion_studio/docs/EXTERNAL_CONSUMERS.md) for exact commands, package exports, upgrade procedure, transport/runtime limits and the GitHub Actions example emitted by the scaffold.
