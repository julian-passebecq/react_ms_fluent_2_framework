# V2 scope and boundaries

## Goal

Turn Foundation v1.1 into a reusable platform that can produce real learning/documentation/catalog consumer sites quickly without adding a mandatory backend or another UI framework.

## Required V2 outcomes

### Platform/productization

- route-level lazy loading;
- one reusable Monaco adapter package/surface;
- renderer-neutral serializable `FigureSpec`;
- content contracts for Course/Lesson/Notebook/Assessment;
- deterministic `.ipynb` importer;
- shared ProgressStore compatible with Challenge and Assessment;
- stronger Catalog/Explorer primitives;
- canonical Project Registry;
- small AppRecipe/scaffold command;
- Storybook Golden Gallery;
- GitHub Actions CI.

### First real consumer proof

Create a **Dubreu Formation** reference consumer from the new contracts.

It should demonstrate:

- a SQL course lesson imported from `.ipynb`;
- an advanced SQL exercise with hint/solution/compare;
- a Python-style notebook lesson surface;
- a PySpark notebook rendered as a rich read-only lesson;
- at least one ConceptMotion figure attached to SQL/Python concepts;
- local progress;
- a QCM/practice question;
- runtime launcher buttons that never imply in-site Spark execution.

The consumer may use representative source fixtures if the training attachments are not present in Codex's filesystem. Do not fabricate the complete private training corpus.

## Required non-goals

- no Spark execution;
- no JupyterLab embedding;
- no direct Jupyter kernel protocol implementation;
- no remote arbitrary-code execution service;
- no mandatory FastAPI backend;
- no database/auth/accounts;
- no full Streamlit application;
- no live NRK or vendor scraping;
- no automatic AI rewriting;
- no full D3 SDK v2 / Power BI / GeoStory implementation;
- no Data Forge backend implementation;
- no migration of every historical site;
- no no-code CMS/page builder.

## PySpark rule

PySpark notebooks are **content**, not runtime.

V2 may:

- render Markdown;
- render code;
- render saved/static outputs;
- add ConceptMotion explanations;
- add questions/hints;
- offer download/open-external actions;
- show runtime requirements.

V2 must not:

- start Spark;
- proxy Spark;
- claim a code cell ran;
- fake execution output as if it were live.

## SQL/Python rule

The website should be more useful than a raw notebook even without execution.

Required improvements over raw Jupyter:

- curated lesson structure;
- objective/key points;
- simplified code cells in Monaco;
- progressive hints;
- reveal/compare;
- input/output tables;
- ConceptMotion diagrams/animations where appropriate;
- QCM/review;
- progress state;
- source/download link.

Browser SQL/Python execution is a stretch adapter, not a V2 blocker.

## Content rights/provenance

Every imported course should retain source/provenance metadata. Do not remove original attribution or license metadata. Public consumer apps must respect source licenses. Private study imports may remain private/local.
