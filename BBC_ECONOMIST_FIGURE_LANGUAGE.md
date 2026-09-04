# Editorial figure language

ConceptMotion should borrow the discipline of BBC/Economist charts, not copy brand assets.

## Figure contract

Every serious figure should be able to express:

```ts
{
  title,
  subtitle,
  takeaway,
  source,
  note,
  units,
  legend,
  annotations
}
```

## Defaults

- highlight one main message;
- mute context instead of making every series equally saturated;
- prefer direct labels;
- keep axes/grid minimal but legible;
- annotations should target semantic entities;
- display units/source/note consistently;
- use typography and spacing to create hierarchy;
- no 3D or decoration that reduces reading accuracy.

## Animation

Animation is allowed where it explains change, ordering, causality or flow. The final state must still work as an editorial static figure.
