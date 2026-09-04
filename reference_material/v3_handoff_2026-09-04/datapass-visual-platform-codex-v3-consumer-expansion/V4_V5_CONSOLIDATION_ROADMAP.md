# V4 / V5 consolidation roadmap

V3 deliberately creates real consumer pressure. Do not prematurely solve every future problem in V3.

## V4 — consolidation and factorization

Audit the V3 applications and then:

- remove duplicated consumer composition;
- split app-level monoliths that V3 exposed;
- normalize content loaders/importers;
- tighten `@datapass/content` contracts based on actual consumers;
- improve Project Registry and local overlay ergonomics;
- expand Storybook from component gallery to reusable app patterns where justified;
- broaden pure-package coverage;
- trim performance/chunks based on measurements;
- improve CI matrix/browser stability;
- create migration helpers for older standalone sites;
- decide which V3 apps remain monorepo consumers vs separate deployment repos.

## V5 — refinement / advanced capability

Possible targets based on actual need:

- deeper visual polish and motion consistency;
- Firefox/WebKit + stronger assistive-technology QA;
- optional in-browser SQL (DuckDB-WASM) / Python (Pyodide) adapters;
- richer knowledge/source collectors;
- optional notebook runtime adapters (Voila/Mercury) if still useful;
- D3 analytical SDK v2 + same-renderer Power BI bridge;
- GeoStory/narrative work;
- package publication strategy if cross-repo consumption needs it.

Do not commit V5 scope before V3/V4 audits identify which items remain valuable.
