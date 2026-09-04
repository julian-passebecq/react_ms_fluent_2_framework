# V2 acceptance criteria

V2 is accepted only if all required items below pass.

## Baseline preservation

- existing `pnpm run check` behavior remains passing or is replaced by an equivalent superset;
- legacy catalogue/build smoke still passes;
- existing 60+ v1.1 unit tests remain passing;
- current Chrome desktop/phone behaviors remain passing;
- boundary audit remains clean.

## Editor/performance

- Challenge and Workflow use the shared code adapter;
- Catalog/Knowledge do not load Monaco on initial route load;
- Monaco loads only when a code/spec surface is opened;
- bundle report contains actual before/after chunk data;
- no editor functionality regression in solution/diff/spec modes.

## Figure/content

- serializable FigureSpec exists outside UI/rendering implementation;
- at least ConceptMotion and static fallback adapters work through the application Figure boundary;
- Figure can be embedded in Knowledge and Notebook;
- fallback/source metadata remains accessible.

## Notebook/course

- deterministic importer exists and is tested;
- raw notebook code is never executed during import;
- Markdown, code, static text/table/image outputs are supported;
- unsupported/unsafe output is rejected or sanitized with warnings;
- source hashes/provenance are retained;
- Deepnote SQL wrapper extraction has tests;
- unchanged source reimport is deterministic.

## Dubreu consumer

- course catalog works desktop/mobile;
- at least one SQL course lesson is presented as a Fluent lesson rather than raw notebook chrome;
- at least one advanced SQL exercise supports Try -> Hint -> Reveal -> Compare;
- at least one ConceptMotion explanation is attached to a SQL/Python concept;
- one PySpark lesson renders notebook content with a clear no-execution state;
- no UI implies that PySpark/Spark ran in-site;
- progress persists locally;
- one assessment/QCM path works.

## Assessment/progress

- Challenge progress survives migration;
- Assessment attempts/results are versioned and locally persisted;
- practice feedback and mock-exam deferred feedback are distinct;
- JSON import/export is validated if implemented.

## Catalog/app factory

- Project Registry validates;
- Project Hub proof renders direct website links;
- catalog supports search + at least one facet/sort + cards/table or equivalent dense mode;
- scaffold command creates a compilable app using shared packages;
- generated app does not copy renderer source.

## Storybook/CI

- Storybook builds with representative Golden Gallery stories;
- CI runs frozen install, typecheck, unit/boundary checks and production build;
- browser smoke remains available.

## Accessibility

- no serious/critical Axe findings on new primary V2 surfaces;
- no page-level horizontal overflow on phone width;
- keyboard navigation works for learning controls;
- reduced motion preserves step/static comprehension;
- figure text fallbacks remain accessible.

## Explicit non-claims

The V2 reports must explicitly state if these remain absent:

- Spark execution;
- Python/SQL runtime execution;
- Jupyter kernel integration;
- live source monitoring;
- cloud sync/accounts;
- npm package publication.
