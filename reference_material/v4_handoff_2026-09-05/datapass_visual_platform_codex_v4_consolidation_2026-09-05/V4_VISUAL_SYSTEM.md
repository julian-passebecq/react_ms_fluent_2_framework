# V4 visual system

## Reference spirit

The desired spirit is professional Fluent 2 with more editorial composition:

- light, warm neutral background rather than pure gray application chrome
- deep navy typography and structure
- muted teal for selection/flow/secondary emphasis
- amber used rarely for focal events, warnings or an active step
- white cards with thin borders and shallow depth
- clean illustrations/figures that feel integrated with the page rather than embedded generic dashboards
- generous whitespace, but not empty unused figure canvases

The user specifically preferred the earlier Formation reference image because it looked professional, neutral and Fluent-like without looking like a generic admin panel.

## Shared tokens

Prefer additive shared semantic tokens in `@datapass/ui` instead of app-specific hex duplication:

```text
canvasWarm
surfaceBase
surfaceRaised
inkPrimary
inkSecondary
accentTeal
accentAmber
borderSubtle
elevationLow
radiusCard
radiusControl
```

Map to existing Fluent tokens where possible. Avoid replacing Fluent's theme system.

## Surface hierarchy

Use 3 levels only:

```text
Canvas
  └─ Section / panel
       └─ interactive card / figure / workbench
```

Avoid nested bordered rectangles inside bordered rectangles unless they communicate a meaningful workbench split.

## Editorial figure shell

A reusable Figure presentation may include:

```text
Takeaway / message
Short subtitle
Figure
Direct annotation / explanation
Optional source/details disclosure
Controls only when the figure has meaningful state
```

Avoid displaying renderer IDs, schema labels or raw state metadata in the default consumer view.

## Typography

- stronger page title hierarchy
- compact section headings
- short explanatory prose
- direct labels over legends where feasible
- metadata visually subordinate
- code remains monospace but should not dominate non-code pages

## Motion

Allowed when it communicates:

- filtering
- row movement
- join matching
- window movement
- pointer movement
- traversal frontier
- workflow progression
- selected path
- state transition

Do not add decorative pulse/floating/glow.
