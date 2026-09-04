# V2 self-audit checklist

## Architecture

- [ ] pure contracts do not import React/Fluent/Monaco/DOM/provider SDKs
- [ ] `@datapass/ui` still does not import ConceptMotion semantics or Monaco
- [ ] code editor is one shared adapter, not duplicated page code
- [ ] Figure unifies metadata/lifecycle, not renderer geometry
- [ ] Notebook/Course content does not own execution engines
- [ ] PySpark content is display-only unless an external launch action is explicitly used
- [ ] generated apps compose packages rather than copy source

## Performance

- [ ] Catalog initial load does not request Monaco
- [ ] Knowledge initial load does not request Monaco
- [ ] code route dynamically loads editor chunk
- [ ] no new large dependency is placed in the main shell chunk without justification
- [ ] bundle report records actual values

## Content/import

- [ ] deterministic source IDs/hashes
- [ ] no notebook execution during import
- [ ] unsafe HTML/script handling tested
- [ ] images/media paths deterministic
- [ ] source outputs labeled truthfully
- [ ] Deepnote SQL extraction conservative/fallback-safe
- [ ] imported license/provenance metadata preserved

## Learning UX

- [ ] lesson is not a raw notebook clone
- [ ] objectives/key points are easy to scan
- [ ] ConceptMotion used only when explanatory
- [ ] hints progressive
- [ ] solution reveal explicit
- [ ] diff readable
- [ ] local status visible but not noisy
- [ ] PySpark no-execution state clear

## Progress/assessment

- [ ] existing challenge local data migrates safely
- [ ] attempts versioned
- [ ] mock exam does not leak correctness before submit
- [ ] original/synthetic demo questions only

## Reuse

- [ ] Storybook shows production components
- [ ] app scaffold consumes shared shell/theme
- [ ] Project Hub uses generic Catalog components
- [ ] no repository-specific component added to core without need

## QA

- [ ] unit tests
- [ ] boundary tests
- [ ] typecheck
- [ ] production build
- [ ] legacy build/smoke
- [ ] Playwright desktop
- [ ] Playwright phone
- [ ] Axe
- [ ] reduced motion
- [ ] deterministic SVG export
- [ ] CI green

## Reports

- [ ] V2_TEST_REPORT.md
- [ ] V2_AUDIT_SELF_REVIEW.md
- [ ] V2_MIGRATION_LOG.md
- [ ] V2_API_SURFACE.md
- [ ] V2_BUNDLE_REPORT.md
- [ ] V2_CONSUMER_VALIDATION.md
