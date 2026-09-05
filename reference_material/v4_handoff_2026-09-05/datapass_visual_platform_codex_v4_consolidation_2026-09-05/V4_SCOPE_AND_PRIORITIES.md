# V4 scope and priorities

## P0 — protect the V3 baseline

- Start from final V3 `main` or its direct descendant.
- Confirm the exact baseline commit and latest hosted CI conclusion.
- Preserve the full 323-item corpus, 500 variants, 30 semantic visuals, 16 architecture variants, radial/layered layouts, local progress, Pilot notes, Visual Sandbox, Storybook and legacy application.
- No new execution backend, universal judge, Spark/Jupyter runtime, authentication, cloud sync, news/mail/social integrations, D3 Power BI rewrite or GeoStory.

## P1 — consumer vs developer presentation boundary

Create a clean, lightweight policy for what belongs in normal product UX versus developer/audit detail.

Consumer default should show:

- title
- explanation
- progress
- useful source attribution when required
- meaningful freshness when useful
- learning controls

Developer/audit details should be opt-in or confined to Studio/details panels:

- internal IDs
- schema versions
- renderer IDs
- raw source IDs
- migration notes
- build/runtime disclaimers
- internal verification metadata

Do not create a giant metadata framework. Prefer one small shared disclosure/details composition only if repeated use justifies it.

## P2 — visual refinement system

Establish a coherent professional visual grammar across consumer apps:

- warm off-white canvas
- white/neutral surfaces
- navy primary ink
- muted teal secondary emphasis
- sparse amber accents
- thin neutral borders
- restrained soft elevation
- consistent corner radii
- stronger typographic hierarchy
- compact Fluent chrome around more expressive editorial figures

The visual principle remains:

> Fluent outside, editorial inside the figure.

No neon gradients, decorative floating particles, glow, glassmorphism, excessive badge colors or motion without semantic meaning.

## P3 — figure presentation density

Do not encode consumer layout directly into semantic Figure content.

Add a reusable presentation layer/prop with a small set such as:

```ts
type FigurePresentationSize = 'compact' | 'regular' | 'expanded';
```

Consumers should choose presentation size independently from FigureSpec. Existing FigureSpec profile (`professional | editorial | sketch`) remains semantic/visual profile, not viewport size.

Goals:

- algorithm/table figures stop wasting large empty rectangles
- architecture/workflow figures can remain expansive
- mobile panning remains accessible
- static SVG export stays deterministic
- existing renderer geometry is not forked per app

## P4 — factorize only proven repetition

Audit CSS, route shells, disclosure/source blocks, catalog headers, learning headers and figure wrappers across all consumers.

Extract only when:

- same behavior appears in at least 3 consumers, or
- there is a strong semantic platform boundary.

Do not wrap every Fluent component. Do not create `@datapass/app-framework` or another generic plugin system.

## P5 — selective ConceptMotion refinement

Improve approximately 8–12 high-value existing visuals, not all 30 and not the legacy 186.

Focus on synchronized code/data/state cues, compact sizing and clearer active state for:

- SQL filter
- inner/left join or grain
- group/window
- binary search
- sliding window
- two pointers
- prefix sum
- retry/idempotency
- optionally partition pruning / CDC

No new renderer family unless the audit proves the existing renderer cannot express the interaction cleanly.

## P6 — developer experience for AI + VS Code

Implement the low-maintenance DX layer discussed after V3:

- `.vscode/extensions.json`
- `.vscode/settings.json`
- `.vscode/tasks.json`
- repo snippets
- `.github/copilot-instructions.md`
- stronger root `AGENTS.md`
- checked-in JSON Schemas where they materially improve authoring
- Storybook links/metadata for approved patterns

Do **not** build a VS Code extension in V4.
