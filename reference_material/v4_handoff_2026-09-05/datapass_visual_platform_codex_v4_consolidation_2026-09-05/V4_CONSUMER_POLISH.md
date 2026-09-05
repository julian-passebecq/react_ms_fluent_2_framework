# V4 consumer polish

## Formation

Required:

- product name is simply **Formation** everywhere in consumer chrome
- remove user-visible historical `Dubreu` wording from lesson/fixture prose where it is not legally/provenance-required
- historical provenance may remain in non-bundled audit/migration docs
- if safe, rename internal helpers like `useDubreuProgress` to Formation terminology while keeping the persisted storage key backward-compatible
- move internal IDs/schema/runtime disclaimers out of the normal lesson surface
- strengthen the course catalog and reasoning lessons with better hierarchy, more compact figures and restrained editorial cards
- keep Python / SQL / SQL Advanced / PySpark / Practice / Progress separation
- PySpark remains display/explanation/external-launch only

Do not add a marketing hero that delays access to the course.

## Code Sandbox

Make the differentiator obvious:

- challenges with a Figure should advertise **Visualize** clearly
- consider a small static preview/indicator using the existing production Figure path
- preserve the 323-item catalog and 500 variants
- keep Description / Visualize / Hints / Notes and Code / Solution / Compare
- improve workbench density and filter hierarchy
- no fake universal judge or Spark execution

## Code Interview

- keep separate from Code Sandbox
- improve session/question/review visual hierarchy
- show candidate reasoning, answer, review, strong-answer points and trade-offs clearly
- keep flags/review progress
- remove raw implementation metadata from default question UX
- code practice remains ungraded unless existing semantics explicitly grade a question type

## Algorithm Atlas

- improve compactness of small algorithm figures
- make the selected step visually obvious
- add synchronized data/code/state cues to the selected high-value scenes
- preserve all 30 current semantic scenes
- do not migrate all deferred ML families in V4

## Architecture Atlas

Keep the semantic backbone and shared layout.

Improve generic node presentation using a semantic icon/category registry rather than provider-specific bespoke components.

Useful categories:

- Source
- Move
- Store
- Process
- Model
- Serve
- Operate
- Govern

Nodes may show icon + title + category + provider/service name where relevant. Active path and selected node should be more legible.

Do not put vendor asset URLs into DiagramSpec. Do not create a second graph engine.

## Pilot Center

Strengthen Project Galaxy without making it decorative:

- use canonical category/status data
- clearer hub hierarchy
- optional category rings/bands or shared group bounds
- semantic iconId where available
- selected project path emphasis
- useful status legend
- detail panel remains more important than animation

Idea Board stays local-first and structured. No backend/cloud sync in V4.

## Visual Sandbox

Keep it technical and efficient.

Improve only where it helps authoring:

- clearer validation state
- schema autocomplete if implemented
- direct Storybook/renderer docs links where practical
- compact preset controls

Do not turn it into a no-code builder.
