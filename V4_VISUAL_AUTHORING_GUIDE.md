# Authoring shared visual explanations

Run authoring and release commands from `project/conceptmotion_studio` with Node 24.19.0 and pnpm 11.19.0. Keep the official exact-commit bootstrap, source verification and consumer-owned frozen lockfile described in [EXTERNAL_CONSUMERS.md](project/conceptmotion_studio/docs/EXTERNAL_CONSUMERS.md).

## Start from approved runtime examples

```tsx
import { FigurePlayer } from '@datapass/figure';
import { visualExplanationFigure } from '@datapass/canonical/explanations';

<FigurePlayer
  figure={visualExplanationFigure('de-shuffle')}
  presentationSize="compact"
  showInspector={false}
/>
```

The `V4/Visual explanations` Storybook group contains fourteen approved compositions using these exact production components. The [capability matrix](V4_VISUAL_CAPABILITY_MATRIX.md) lists all seventeen canonical examples. The existing `@datapass/canonical/visuals` export and thirty migration Figures remain compatible; explicitly choose the explanatory variants for new teaching work. IDs identify the same concepts and source items across these representations. Do not concatenate both galleries into a catalog with duplicate IDs.

FigurePlayer owns Play/Pause/Previous/Next/Reset, slider, speed, selection, captions, SVG export and reduced-motion behavior. Consumers should not copy its state machine or substitute an HTML presenter. Presentation size is a component concern; do not add dimensions to FigureSpec.

## Choose a grammar by the change being explained

| Change | Authoring contract |
| --- | --- |
| Reorder stable values in a sequence | `LoopSceneSpec`, `algorithm.loop`: `order`, active/pointer/done IDs, `codeLineIds`, variables, operation and caption. |
| Match source rows and create result pairs | `JoinSvgSceneSpec`, `table.join`: existing `TableJoinSpec`, `revealCounts` and `ExplanationTrack`. |
| Filter/sort rows or move a consecutive frame | `TableSvgSceneSpec`, `table.transform`: compiled table states; optional `windowFrames`. |
| Move stable items between named containers | `CollectionFlowSpec`, `collection.flow`: complete placements, optional annotations/focus/summaries and explanation track. |
| Advance task state in a DAG | Existing `WorkflowSpec` / `workflow.run`. |
| Explain topology | Existing `DiagramSpec` / `diagram.flow`. |

Each teaching step should identify the active object, name the operation, show its physical/state change, focus the relevant code line, update useful variables and explain why. Write short labels and bounded examples. Do not author coordinates, paths, selectors, per-item durations, provider-specific geometry or runtime execution claims.

## Collection contract

`@conceptmotion/core` exports `CollectionContainer`, `CollectionItem`, `CollectionPlacement`, `CollectionSummary`, `CollectionFrame`, `CollectionFlowSpec`, `CompiledCollectionFrame`, `validateCollectionFlowSpec` and `compileCollectionFrame`.

```ts
import { compileCollectionFrame, type CollectionFlowSpec } from '@conceptmotion/core';

const scene: CollectionFlowSpec = {
  kind: 'collection', version: '4', id: 'route-demo', title: 'Route one row',
  containers: [{ id: 'input', label: 'Input' }, { id: 'bucket', label: 'Bucket A' }],
  items: [{ id: 'r1', label: 'r1 · key A' }],
  frames: [
    { id: 'read', operation: 'READ', caption: 'Read r1 and its key.',
      placements: [{ itemId: 'r1', containerId: 'input' }] },
    { id: 'move', operation: 'MOVE', caption: 'The key routes r1 into bucket A.',
      activeItemIds: ['r1'], activeContainerIds: ['bucket'],
      placements: [{ itemId: 'r1', containerId: 'bucket' }] },
  ],
  explanation: {
    codeLines: [{ id: 'route', text: 'bucket = route(row.key)' }],
    steps: [
      { id: 'read', title: 'Read the key', focus: {},
        state: [{ key: 'moved', label: 'Moved rows', value: 0 }] },
      { id: 'move', title: 'Route by key',
        focus: { entityIds: ['r1'], codeRefs: ['route'], stateKeys: ['moved'] },
        state: [{ key: 'moved', label: 'Moved rows', value: 1 }] },
    ],
  },
};
const frame = compileCollectionFrame(scene, 'move');
// frame.loads, snapshot, transition and explanation are pure deterministic values.
```

