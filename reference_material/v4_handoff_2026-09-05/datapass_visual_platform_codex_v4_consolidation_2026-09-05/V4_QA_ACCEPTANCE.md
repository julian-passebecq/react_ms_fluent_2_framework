# V4 QA and acceptance

## Development strategy

Avoid V3's expensive pattern of rerunning the entire release gate after every small change.

During implementation:

```text
affected unit tests
+ affected app build
+ targeted Playwright flow
```

At the end:

```text
full offline/unit/boundary/import/scaffold checks
+ all builds
+ Storybook
+ privacy scan
+ full browser matrix
+ hosted GitHub Actions
```

## Hard acceptance

V4 is complete only if:

- all V3 tests remain green or are intentionally updated with documented visual-baseline review
- final hosted CI on the final commit is green
- no visual regression gate is disabled or tolerance silently weakened
- the 323-item corpus and 500 variants remain intact
- all 30 V3 semantic figures remain valid
- all 16 architecture variants remain valid
- no public source map leaks private repository URLs
- Monaco remains lazy outside coding/spec editing paths
- no consumer app imports Monaco directly
- Figure SVG exports remain deterministic
- reduced-motion/static paths remain meaningful
- phone overflow remains within the existing strict threshold
- primary flows have no serious/critical Axe findings

## New V4 evidence

Add focused regressions for:

- consumer/dev metadata separation
- absence of user-visible `Dubreu` wording from normal Formation routes
- Figure presentation sizes
- selected synchronized code/data/state examples
- semantic architecture node/icon rendering
- Pilot Galaxy category/status grouping
- VS Code schema/task files parse correctly
- any generated JSON Schema validated against representative valid/invalid fixtures

## Required reports

Create/update:

- `V4_AUDIT_SELF_REVIEW.md`
- `V4_FACTORISATION_REPORT.md`
- `V4_VISUAL_REVIEW.md`
- `V4_DX_REPORT.md`
- `V4_TEST_REPORT.md`
- `V4_BUNDLE_REPORT.md`
- `V4_MIGRATION_LOG.md`

Each report should record actual evidence, not planned work.
