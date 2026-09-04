# Semantic motion specification — v1 direction

This document defines the direction, not a final frozen schema. Codex may refine names if tests and migration are clearer, but preserve the semantics.

## Entities

Every object that should be trackable through time needs a stable ID.

```ts
type Entity = {
  id: string;
  kind: 'row' | 'cell' | 'node' | 'edge' | 'mark' | 'variable' | 'annotation' | string;
  role?: string;
  label?: string;
  data?: Record<string, unknown>;
};
```

## Scene metadata

```ts
type FigureMeta = {
  title: string;
  subtitle?: string;
  takeaway?: string;
  source?: string;
  note?: string;
  units?: string;
};
```

## Semantic actions

P0 action vocabulary:

- `select`
- `highlight`
- `focus`
- `move`
- `filter`
- `sort`
- `join`
- `group`
- `aggregate`
- `deduplicate`
- `window`
- `iterate`
- `compare`
- `emit`
- `flow`
- `route`
- `fail`
- `retry`
- `resolve`
- `annotate`

Actions should target IDs/roles/entities, not screen coordinates.

## Transition planning

For each timeline step, compile semantic state and classify each stable entity:

```text
enter | update | move | emphasize | de-emphasize | exit
```

This diff becomes renderer input. The renderer is responsible for geometric interpolation, not semantic inference.

## Flow kinds

Cloud/data-engineering diagrams require explicit kinds:

| Kind | Meaning | Suggested motion grammar |
|---|---|---|
| `batch` | grouped periodic transfer | grouped block/pulse moving on an edge |
| `stream` | continuous events | spaced particles moving continuously while active |
| `cdc` | insert/update/delete change events | discrete events carrying operation semantics |
| `data` | generic data transfer | restrained moving markers |
| `control` | orchestration/control signal | distinct line/marker pattern, not confused with data |
| `dependency` | static prerequisite | normally static edge, focus on activation |
| `lineage` | derivation relation | static or directional reveal |
| `error` | failure route/status | explicit error marker/path, not color-only |

## Layout contract

Specs should provide logical relationships and optional constraints. The renderer/layout engine determines positions.

Useful constraints:

- direction: `lr | rl | tb | bt`;
- grouping/container membership;
- preferred rank/layer;
- source/target ports;
- alignment hints;
- compact/comfortable density.

No hand-authored `x/y` should be required for normal generated scenes.

## Reduced motion

Reduced motion must not simply stop midway. It should show the current semantic state with instant transitions and retain annotations/state changes.
