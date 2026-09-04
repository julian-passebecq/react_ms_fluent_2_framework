# Moving algorithm video — reconstructed teaching specification

Source: user-supplied screen recording in the ChatGPT conversation, observed through a contact-sheet review. The raw recording is intentionally **not included** in this handoff ZIP.

This note is for Codex because the video demonstrates the most important motion behavior the user wants generalized beyond sorting.

## What the reference is

A short social-media Bubble Sort explainer on a dark background. The useful part is not the branding or exact art direction; it is the synchronized causal presentation of **algorithm state + operation + code**.

Approximate sampled progression from the supplied recording:

| Approx. time | What is visible | What the learner understands |
| --- | --- | --- |
| 0 s | title/definition + complexity + array + code | establish algorithm and full state before motion |
| ~2 s | one adjacent pair highlighted | these are the two values currently being compared |
| ~4 s | operation changes to a swap state | comparison result causes a concrete action |
| ~6 s | same two values exchange x positions | object identity persists while position changes |
| ~8 s | next pair becomes active; code focus advances | iteration moved one comparison forward |
| ~10 s | another compare/swap | repeat causal rhythm without hiding the whole array |
| ~12 s | larger values are visibly migrating toward the right | learner sees the invariant emerging, not just isolated swaps |
| ~14–15 s | later pass/finalizing state | algorithm progresses toward sorted suffix/result |

A transient mobile/AirPods UI overlay appeared in the recording and is irrelevant to the design.

## Required synchronization model

One timeline frame should represent a single semantic moment:

```text
frame
├── stable object identities
├── current positions/order
├── active object IDs
├── settled/done object IDs
├── operation label      COMPARE | SWAP | KEEP | ...
├── one causal caption
├── codeFocus line IDs
└── optional metric/complexity note
```

The next frame changes only what the algorithm actually changed.

## Visual acceptance criteria

For a swap-like operation:

1. the values keep the same stable IDs;
2. the active pair is visually obvious before the movement;
3. the operation is named before/during movement;
4. values interpolate from old x positions to new x positions — they must not disappear and respawn;
5. the relevant code line stays highlighted during the same transition;
6. settled values have a persistent but secondary state;
7. animation can be disabled and the before/after frames remain understandable;
8. previous/next/replay/scrub must reproduce deterministic states.

## Why this should generalize beyond Bubble Sort

The same object-constancy pattern applies to:

- SQL rows moving into/out of a window frame;
- JOIN result rows appearing as matching pairs are resolved;
- Spark records moving between partitions during shuffle;
- Parquet row groups/pages being eliminated by pruning;
- DAG tasks changing blocked → runnable → running → success/failed;
- SCD2 rows changing current/expired while a new version appears;
- hash-join build records entering buckets, then probe rows finding matches;
- queue/heap/pointer algorithms;
- data-cleaning transformations where the same row survives, changes, or is removed.

The renderer should therefore animate **semantic object continuity**, not simply animate SVG properties because animation is available.

## Anti-patterns to avoid

- clearing the SVG and redrawing the next frame when tracking identity matters;
- highlighting code that is not responsible for the visible action;
- continuous particles with no semantic meaning;
- hiding all non-active data so context is lost;
- stopping an algorithm before the final invariant is established;
- showing complexity as the main event rather than supporting metadata;
- copying creator branding, social-app chrome or exact visual assets.

## Current implementation status

The Bubble Sort scene now has a complete final sorted state and synchronized `operation`/`codeFocus`. The array-like renderer supports stronger motion than many other renderers. However, the project still has many `resetLayer()` redraw-based renderers; converting motion-heavy scenes to keyed D3 joins is the most important fidelity improvement for the next agent.
