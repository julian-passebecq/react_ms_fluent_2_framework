# V1 vs V2 boundary - do not blur this line

This file is intentionally explicit because the user's project space is broad and Codex should not overbuild the first pass.

| Area | Foundation V1.1 - build now | V2 - design is documented, implementation later |
|---|---|---|
| App UI | React + TypeScript + Fluent 2 shared shell/composites | mature/publish shared package, more consumers |
| Layout archetypes | Catalog, Workbench, Explainer, Challenge, Knowledge Atlas | additional specialized authoring/editor layouts only if proven necessary |
| Locale | small EN/NO provider/toggle/fallback | wider content translation workflows if useful |
| ConceptMotion core | semantic state, stable IDs, actions, transition planner | richer authoring grammar after V1 audit |
| ConceptMotion SVG | tables, algorithms, nodes/ports/edges, workflow renderer | optional embedded analytical chart/GeoStory scenes |
| Challenge | Monaco draft/solution/diff, hints, visual explanation, local progress | more content, stronger static diagnostics; still avoid universal runtime unless later justified |
| Workflow | generic WorkflowSpec, Airflow/Fabric-ADF/Lakeflow presets, simulated runs | controlled visual authoring, provider importers if later needed |
| Knowledge/source metadata | pure `@datapass/knowledge`, local fixtures, deterministic change-impact demo | collectors, AI mapping, review queue, alerts/PRs |
| Data Forge | integration contract only | real consumer integration and generated specs |
| D3 SDK | READ ONLY reference; prepare renderer-neutral surfaces and extension points | evolve to `@datapass/charts` |
| Editorial charts | no new chart grammar | annotations, facets, highlights, layers, formats, high-value marks |
| Power BI | no custom visual rewrite | same D3 renderer + PowerBIAdapter, data roles, selection, native tooltips, formatting model |
| Code intelligence | analysis/diagnostics extension slot only | DAX formatter, SQL lineage parser and language-specific adapters |
| Geographic animation | no GeoStory implementation | temporal event maps, flows, projection/camera, story controller |
| Earthquake/Paris/Nobel-style reuse | do not duplicate inside ConceptMotion | factor as GeoStory/transport/flow patterns in D3 SDK |
| Chart recommendation | no Chart Doctor | deterministic recommendation/warning layer later |
| Rendering scale | SVG | Canvas backend later if data volume proves it necessary |
| Web Components | no | optional adapter after APIs stabilize |

## What V1.1 must do specifically to make V2 easy

V1.1 is not allowed to say "we will think about integration later". It must establish these foundations now:

1. **Renderer-neutral FigureFrame / VisualizationSurface** so a future D3 chart fits existing pages.
2. **Semantic visual metadata** (title/subtitle/takeaway/source/note/accessibility summary) not tied to one renderer.
3. **Semantic theme roles** rather than importing Fluent token objects into render cores.
4. **Extensible renderer-family registry** instead of a giant hard-coded switch.
5. **Consistent lifecycle expectations**: mount/update/cleanup/reduced-motion/export.
6. **Stable versioned specs** for ConceptMotion/Workflow so future ChartSpec can coexist cleanly.
7. **Data Forge consumer contracts** that can later add ChartSpec/GeoStorySpec without changing Forge's application layout.
8. **No React requirement in lower visualization cores**.
9. **No Power BI APIs in ConceptMotion**.
10. **Stable source/feature IDs and source-aware metadata** so future monitoring can mark content for review without parsing page prose.
11. **Knowledge Atlas uses the same FigureFrame** so future D3 narrative/chart content embeds without another documentation-shell rewrite.

If V1.1 satisfies these, V2 can add the D3/Power BI/GeoStory stack as a sibling renderer rather than triggering another platform rewrite.