Every item must occur exactly once in every frame. Placement-array order determines order inside each container. Container/item IDs are globally unique within the scene. Focus and annotation fields are optional. `ExplanationTrack` carries the synchronized code and live scalar state; it must have exactly one step per frame.

A summary has a stable `id`, `containerId`, localized `label`, `sourceItemIds` and optional `collapsed`. Use at most one summary per container. Its contributors must be distinct members of that container. Keep summary identity and its contributor set stable across the timeline. With `collapsed: true`, contributors converge/fade into the summary while remaining in the semantic snapshot and DOM; the summary displays their provenance. Container loads still count original contributors, while explanation state can separately state output row count and grain. Grouping should show a gather step before collapse.

The compiler reuses `SemanticSnapshot` and `planTransitions`. Membership is represented with semantic parent/lane/slot fields. The renderer owns bounded, stable container geometry and uses the existing keyed SVG/motion helpers. Neither core nor content depends on UI, DOM, network or execution services.

## Joins and moving table frames

For a join, author `[read, probe, emit, probe, emit, ...]` as reveal counts `[0, 0, 1, 1, 2, ...]`. Focus source identities as `left:<rowId>` and `right:<rowId>`. Use the actual result IDs returned by `compileTableJoin` when focusing an emitted row. An unmatched LEFT row has no right focus and produces one result with NULL extension. The renderer moves a new result from its contributor toward the output column and emphasizes only the active result's lineage.

`TableWindowFrame` is `{ currentRowId, memberRowIds }`. Add `windowFrames` to `TableSvgSceneSpec`, aligned one-to-one with `frames`. `validateTableWindowFrame` requires unique visible consecutive members in display order, including the current row. `TableRendererInput.windowFrame` is the resolved overlay. Bounds, sums and partitions are authored teaching semantics, not parsed SQL. Explain an explicit `ROWS BETWEEN` rule and compute the small fixture's expected values in tests.

Workflow explanations keep `WorkflowSpec` and its compiled run frames. The SVG `workflowGeometry(spec, focusedGroupId?)` adapter derives task bounds through the existing core `layeredDiagramLayout`; the graph renderer retains its port-aware dependency routes. The explanation viewport follows these bounds so parallel branches remain separate. No layout coordinates or new execution mechanism belong in content.

## Verification and accessibility

Run affected tests, `pnpm test:dx`, `pnpm schemas:check` and `pnpm validate:specs figure <file.json>` while authoring. Editor schemas validate structure and Figure envelopes; use production scene compilers to validate membership, references, renderer payloads and all frames. Do not create a competing validator or treat an envelope alone as a visual proof.

Before release, run the full existing `pnpm check`. It includes the independent consumer's own frozen install/build and production-preview browser tests. The new tests assert actual animated SVG transforms, retained DOM identity, changing membership, active code/state, keyboard controls, reduced-motion steps, strict page overflow and serious/critical Axe=0 at both widths. They inspect real transition midpoint geometry; screenshots only supplement visual review.

Narrow layouts keep labels at native size inside a labeled, keyboard-scrollable local canvas with panning guidance, a full text alternative and the current caption. Automatic playback is disabled under reduced motion; every meaningful state remains available through stepping. Shared keyed reordering uses `Element.moveBefore` when available to preserve focus and CSS animation state. Older DOM implementations fall back to deterministic static placement; this pass certifies desktop Chrome and its 390px layout, not all browsers.

## Technical grounding

The data examples are original teaching fixtures. [Spark coalesce](https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.DataFrame.coalesce.html) documents narrow-dependency partition reduction; [Spark repartition](https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.DataFrame.repartition.html) documents partition redistribution. Counts of moved marks in these fixtures are not measurements of Spark network cost. [PostgreSQL window functions](https://www.postgresql.org/docs/current/tutorial-window.html) grounds the distinction between grouped rows and window results. [MDN moveBefore](https://developer.mozilla.org/en-US/docs/Web/API/Element/moveBefore) documents state-preserving DOM moves and availability limits.
