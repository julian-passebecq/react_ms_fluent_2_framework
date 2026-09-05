# V4 ConceptMotion refinement

## Target

Keep the semantic renderer model. Improve a small set of teaching experiences so that code, data and state feel more synchronized.

## Desired cross-highlighting model

Prefer small additive semantic references over imperative app callbacks.

A frame/step may optionally expose stable references such as:

```ts
interface ExplanationFocus {
  entityIds?: readonly string[];
  stateKeys?: readonly string[];
  codeRefs?: readonly string[];
}
```

The exact API may differ after audit. The important requirement is that the relationship is semantic and stable, not pixel coordinates or DOM selectors.

## Example — sliding window

```text
DATA
[2] [1] [3]  2   4
 ^-------^

CODE
sum += values[right]
sum -= values[left]

STATE
left=0  right=2  sum=6
```

The active data window, relevant code operation and current state should be visually related during stepping.

## Example — join/grain

Show:

- matched keys
- multiplicity
- output row count
- grain badge changing when the join expands rows

The user should understand *why* rows multiplied, not only see the final table.

## Example — binary search

Synchronize:

- active candidate interval
- midpoint
- comparison result
- next interval

## Constraints

- preserve stable entity/row IDs
- preserve reduced motion and static states
- preserve deterministic SVG export
- no DOM-measured semantic state
- no new renderer-per-concept
- no custom animation loop in consumer apps
- do not turn ConceptMotion into a general animation timeline editor
