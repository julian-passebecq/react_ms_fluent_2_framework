# Datapass Visual Platform v1.1 delta

This file defines the ONLY material expansion from the previous v1.0 handoff. It does not cancel the v1 boundary. Codex must implement these additions without turning Foundation v1.1 into the future D3/Power BI/monitoring platform.

## Why v1.1 exists

Several future products now share one more recurring need:

- technical documentation that stays source-linked and version-aware;
- interactive diagrams embedded inside that documentation;
- multilingual explanatory content where useful;
- a future bridge from product/news monitoring into "which docs/figures/challenges need review?";
- future narrative D3 stories driven by structured events rather than bespoke code;
- future optional code-analysis services such as DAX formatting/validation and SQL lineage parsing.

The foundation should prepare these capabilities now so v2 does not require another application-shell or metadata refactor.

## What v1.1 ADDS to implementation scope

### 1. Fifth application archetype: Knowledge Atlas

Add a compact documentation/reference surface to `@datapass/ui` and the Studio demo.

Required layout behavior:

```text
TopBar
---------------------------------------------------------------
Docs navigation | article / interactive content | On this page
                |                               | sources/status
```

It must reuse the same visual language as Catalog/Workbench/Challenge:

- Fluent 2 controls;
- light-first;
- concise typography;
- restrained color;
- immediate content instead of a marketing hero;
- optional EN/NO toggle;
- embedded `FigureFrame` / ConceptMotion visual;
- official documentation links;
- version/status/verified metadata;
- a small local "what changed" panel.

Do NOT build a full documentation CMS.

### 2. New pure TypeScript package/area: `@datapass/knowledge`

If package creation is too disruptive, implement this as a clearly isolated pure-TS module with the same dependency rules and document the migration path. Preferred result is a package.

It owns data contracts and deterministic helpers only. No React, DOM, fetch, RSS parser, crawler, AI calls, GitHub APIs or Fluent imports.

Required concepts:

- `KnowledgeEntry`
- `SourceRef`
- `FeatureRef`
- `ChangeEvent`
- `ImpactRef`
- `FreshnessState`
- locale-aware text compatible with the v1 locale contract
- deterministic resolution of source/feature/change relationships
- validation and serialization

### 3. Change-aware metadata foundation

A content entry/figure/challenge can identify the product features and sources it depends on.

A change event can then state which feature IDs are affected.

The v1.1 demo must prove this locally with fixture data:

```text
Official source update
        ↓
ChangeEvent(featureIds=[fabric.runtime])
        ↓
KnowledgeEntry dependencies
        ↓
"Needs review" badge on affected article/figure
```

No internet polling in v1.1.
No AI change interpretation in v1.1.
No notifications in v1.1.

The purpose is to make those later features additive instead of architectural rewrites.

### 4. Column-level lineage readiness

Do not build or embed a SQL parser.

Extend/confirm lineage semantics so a future parser adapter can provide:

- table IDs;
- column IDs;
- source column -> derived column relationships;
- statement/change type where useful;
- expression/transformation text;
- source/target metadata;
- stable IDs;
- optional source span/line references.

Add ONE small fixture-driven column-lineage ConceptMotion scene using manually supplied parsed JSON.

### 5. Knowledge demo in Studio

Add at least one professional example article, preferably a generic Fabric/data-engineering concept rather than copying Microsoft documentation.

The demo must show:

- title/summary;
- optional EN/NO translated explanatory copy;
- official source link(s);
- status badge (`GA`, `Preview`, `Deprecated`, or neutral where appropriate);
- `verifiedAt`;
- related version/product metadata;
- one embedded ConceptMotion figure;
- one local ChangeEvent causing a visible "needs review" state;
- "On this page" navigation or equivalent compact section navigation.

Use original text. Do not copy long passages from documentation.

### 6. Semantic icon registry boundary

Establish a small semantic `iconId` resolver/registry boundary so diagrams and Knowledge Atlas do not hard-code asset paths. Use stable semantic IDs, local assets/fallbacks and optional provenance. Do not build a vendor icon crawler/sync engine. Read `ICON_REGISTRY_CONTRACT.md`.

### 7. Extension slots for future code intelligence

Challenge Workbench should expose a clean optional UI slot/contract for diagnostics or analysis output.

Do not integrate external services now.

Future examples include:

- DAX Formatter -> format + syntax diagnostics;
- SQL lineage parser -> parsed lineage visualization;
- language-specific syntax/lint adapters.

V1.1 only needs the extension point and typed diagnostic display shape if appropriate.

## What v1.1 explicitly DOES NOT add

- no RSS/news crawler rewrite;
- no automatic Microsoft Learn scraper;
- no AI article summarizer;
- no automated book rewriting;
- no real change alerts;
- no DAX Formatter network calls;
- no SQL parser integration;
- no handwriting editor;
- no freehand whiteboard;
- no article-to-dashboard generator;
- no James Bond/movie map implementation;
- no D3 GeoStory implementation;
- no Power BI D3 overhaul;
- no React Flow rewrite of ConceptMotion core;
- no MDX/CMS project unless already trivial in the chosen app structure.

## v1.1 success criterion

A future project should be able to add a source monitor, a D3 narrative map renderer, or a code-analysis adapter without replacing the shell, content contracts, figure framing, locale system, or lineage semantics built in v1.1.
