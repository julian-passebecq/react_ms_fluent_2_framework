# Product strategy: core library first, lightweight frontend second

The user asked an important product question:

> Do we need a frontend to manage the library, or is VS Code enough?

## Short answer

**Use both, but keep the roles separate.**

- **VS Code / AI / files** should remain enough to author scenes and generators.
- A **lightweight frontend website** is still strongly recommended for browsing, previewing, showcasing, and documenting the library.

## Recommended architecture

### 1. Core library (the real product)

This is what AI and Codex should target.

Responsibilities:

- scene schema / JSON / YAML contracts;
- renderer registry;
- layout / animation primitives;
- icon registry and style tokens;
- exporters (SVG/PNG, later PDF/PPTX);
- import adapters;
- validation;
- prompt-friendly examples.

This should be usable without a GUI.

### 2. Simple docs/showcase website (important, but secondary)

This is mainly for:

- GitHub / portfolio / LinkedIn proof;
- gallery of available generators;
- example prompt/spec browser;
- live preview of scenes;
- filters by type (cloud, Fabric, data model, SQL lineage, algorithms, Airflow, etc.);
- copy-paste starter templates.

Think **Storybook / docs site / playground**, not a complex enterprise app.

## Why a frontend is worth it

Even if the authoring is AI-first, a frontend helps with:

- visual trust: you can actually see what the library can render;
- discoverability: find which renderer/spec to use;
- QA: manually inspect examples quickly;
- sharing: much better for GitHub and LinkedIn than a code-only repo.

## What not to build now

Do **not** start with:

- a full drag-and-drop editor;
- a heavy stateful diagramming SaaS clone;
- a full database-modeling studio;
- a complex authenticated admin app.

Those would slow the core library down.

## Best compromise for this project

### MVP

Build three layers:

1. **Core package** – promptable generator runtime.
2. **Example/spec folder** – lots of reusable samples.
3. **Docs/demo app** – clean Microsoft-modern light UI with live previews.

### Nice demo pages

- Home / positioning.
- Gallery by generator family.
- Cloud diagram examples.
- Data model / lineage examples.
- Algorithm/storyboard examples.
- Prompt-to-spec examples.
- Export / theme examples.

## UI tone

The user likes:

- Microsoft-modern feel;
- light theme;
- clean cards and readable typography.

But the current visual language is missing some **D3 perspective and expressiveness**. So the docs site should remain clean, while the actual examples carry richer D3 visual behavior.

## Final recommendation for Codex

1. Keep the library authorable through files and AI prompts.
2. Add a **small docs/showcase frontend**, because it is valuable for the user and public proof.
3. Do not turn the frontend into the primary product architecture.
4. Prioritize generator quality over frontend complexity.
