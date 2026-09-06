# Table Trace Cross-Consumer Promotion Recommendation V1

## Decision requested

Should ConceptMotion Table Trace Motion V1 graduate from an isolated renderer experiment into the shared Datapass/ConceptMotion framework?

**Recommendation: yes, as a bounded semantic renderer family. Do not treat it as a universal visualization layer.**

This recommendation is based on two independent consumer repositories, not Studio examples alone.

## Evidence sources

### Consumer 1 — Formation

Repository: `julian-passebecq/Fluent2_J_Formation`

Experiment branch: `experiment/table-trace-consumer-evidence-v1`

Green implementation checkpoint: `d75975c27f77738cc88a0343822181eb3c91a331`

Green Actions run: `34064646300`

Table Trace Figures: **9**

Concepts:

- WHERE filtering;
- ORDER BY row movement;
- GROUP BY + SUM;
- join fan-out/cardinality;
- INNER JOIN;
- LEFT JOIN;
- FULL OUTER JOIN;
- window ranking;
- QUALIFY.

No consumer renderer implementation was required.

### Consumer 2 — Visual Algorithms

Repository: `julian-passebecq/Fluent2_J_VisualAlgo`

Experiment branch: `experiment/table-trace-consumer-evidence-v1`

Green implementation checkpoint: `711ddd2e8da94f4ad293af47da7a02e646dbb022`

Green Actions run: `34066982354`

Table Trace Figures: **6**

Concepts:

- window rank alternate;
- hash partition routing;
- shuffle movement;
- skew convergence;
- repartition row movement;
- coalesce row movement.

Again, no consumer renderer implementation was required.

## Combined result

| Measure | Formation | Visual Algorithms | Combined |
| --- | ---: | ---: | ---: |
| Consumer-authored Table Trace specs | 9 | 6 | **15** |
| Consumer renderer implementations | 0 | 0 | **0** |
| Authored geometry/keyframes | 0 | 0 | **0** |
| Independent real-browser consumer gates | 1 | 1 | **2** |
| Desktop + phone evidence | yes | yes | yes |
| Reduced-motion evidence | yes | yes | yes |
| Real Web Animations evidence | yes | yes | yes |

## Semantic grammar result

Across all 15 consumer Figures the same generic relation vocabulary was sufficient:

```text
use
map
drop
create
derive
group
```

No concept-specific renderer verbs were needed for:

- filter;
- sort;
- aggregate;
- join;
- rank;
- qualify;
- hash routing;
- shuffle;
- skew;
- repartition;
- coalesce.

This is the strongest reason to promote the family. The abstraction generalizes by semantic relation rather than by lesson name.

## Critical negative evidence

Promotion should include explicit guidance about where Table Trace is not the correct renderer.

### Keep Table/Window semantics for moving `ROWS BETWEEN`

A current-row frame with changing bounds is better represented by the existing moving-frame overlay than by input/output provenance.

### Keep Algorithm/Collection semantics for algorithm state

Sorting, binary search and worklist traversal are naturally item/order/worklist state machines. Converting them to tables would make the model worse.

### Keep WorkflowSpec for retries/backfills

Attempt state, dependencies and rerun scope are workflow concepts.

### Keep DiagramSpec for architecture/topology

Table Trace should not compete with the architecture/graph responsibility split already established by V4.

## Framework integration evidence

The post-hardening runtime and Table Trace were developed on parallel experiment branches:

- post-hardening parent: `30e69639bfc3929c348fd8f9c6c38a2cb61984d8`
- verified Table Trace parent: `2047ea759b7059428841969de354005387104d88`

Automatic branch merge did not apply cleanly because both changed central renderer registry/scene/explanation files.

The integration branch:

`experiment/post-hardening-table-trace-consumer-v1`

preserves:

- `@datapass/canonical`;
- `collection.flow`;
- moving SQL `ROWS` frame support;
- post-hardening Figure behavior;

and adds:

- Table Trace semantic/compiler exports;
- Table Trace renderer registration;
- motion helpers;
- deterministic trace freeze behavior;
- Table Trace Figure integration;
- a refined `showInspector` selection contract.

Verified framework checkpoint used by Visual Algorithms:

`259b0a42dcc546ca42f62335f10e293c78aa6283`

Validation run:

`34066433856`

passed frozen install, focused Table Trace/core/SVG/Figure tests, canonical explanation tests, full TypeScript project references and Studio production build.

## Promotion should include

### 1. Table Trace runtime

Promote the semantic compiler, renderer, motion path and Figure adapter as one coherent shared capability.

### 2. Bounded renderer-selection documentation

Document positive and negative examples. An AI consumer needs to know not only that `table.trace` exists, but when `collection.flow`, `table.transform`, `workflow.run` or DiagramSpec is semantically stronger.

### 3. One shared external-consumer QA helper

The Visual Algorithms pass rediscovered V4's narrow Axe exception for Fluent/Tabster focus sentinels. Centralize a helper that:

- excludes exactly `[data-tabster-dummy]` from Axe;
- verifies those elements are library sentinel infrastructure;
- blocks all other serious/critical findings;
- checks horizontal overflow;
- supports desktop/phone consumer gates.

### 4. Single-source framework pin validation

Consumer bootstrap should never duplicate the exact SHA in both a JSON pin and a validation script.

### 5. Explanation/code synchronization

The next high-value Table Trace improvement is synchronized rule/code focus, not another renderer family.

Examples:

- `WHERE` while predicate cells are read;
- `GROUP BY` while groups form;
- `PARTITION BY` while partitions appear;
- routing rule while shuffle/hash rows move.

### 6. Additive renderer registration

The manual integration branch exposed central-file merge pressure. Future renderer features should require fewer edits to global unions/registries where practical.

## Promotion should not include

- D3 storytelling;
- GeoStory;
- charts package work;
- Power BI visual generation;
- earthquake/flood/movie-map reusable systems;
- a universal graph engine;
- concept-specific `shuffle`, `join`, `rank`, or `repartition` renderer APIs.

Those remain outside this V4 consumer evidence decision.

## Status of framework main

This document is a promotion recommendation only.

Do **not** silently move framework `main` or the V4 consumer baseline to the experiment branch. The lead framework pass should review the exact integration diff and deliberately choose the promotion commit/version after the consumer reports are compared.

## Empirical answer to the V4 question

For this renderer family, the evidence is now positive:

> Datapass V4 made it substantially easier for an AI to author visually clear, deterministic SQL and distributed-data explanations because the consumer work was primarily semantic fixture authoring and lesson mapping, while the shared Figure/ConceptMotion runtime supplied layout, rendering, motion, reduced-motion behavior, playback, export and accessibility structure.

The remaining friction is concentrated in cross-repository bootstrap, branch composition and explanation-authoring ergonomics rather than in bespoke visualization implementation.
