# Curated reference essentials manifest

This MEDIUM handoff contains selected high-signal files from the large FULL research archive.

The original full repositories remain in the FULL v0.6 archive. These copies are included only to save Codex from opening hundreds/thousands of irrelevant files.

## SQLBI Whiteboard

Path: `reference_essentials/sqlbi-whiteboard/`

Included:

- MIT `LICENSE`;
- Markdown import contract;
- export-design notes;
- stable board object/document model;
- command history;
- import parser/catalog;
- board partition/export grouping;
- selected DAX lexer/parser/classifier/formatter files.

Primary question it answers:

> How should semantic objects, annotations, authoring recipes, code objects and export grouping work?

## Draw.io

Path: `reference_essentials/drawio/drawio-dev/`

Included:

- Apache-2.0 `LICENSE`;
- README;
- animation architecture notes;
- layout/ELK architecture notes;
- ELK adapter source;
- small Azure and ER sidebar references.

Primary question it answers:

> How should declarative animation, live layout, nested containers and deterministic/convergent layout behave?

## Mermaid

Path: `reference_essentials/mermaid/mermaid-develop/`

Included:

- MIT `LICENSE`;
- README;
- architecture syntax docs;
- ER syntax docs;
- layout-maker guide;
- architecture DB/types/renderer/composition;
- ER DB/types/renderer;
- shared layout validator.

Primary question it answers:

> How should a small text/semantic grammar become validated graph state, layout and SVG, and how can layout quality be automatically checked?

## Excalidraw

Path: `reference_essentials/excalidraw/excalidraw-master/`

Included:

- MIT `LICENSE`;
- README;
- scene JSON format;
- frames ordering note;
- initial scene data API;
- export API docs;
- restore/normalization docs;
- Mermaid-to-Excalidraw parser architecture.

Primary question it answers:

> How should durable scene data, migration/restore, export, and external import adapters be structured?

## Python Diagrams

Path: `reference_essentials/python-diagrams/diagrams-master/`

Included:

- MIT `LICENSE`;
- README;
- main Diagram/Cluster/Node/Edge implementation;
- selected Azure provider taxonomy modules.

Primary question it answers:

> How simple can an architecture-as-code authoring API be, and how should provider node taxonomies be organized?

## Cloudcraft Go

Path: `reference_essentials/cloudcraft-go/cloudcraft-go-trunk/`

Included:

- Apache-2.0 license + NOTICE;
- README;
- Blueprint object model;
- Azure account/snapshot API model.

Primary question it answers:

> What object categories and import/export/reverse-engineering concepts appear in a mature cloud blueprint product?

## React Cloud Animation

Path: `reference_essentials/react-cloud-animation/`

Included:

- package metadata (declares MIT);
- README;
- cloud/background animation component;
- theme context;
- CSS animation rules.

Primary question it answers:

> How can a non-interactive animation overlay and theme lifecycle remain separate from core content?

This is low priority. Do not copy its decorative cloud behavior into technical diagrams.

## React Animated Charts

Path: `reference_essentials/react-animated-charts/`

Included:

- package metadata (declares MIT);
- README;
- line/bar component examples and CSS.

Primary question it answers:

> How small can a reusable visualization component API be?

This is low priority and not an architectural model for ConceptMotion.

## Intentionally not included

### React Native Animated Charts

Still available in the FULL research package. Excluded from MEDIUM because it adds mobile/native scaffolding with little value to the current browser/D3 problem.

### Full Draw.io / Excalidraw / Mermaid / Diagrams trees

Still available in FULL. The MEDIUM package keeps only high-signal files.

## Licensing rule

These files remain third-party reference material and keep their original license/metadata files where available.

Prefer independent implementation. If source code is actually copied or substantially derived into the shipping ConceptMotion codebase, review and preserve the source project's licensing requirements.
