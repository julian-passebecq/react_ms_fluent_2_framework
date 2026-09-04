# V3 QA and acceptance

## P0 — hosted CI

- GitHub Actions is green on the final V3 commit.
- Visual regression remains enabled.
- The Linux snapshot/baseline issue from V2 run `33913887435` is fixed reproducibly.
- CI uploads diagnostics on failure.

## Foundation regressions

- V1/V2 typecheck/unit/boundary/scaffold/build/legacy/Storybook gates remain green.
- Catalog/Knowledge/non-code initial routes still do not load Monaco.
- Challenge/Code surfaces still load Monaco lazily.
- No execution claim is introduced for PySpark.
- no private repository URL leaks into public bundles.

## Pure-package coverage

Add reported coverage for at least:

- `@datapass/content`
- `@datapass/notebook-import`
- `@datapass/progress`
- `@datapass/scaffold`

Set reasonable thresholds based on the audited result. Avoid a one-number vanity target that encourages low-value UI tests.

## Consumer browser matrix

At minimum test representative desktop (1440px) + phone (390px) flows for:

- Formation course → lesson → figure/exercise → progress;
- Code Sandbox catalog → challenge → visualize/hint/solution/compare;
- Code Interview session → answer → submit → review/progress;
- Algorithm Atlas catalog → interactive scene controls/reduced-motion state;
- Architecture Atlas stage selection → provider lens → export/fallback;
- Pilot Center project view → galaxy selection → note create/filter/export;
- Visual Sandbox edit valid/invalid spec → Figure render/fallback/export.

For each primary surface:

- no serious/critical Axe findings;
- no page-level horizontal overflow;
- keyboard access to primary controls;
- truthful labels/status;
- 390px usable layout.

## Content migration assertions

If external source repos are accessible:

- Code Sandbox migration count is reported and reconciled against the source trainer's 323 distinct items;
- visual migration report lists every migrated source family/concept and target semantic family;
- Architecture Atlas records which source architecture variants/stages were migrated;
- no third-party attribution is silently dropped.

If a source is unavailable, record it as a blocker and do not fabricate content.

## Reuse acceptance

`V3_REUSE_REPORT.md` must show that the new apps use shared packages rather than copied implementation.

Required examples:

- Algorithm Atlas and Formation share Figure/ConceptMotion scenes where concepts overlap;
- Architecture Atlas and Pilot Center share DiagramSpec + radial layout;
- Code Sandbox and Code Interview share challenge/assessment/progress semantics without becoming the same app;
- Project Hub and Pilot Center share public Project Registry data.

## Performance

Keep route-level code splitting. Do not require Monaco on static/reading routes. Add bundle assertions for new apps where regressions would be meaningful. Do not block V3 merely because the lazy Monaco chunk remains large.
