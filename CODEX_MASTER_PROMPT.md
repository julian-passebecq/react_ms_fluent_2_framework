# CODEX MASTER PROMPT — build ConceptMotion foundation v1

You are receiving an existing ConceptMotion Studio prototype plus architecture, UX, animation and consumer references. Your job is to turn it into the first credible reusable library foundation, not to create another one-off demo site.

## Primary objective

Implement **ConceptMotion Foundation v1** with a professional **React + TypeScript + Fluent UI v9** Studio shell and a **framework-independent semantic motion core** rendered primarily through **SVG/D3**.

This v1 will be audited after you finish, so prioritize architecture, correctness, reusable primitives, deterministic behavior, visual quality and tests over catalog breadth.

## Non-negotiable product behavior

ConceptMotion must keep and improve the animated technical explanations that motivated the project:

- tables with rows physically moving through filter/sort/join/group/dedup/window operations;
- algorithms with pointers, arrays, stacks, queues, trees and graph traversal;
- programming loops with current iteration, code focus and variable/state inspection;
- statistics/ML explanatory visuals such as regression, clustering, distribution or gradient descent;
- data-engineering DAGs, lineage, star schemas and cloud architectures;
- animated data flux with distinct semantics for batch, streaming, CDC, control flow and failure/error paths;
- play/pause/step/scrub/speed and reduced-motion behavior;
- hover/focus/click/pin interactions where they add learning value.

The motion must explain state or causality. Do not add decorative perpetual motion.

## Architecture to implement

Migrate incrementally toward a workspace/monorepo shape similar to:

```text
packages/
  core/        # pure TS, no React, no DOM
  svg/         # SVG/D3 renderer primitives, no React requirement
  react/       # thin React adapter/hooks/components
  ui/          # @datapass/ui Fluent-based application composites
apps/
  studio/      # Fluent-based ConceptMotion catalog/workbench/explainer
```

If a full repository move would create unnecessary risk in one pass, stage it cleanly, but the dependency direction must already be correct:

```text
core <- svg <- react <- studio
              ^
              |
          datapass/ui (Fluent application UI only)
```

`core` must never import React, Fluent, browser DOM APIs or product-specific UI.

## Fluent 2 / application UI

Use the modern Fluent v9 React package (`@fluentui/react-components`) and Fluent icons as the base UI system. Create a restrained custom theme. Do not build custom replacements for Fluent Button, Input, Menu, Dialog, Drawer, Tabs, Tooltip, etc.

Create only recurring contextual composites such as:

- AppShell / TopBar / SideNav
- CatalogShell / SearchFilterBar
- Workbench / SplitPane / InspectorPanel
- FigureFrame / FigureHeader / SourceNote
- TimelineControls
- CodePanel / StateInspector
- EmptyState / ErrorState / LoadingState

Default style: light, neutral, thin borders, minimal shadows, compact typography, one restrained accent, no generic colorful hero section.

## Editorial figure language

Inside technical figures, use BBC/Economist-like discipline:

- title, subtitle, takeaway, source/note contract;
- direct labels where possible;
- minimal grid/chrome;
- muted context with one emphasized message;
- annotations near the object they explain;
- accessible units and legends;
- no gratuitous gradients/3D.

This is a visual-language influence, not a clone.

## Semantic scene model

Do not make AI-authored scenes specify pixel coordinates as the primary language. Evolve the scene model so specs express meaning with stable entity IDs and semantic actions. Examples:

```json
{"action":"filter","target":"orders","predicate":"status == 'late'"}
```

```json
{"action":"join","left":"orders.customer_id","right":"customers.id","joinType":"left"}
```

```json
{"action":"flow","from":"bronze","to":"silver","flowKind":"stream"}
```

The renderer/layout system decides geometry.

## Stable identity and D3

The existing audit correctly identifies full-layer redraw as a major weakness. Fix this at the foundation level.

- preserve stable IDs for rows/nodes/edges/marks;
- use keyed enter/update/exit when object continuity matters;
- create a transition planner/diff between semantic states;
- allow full redraw only for static renderers where continuity is irrelevant;
- extract calculations from renderers into pure, testable semantic functions.

## Diagram primitives

Implement reusable diagram infrastructure rather than bespoke cloud SVGs:

