# V4 factorisation audit

## Goal

V3 produced enough real consumers to discover repetition from evidence. V4 should now simplify the platform without inventing an abstraction for every repeated line.

## Required audit

Generate a report covering:

- duplicate CSS declarations/patterns across `apps/*/src/styles.css`
- repeated app shell/header/navigation composition
- repeated source/provenance/status blocks
- repeated catalog filter/metric patterns
- repeated Figure wrapper/presentation logic
- repeated local progress adapters
- repeated URL state helpers
- repeated responsive breakpoints
- repeated color values now suitable for semantic tokens

For each candidate mark:

```text
KEEP LOCAL
EXTRACT SHARED
DELETE / REPLACE
DEFER
```

and provide the evidence count.

## Extraction rules

Good shared extraction examples:

- a source/details disclosure used consistently by Formation, Atlas and Sandbox
- a Figure presentation wrapper used by several consumer apps
- semantic color/surface tokens repeated everywhere
- a compact page/section header composition repeated across apps

Bad extraction examples:

- Pilot-only Idea Board state
- Interview-only session policy
- Sandbox-only practice catalog behavior
- Atlas-only provider lens policy
- consumer-specific route layout

## Package boundaries

Keep current boundaries unless evidence shows a real problem:

- `@conceptmotion/core`
- `@conceptmotion/svg`
- `@conceptmotion/react`
- `@datapass/ui`
- `@datapass/content`
- `@datapass/figure`
- `@datapass/code`
- `@datapass/learning`
- `@datapass/progress`
- `@datapass/knowledge`
- `@datapass/notebook-import`
- `@datapass/scaffold`

Do not create another cross-cutting mega-package.
