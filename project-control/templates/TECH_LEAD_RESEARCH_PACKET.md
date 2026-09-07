# Technical Lead research packet — required deliverable

The Technical Lead is an independent researcher/comparator and architecture challenger. This is not an implementation task.

## Mandatory inputs

- current framework repo and exact main SHA;
- active promotion candidates/PRs;
- current consumer repos and deployed sites;
- current VizForge code/site;
- current Project Control files;
- current web research. Do not rely on old library knowledge for time-sensitive comparisons.

## Required research questions

1. Are we solving problems mature existing libraries already solve better?
2. Are we missing major capabilities from established D3/data-vis/graph/motion/educational ecosystems?
3. Which missing capabilities are actually required by our six consumers versus merely interesting?
4. Where is the current architecture elegant and where is it overengineered?
5. Are ConceptMotion, Datapass Figure, WorkflowSpec, DiagramSpec and VizForge responsibilities still cleanly separated?
6. Does any proposed renderer represent a genuinely new semantic category, or can an existing family express it?
7. What should we reuse externally, adapt through a seam, build ourselves, explicitly defer, or reject?
8. Which large future features are we at risk of forgetting, even if they remain deferred?
9. Does the strategy still serve the core goal: make AI-built professional learning/knowledge React apps substantially easier?

## External comparison coverage

Research current relevant categories rather than a fixed brand checklist: D3 and higher-level data-vis grammars/components; React visualization ecosystems; graph/DAG/layout libraries; animation/state-transition systems; interactive educational/explainer tools; declarative chart/spec systems; export/accessibility/responsive patterns; data-transformation visualizers when relevant.

For every source record URL, project/version/date if available, feature observed, and why it matters to Datapass.

## Required outputs

- executive recommendation: keep, stop, change, investigate next;
- current architecture Mermaid;
- feature-responsibility Mermaid;
- consumer-needs Mermaid or matrix;
- external library comparison matrix;
- missing-big-feature radar with `needed now`, `later`, `not our problem`, `already solved`;
- concrete overengineering review;
- architecture-principle check;
- proposed next two execution cycles, bounded enough for Director allocation.

## ZIP deliverable

Create `DATAPASS_TECH_LEAD_RESEARCH_YYYY-MM-DD_<topic>.zip` containing:
- `TECH_LEAD_RESEARCH_SUMMARY.md`
- `EXTERNAL_LIBRARY_COMPARISON.md`
- `ARCHITECTURE_DIAGRAMS.md`
- `FEATURE_GAP_MATRIX.md`
- `OVERENGINEERING_REVIEW.md`
- `CONSUMER_IMPLICATIONS.md`
- `SOURCES.md`
- `MANIFEST.md`

No code changes unless the Director separately commissions them.
