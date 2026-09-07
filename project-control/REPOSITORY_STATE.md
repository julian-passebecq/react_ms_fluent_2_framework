# Repository state ledger — bootstrap snapshot

Date: 7 September 2026. This is a starting ledger, not a substitute for the next full audit.

| Repository | Main head confirmed | Framework epoch / role | Current control status |
| --- | --- | --- | --- |
| `julian-passebecq/react_ms_fluent_2_framework` | `30e69639bfc3929c348fd8f9c6c38a2cb61984d8` | post-hardening framework main | canonical current main |
| Framework PR #3 Table Trace | head `6652930fa6ea036aec8cc87cbfe4a2d85ea83230`, base `30e696...` | bounded semantic promotion candidate | open, draft, unmerged; hardening requested |
| `julian-passebecq/Fluent2_J_Formation` | `9546bc004732e0deafe8f969d14751863cff7f74` | original V4 consumer main | re-audit; later Table Trace evidence branch exists |
| `julian-passebecq/Fluent2_J_CodeLab` | `7c3a37bd69898a70b8b76a9912c7bce29f797d26` | original V4 consumer main | re-audit; initial report did not prove full dependency-backed release gate |
| `julian-passebecq/Fluent2_J_VisualAlgo` | `d7eb11622e4b5cd701f6fd86766f49c3568d5bc1` | original V4 consumer main | re-audit; later Table Trace evidence branch exists |
| `julian-passebecq/Fluent2_J_CloudArchi` | `3325cd099b795e13e0df3127d5db662d8003d3cb` | post-hardening consumer | merged validation states exact release CI passed |
| `julian-passebecq/Fluent2_J_Norsk` | `6ce139a3d075ad9a717b4cdc7a4f77bf9e49c670` | original V4 consumer main | re-audit current release truth |
| `julian-passebecq/Fluent2_J_Portfolio` | `22104f3b12bea69562c0f131e013eb20a7dcc9a6` | original V4 preview consumer | main QA recorded dependency-backed release gate blocked |
| `julian-passebecq/Fluent2_J_Viz` | `7aaa8fa601c5fa2c9f8acfd7a4d4eb54b887b9ef` | VizForge V1.2 line | release-finalization merge exists; project audit should confirm exact CI before using as release truth |

## Historical Table Trace consumer evidence

From framework PR #3:

- Formation evidence checkpoint: `d75975c27f77738cc88a0343822181eb3c91a331`, 9 traces.
- Visual Algorithms evidence checkpoint: `711ddd2e8da94f4ad293af47da7a02e646dbb022`, 6 traces.
- Combined: 15 specs, 0 consumer renderer implementations, 0 authored geometry/keyframes.

These checkpoints are evidence branches, not automatic replacements for consumer main.

## Next audit requirement

For every active repo record:
- current default branch and head;
- active experiment branches/PRs;
- exact framework pin;
- latest CI run on the exact candidate head;
- full release-gate status;
- deployed URL and whether it corresponds to that head;
- consumer reuse/gap/QA report freshness.
