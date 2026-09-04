# Checklist for the next external audit

When the user returns the Codex v1 output, audit these areas first:

1. **Dependency direction** — verify core truly imports no React/DOM/Fluent.
2. **Stable identity** — inspect D3 updates for filter/sort/join; reject fake continuity implemented as full redraw + CSS fade.
3. **Semantic actions** — verify scenes do not require hand-authored pixel coordinates for ordinary cases.
4. **Layout determinism** — same spec must produce stable node/edge placement.
5. **Flow semantics** — batch/stream/CDC/control/error must not be merely palette variants.
6. **Fluent usage** — verify current Fluent v9 components rather than legacy Fabric APIs.
7. **UI restraint** — compare against supplied portfolio/workbench/FabricStack references.
8. **Editorial figures** — title/subtitle/source/annotation consistency.
9. **Accessibility** — keyboard, reduced motion, fallback summaries/tables, contrast.
10. **Tests** — rerun exact commands in `V1_TEST_REPORT.md`; inspect browser/visual tests.
11. **Export** — SVG freeze must be understandable and deterministic.
12. **Forge readiness** — confirm a consumer can import core/react/ui packages without app-specific coupling.
