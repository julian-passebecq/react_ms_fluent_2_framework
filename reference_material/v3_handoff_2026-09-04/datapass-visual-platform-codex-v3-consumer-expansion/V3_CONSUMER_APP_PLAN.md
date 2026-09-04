# V3 consumer application plan

## Application map

| App | Purpose | Primary shared layers | V3 goal |
| --- | --- | --- | --- |
| Formation | course-first learning | content, notebook-import, learning, figure, progress | productionize V2 proof + reasoning capstones + visual profile |
| Code Sandbox | large coding/practice catalog | UI Explorer, code, figure, progress, Challenge Workbench | migrate/factor the existing 323-item data-engineering trainer |
| Code Interview | interview sessions | Assessment, progress, code-choice/editor, figure | separate interview mode from Code Sandbox |
| Algorithm Atlas | mental models / interactive concepts | ConceptMotion, Figure, Knowledge, code | consolidate reusable visuals scattered across apps |
| Architecture Atlas | cloud/data architecture | DiagramSpec, WorkflowSpec, lineage, Figure, icons | semantic cross-cloud architecture explorer |
| Pilot Center | personal app universe | ProjectRegistry, Explorer, DiagramSpec, local store | projects + galaxy + next actions + sticky notes |
| Visual Sandbox | framework development surface | code + content validation + Figure | edit real specs and render production figures |

## Optional low-cost app

A standalone public **Project Hub** can be scaffolded from the public Project Registry after the required apps are stable. It should be a thin consumer, not another project-management system.

## Reuse target

For every app, document:

- shared packages imported;
- shared semantic specs used;
- app-only components/data;
- copied code from older apps (target: zero except licensed data/content migrations);
- any new abstraction created and the two-or-more consumers that justify it.

If the same substantial UI/semantic implementation is copied twice during V3, stop and promote the pattern into an existing shared package. If it appears only once, keep it in the consumer until V4 proves otherwise.