- node registry / node types;
- groups/containers/boundaries;
- ports/anchors;
- deterministic layout contract;
- edge routing;
- labels/badges/metrics;
- semantic edge kinds;
- flow animation overlay;
- focus/pin/selection state;
- generic fallback icons/glyphs.

At minimum support edge semantics:

- `data`
- `stream`
- `batch`
- `cdc`
- `control`
- `dependency`
- `lineage`
- `error`

## Six required gold-standard examples

Implement these as polished reusable examples, not hacks:

1. **Table filter/sort** — stable rows physically move/reorder/exit.
2. **Join fan-out** — one-to-many join visibly creates result rows and preserves lineage from source rows.
3. **Programming loop** — code line focus + loop pointer + variable/state inspector synchronized.
4. **Statistics/ML** — one explanatory scene such as regression residuals or gradient descent with meaningful parameter interaction.
5. **Cloud/data pipeline** — Source → Bronze → Silver → Gold → BI with switchable batch/stream/CDC/control/error flow semantics.
6. **Data model/lineage** — fact/dimension or lineage graph using reusable nodes, ports and routed edges.

Optional if time remains: BFS/DFS graph traversal and DAG run/failure/retry.

## Studio information architecture

The Studio should use three reusable page modes:

- **Catalog**: FabricStack-like search, categories, filters, compact cards/list.
- **Workbench**: top bar + left navigation + central canvas + right inspector + optional bottom code/state panel.
- **Explainer**: concise title/explanation + large figure + playback + code/state + annotation/source.

The UI should feel closer to the supplied portfolio/workbench screenshots and FabricStack organization than to a marketing landing page.

## Personalization contract

Support theme/preset and renderer-level options without hardcoding a single visual style. Establish a typed contract for options such as:

- `preset`: `editorial | fluent | technical | minimal | dark`
- `density`: `compact | comfortable`
- `accent`
- `edgeStyle`
- `flowAnimation`
- `showIcons`
- `showMetrics`
- `motionScale`

Do not make every visual configurable in arbitrary ways; expose meaningful, stable options.

## Accessibility

Required:

- keyboard usable playback and focusable interactive objects;
- `prefers-reduced-motion` and explicit no-motion mode;
- text/table fallback for data-heavy scenes;
- meaningful SVG title/description plus current-frame summary;
- do not rely on color alone for fact/dimension/status/flow semantics;
- focus-visible and contrast checks on the Studio.

## Export

Provide deterministic **SVG export/freeze** for gold-standard scenes. A frozen export must show a complete understandable state without animation. PNG can be a follow-up if straightforward. Do not spend this pass on PPTX/video export.

## Testing and quality gates

Before feature work, run the current checks and establish a lockfile. Then add/maintain:

- pure semantic unit tests;
- schema/contract tests;
- renderer smoke tests;
- browser interaction tests for the six gold scenes;
- responsive smoke checks at desktop and phone widths;
- reduced-motion tests;
- basic accessibility checks;
- deterministic SVG snapshot or visual regression coverage where practical;
- production build.

Create `V1_TEST_REPORT.md` with exact commands/results.

## Deliverables

At completion, the repository must contain:

- working v1 foundation code;
- the six gold-standard examples;
- updated architecture docs;
- migration notes from the existing prototype;
- `V1_TEST_REPORT.md`;
- `V1_AUDIT_SELF_REVIEW.md` listing known limitations honestly;
- a short `DATA_FORGE_INTEGRATION_EXAMPLE.md` showing how Data Forge would consume `@datapass/ui` and ConceptMotion without coupling the library to Forge.

## Explicit non-goals for this pass

Do **not**:

- build a new general-purpose React replacement/framework;
- rewrite all 186 concepts;
- build a full drag-and-drop diagram editor;
- make Web Components the primary implementation;
- replace Mermaid globally;
- reimplement every standard chart type;
- overwrap Fluent primitives;
- rebuild Data Forge itself;
- add decorative motion just to make the UI look animated.

## Working style

Inspect the existing code and references before editing. Preserve useful existing functionality. Refactor incrementally and keep the app runnable throughout. Prefer a smaller coherent v1 over a sprawling partially working architecture. Do not claim tests passed unless you actually ran them.
