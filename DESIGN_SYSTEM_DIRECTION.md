# Design system direction

## Formula

**Fluent 2 application shell + portfolio restraint + FabricStack information architecture + BBC/Economist figure discipline.**

## Default visual profile

- light-first;
- neutral white / near-white surfaces;
- dark neutral type;
- subtle 1 px borders;
- small/medium radius rather than giant pill cards;
- minimal shadow;
- compact 14–16 px application typography;
- clear hierarchy;
- one restrained default accent (teal/azure family is appropriate);
- status colors only when semantic;
- whitespace used for hierarchy, not giant empty hero regions.

Colorful presets can exist, but the default must be professional and concise.

## Page archetypes

### Catalog
Reference: FabricStack organization.

- compact top bar;
- search first;
- category/filter rail or chips;
- concise cards/list;
- counts and implementation status;
- fast route into examples.

### Workbench
Reference: supplied portfolio workbench screenshots.

```text
Top bar
Left navigation | Canvas / figure | Inspector
                | optional code/state panel
```

No mandatory marketing hero.

### Explainer

- concise title and one-sentence objective;
- main visual takes priority;
- playback directly adjacent to the visual;
- code/state/annotation panels when relevant;
- source/note at bottom;
- direct manipulation only when it teaches something.

## Fluent usage rules

Use Fluent primitives directly whenever the problem is generic UI. Do not create `DpButton`, `DpInput`, `DpDialog`, etc. merely to rename Fluent components.

Create custom components only when they encode recurring product composition or information architecture.

## Challenge and workflow surfaces

The same visual system must support dense learning/workbench screens without looking like a marketing site.

- use progressive disclosure rather than showing every panel at once;
- allow split-pane layouts with predictable tab states;
- keep inspectors compact;
- use status color only semantically;
- prefer toolbars and tabs from Fluent over custom chrome;
- keep visual canvases white/near-white unless a dark mode is explicitly introduced later.

## Bilingual chrome

A compact EN/NO toggle can reuse the portfolio's interaction idea, but it should be optional per application/page. Do not make bilingual content a visual burden.

## Future D3 chart integration

Figure framing must stay visually consistent whether its content is ConceptMotion or the future D3 chart SDK. The shell should not change just because the renderer changes.
