# START HERE — Datapass Visual Platform V3

Baseline repository: `julian-passebecq/react_ms_fluent_2_framework`
Baseline commit: `8cccd77ecd0d0b60b1d28ee2e41cffe5ec78a26f` (`v2`)

V3 is intentionally a **large consumer-expansion and reuse-proof pass**. Do not redesign the Foundation V2 packages that already work. First fix the hosted CI regression, then use the existing contracts/renderers to build real products from the user's existing sites and content.

Read in this order:

1. `V2_POST_IMPLEMENTATION_AUDIT.md`
2. `V3_SCOPE_AND_BOUNDARIES.md`
3. `CODEX_MASTER_PROMPT.md`
4. `V3_CONSUMER_APP_PLAN.md`
5. `V3_VISUAL_MIGRATION_AND_CONCEPTMOTION.md`
6. app-specific notes (`V3_FORMATION.md`, `V3_CODE_SANDBOX_AND_INTERVIEW.md`, `V3_ARCHITECTURE_ATLAS.md`, `V3_PILOT_CENTER_AND_PROJECT_REGISTRY.md`)
7. `V3_VISUAL_LANGUAGE.md`
8. `V3_QA_ACCEPTANCE.md`
9. `V4_V5_CONSOLIDATION_ROADMAP.md`

## The V3 principle

**Reuse before abstraction. Migrate meaning, not old UI.**

Use V3 to prove that the platform can power several substantially different applications. V4/V5 will consolidate any repeated patterns revealed by these real consumers.

## Non-negotiable first task

The new hosted GitHub Actions run on V2 is red only because Linux visual baselines are missing. All install/typecheck/unit/boundary/scaffold/build/legacy/Storybook stages passed. Fix the visual-regression baseline strategy and get hosted CI green before calling V3 complete. Do not disable screenshot tests.
