# ConceptMotion product contract

## What the library is for

ConceptMotion explains technical state changes visually. Its durable abstraction is not a chart type; it is **objects + semantics + time + explanation**.

A useful scene answers four questions:

1. What objects exist?
2. What changed?
3. Why did it change?
4. What should the learner notice?

## Primary domains

- Programming and algorithms
- SQL / BI / DAX
- Data transformation
- Statistics / ML / data science
- Data engineering / orchestration
- Cloud architecture
- Data modeling / lineage
- Editorial data visualization

## Required interaction model

Every animated scene can expose some subset of:

- play / pause;
- previous / next step;
- scrub timeline;
- playback speed;
- restart;
- hover/focus inspection;
- click/pin selection;
- parameter input when pedagogically meaningful;
- compare/before-after mode.

The scene itself must remain understandable in a static frozen state.

## Motion semantics

Allowed motion must communicate at least one of:

- object continuity;
- ordering;
- causality;
- flow;
- transformation;
- selection/focus;
- entry/exit;
- success/failure/status;
- comparison/progression.

Avoid ambient animation that communicates none of the above.

## Distinction from standard charting

Use Fluent React Charts or another standard chart renderer for ordinary dashboard charts when no pedagogical transformation is required.

Use ConceptMotion when the value is in explaining **how a system, algorithm or dataset changes over time**.
