import { describe, expect, it } from 'vitest';
import { compileLoopFrame, compileRegressionFrame, compileTableJoin, compileWorkflowRun, validateDiagramSpec, validateWorkflowSpec, type CompiledTableState, type DiagramSpec, type LoopSceneSpec, type RegressionSceneSpec, type TableJoinSpec, type WorkflowSpec } from '@conceptmotion/core';
import { validateContentCatalog } from '@datapass/content';
import { migratedFigures, migratedVisuals, visualById, visualSources } from './index';

const spec = <T>(id: string) => visualById(id)!.figure.spec as unknown as T;
const frames = (id: string) => spec<{ frames: CompiledTableState[] }>(id).frames;
const loop = (id: string) => spec<LoopSceneSpec>(id);
describe('thirty source-pinned semantic migrations', () => {
  it('validates the shared source/figure catalog and source identities', () => {
    expect(migratedVisuals).toHaveLength(30);
    expect(new Set(migratedVisuals.map(v => v.id)).size).toBe(30);
    const validation = validateContentCatalog({ version: '2', sources: visualSources, figures: migratedFigures });
    expect(validation.issues).toEqual([]);
    for (const entry of migratedVisuals) { expect(entry.source.id).toMatch(/^source:visual-(practice|ml)-v3$/); expect(entry.captions.length).toBeGreaterThan(1); expect(entry.invariant.length).toBeGreaterThan(30); }
    expect(JSON.stringify({ migratedVisuals, visualSources })).not.toMatch(/github\.com|julian-passebecq|a3bff6aeeb89af5e379b4d8c168b3b1f581fe026/);
    expect(visualSources.every(source => !source.url)).toBe(true);
  });
  for (const entry of migratedVisuals) it(`${entry.id}: every frame compiles with stable identity`, () => {
    const scene = entry.figure.spec as unknown as { kind: string; frames: unknown[]; join: TableJoinSpec };
    if (scene.kind === 'loop') {
      const value = scene as unknown as LoopSceneSpec;
      const frames = value.frames.map((_, i) => compileLoopFrame(value, i));
      const ids = frames[0].itemOrder.slice().sort();
      for (const frame of frames) expect(frame.itemOrder.slice().sort()).toEqual(ids);
    } else if (scene.kind === 'regression') {
      const value = scene as unknown as RegressionSceneSpec;
      for (let i = 0; i < value.frames.length; i++) expect(Number.isFinite(compileRegressionFrame(value, i).mse)).toBe(true);
    } else if (scene.kind === 'diagram') expect(validateDiagramSpec(scene as unknown as DiagramSpec).valid).toBe(true);
    else if (scene.kind === 'workflow') {
      const value = scene as unknown as WorkflowSpec;
      expect(validateWorkflowSpec(value).valid).toBe(true); expect(compileWorkflowRun(value, value.runs![0].id)).toHaveLength(value.runs![0].frames.length);
    } else if (scene.kind === 'join') expect(compileTableJoin(scene.join).rows.length).toBeGreaterThan(0);
    else for (const value of scene.frames as CompiledTableState[]) { expect(new Set(value.rowOrder).size).toBe(value.rowOrder.length); expect(value.rowOrder.every(id => value.rows.some(row => row.id === id))).toBe(true); }
  });
  it('SQL filter/group/window/join/grain/CDC teach different exact outcomes', () => {
    expect(frames('sql-filter')[1].visibleRowIds).toEqual(['o1', 'o3']);
    expect(frames('sql-group')[1].rows.map(r => r.values.total)).toEqual([150, 80, 20]);
    expect(frames('sql-window-rank')[1].rowOrder).toEqual(['a-new', 'a-old', 'b-new', 'b-old']);
    expect(frames('sql-latest-row')[2].visibleRowIds).toEqual(['a-new', 'b-new']);
    expect(frames('sql-qualify')[2].visibleRowIds).toEqual(['a-new', 'b-new']);
    for (const [id, count] of [['sql-inner-join', 3], ['sql-left-join', 4], ['sql-full-join', 5], ['sql-grain', 5]] as const) expect(compileTableJoin(spec<{ join: TableJoinSpec }>(id).join).rows).toHaveLength(count);
    const history = frames('sql-cdc')[1].rows; expect(history.filter(r => r.values.current)).toHaveLength(1); expect(history[0].values.to).toBe(history[1].values.from); expect(history[0].id).toBe(frames('sql-cdc')[0].rows[0].id);
  });
  it('algorithm transitions satisfy numerical and identity invariants', () => {
    expect(loop('algorithm-scan').frames.at(-1)!.variables!.total).toBe(19);
    const binary = loop('algorithm-binary-search'); for (const f of binary.frames) { const lo = Number(f.variables!.lo), hi = Number(f.variables!.hi); expect(lo).toBeLessThanOrEqual(4); expect(hi).toBeGreaterThanOrEqual(4); }
    loop('algorithm-frequency').frames.forEach((f, i) => expect(Object.values(f.variables!).reduce<number>((sum, n) => sum + Number(n), 0)).toBe(i + 1));
    const pointers = loop('algorithm-two-pointers'); for (const f of pointers.frames) expect(Number(pointers.items[Number(f.variables!.left)].value) + Number(pointers.items[Number(f.variables!.right)].value)).toBe(f.variables!.sum);
    const window = loop('algorithm-sliding-window'); for (const f of window.frames) expect(f.activeItemIds!.reduce((sum, id) => sum + Number(window.items.find(item => item.id === id)!.value), 0)).toBe(f.variables!.sum);
    expect(loop('algorithm-prefix-sum').frames.at(-1)!.variables!.range).toBe(6);
    expect(loop('algorithm-stable-sort').frames.at(-1)!.order).toEqual(['i1', 'i3', 'i0', 'i2']);
    expect(loop('algorithm-top-k').frames.at(-1)!.variables!.heap).toBe('8,9');
    expect(loop('algorithm-interval-merge').frames.at(-1)!.variables).toEqual({ closed: '[1,5]', current: '[8,9]' });
    expect(loop('algorithm-stack-queue').frames.at(-1)!.variables).toEqual({ stack: 'A,B', queue: 'B,C' });
  });
  it('batching, pruning, retry and regression preserve their defining invariants', () => {
    const batch = loop('de-batching'); expect(batch.frames.flatMap(f => f.activeItemIds)).toEqual(batch.items.map(i => i.id)); expect(batch.frames.every(f => f.activeItemIds!.length <= 3)).toBe(true);
    expect(frames('de-partition-pruning')[1].visibleRowIds).toEqual(['p2']);
    const retry = spec<WorkflowSpec>('de-retry'); const run = compileWorkflowRun(retry, retry.runs![0].id); expect(run[2].states.publish.status).toBe('pending'); expect(run.at(-1)!.states.upsert.attempt).toBe(2);
    const regression = spec<RegressionSceneSpec>('ml-regression'); const errors = regression.frames.map((_, i) => compileRegressionFrame(regression, i).mse); expect(errors[0]).toBeGreaterThan(errors[1]); expect(errors[1]).toBeGreaterThan(errors[2]); expect(errors[2]).toBe(0);
  });
  it('graph explanations trace distinct causal paths rather than renamed frames', () => {
    type Graph = DiagramSpec & { frames: { activeNodeIds: string[]; activeEdgeIds?: string[]; failedNodeIds?: string[] }[] };
    const bfs = spec<Graph>('algorithm-bfs');
    const distance = new Map<string, number>([['n0', 0]]);
    for (const frame of bfs.frames) for (const id of frame.activeNodeIds) for (const edge of bfs.edges.filter(e => e.from.nodeId === id)) distance.set(edge.to.nodeId, distance.get(id)! + 1);
    bfs.frames.forEach((frame, i) => frame.activeNodeIds.forEach(id => expect(distance.get(id)).toBe(i)));
    const topo = spec<Graph>('algorithm-topological'); expect(topo.frames[1].activeNodeIds).toEqual(['n1', 'n2']); expect(topo.frames[2].activeNodeIds).not.toContain('n3'); expect(topo.frames[3].activeEdgeIds).toEqual(['e2', 'e3']);
    const medallion = spec<Graph>('de-medallion'); expect(medallion.nodes.map(n => n.label)).toEqual(['Bronze / raw', 'Silver / valid', 'Gold / business']);
    const pure = spec<Graph>('de-pure-transform'); expect(pure.frames.map(f => f.activeNodeIds[0])).toEqual(['n0', 'n1', 'n2', 'n3']); expect(pure.edges).toHaveLength(3);
    const tree = spec<Graph>('ml-decision-tree'); expect(tree.frames.at(-1)!.activeNodeIds).toEqual(['n3']); expect(tree.frames.at(-1)!.activeEdgeIds).toEqual(['e0', 'e2']);
    const leakage = spec<Graph>('ml-leakage'); expect(leakage.frames[0].failedNodeIds).toEqual(['n3']); expect(leakage.frames.slice(1).every(f => !f.activeEdgeIds?.includes('e5'))).toBe(true);
  });
});
