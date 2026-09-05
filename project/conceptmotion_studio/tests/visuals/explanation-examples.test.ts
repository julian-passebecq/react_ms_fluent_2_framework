import { describe, expect, it } from 'vitest';
import { compileCollectionFrame, compileLoopFrame, compileTableJoin, compileWorkflowRunFrame, validateWorkflowSpec, type CollectionFlowSpec, type LoopSceneSpec, type WorkflowSpec } from '@conceptmotion/core';
import { validateFigureSpec } from '@datapass/content';
import { recommendedSceneViewport, resolveSvgScene, resolveSceneExplanation, type SvgSceneSpec, type JoinSvgSceneSpec, type TableSvgSceneSpec } from '../../packages/svg/src';
import { figureStepCount } from '../../packages/figure/src';
import { visualExplanationFigure, visualExplanationFigures } from '../../content/visuals/explanation-examples';
import { validateAuthoredSpec } from '../../scripts/validate-specs';

describe('approved production teaching fixtures', () => {
  it('validates all envelopes, editor schemas and every semantic frame using production compilers', () => {
    expect(visualExplanationFigures).toHaveLength(17);
    expect(() => visualExplanationFigure('missing')).toThrow();
    for (const figure of visualExplanationFigures) {
      expect(validateFigureSpec(figure).valid, figure.id).toBe(true);
      expect(validateAuthoredSpec('figure', figure).valid, figure.id).toBe(true);
      const spec = figure.spec as unknown as SvgSceneSpec | WorkflowSpec;
      expect(JSON.stringify(spec)).not.toMatch(/"(?:x|y|durationMs|selector|path)":/);
      for (let index = 0; index < figureStepCount(figure); index++) {
        if (spec.kind === 'workflow') {
          expect(validateWorkflowSpec(spec).valid).toBe(true);
          expect(compileWorkflowRunFrame(spec, spec.runs![0].id, index).index).toBe(index);
        } else expect(resolveSvgScene(spec, index).rendererId).toBe(figure.rendererId);
        expect(resolveSceneExplanation(spec, index)?.step.id).toBeTruthy();
      }
      expect(recommendedSceneViewport(spec, 'compact').width).toBe(960);
    }
  });
  it('uses pair-by-pair source identity, NULL extension and 2×2 cardinality', () => {
    for (const id of ['sql-inner-join', 'sql-left-join', 'sql-grain']) {
      const scene = visualExplanationFigure(id).spec as unknown as JoinSvgSceneSpec;
      const result = compileTableJoin(scene.join);
      expect(scene.explanation!.codeLines!.find(line => line.id === 'match')!.text).toContain(id === 'sql-left-join' ? 'LEFT JOIN customers' : 'INNER JOIN customers');
      expect(scene.revealCounts).toEqual([0, ...result.rows.flatMap((_, i) => [i, i + 1])]);
      result.rows.forEach((r, i) => expect(scene.explanation!.steps[2 * i + 2].focus.entityIds).toContain(r.id));
      if (id === 'sql-left-join') expect(result.rows.at(-1)).toMatchObject({ leftRowId: 'o4', rightRowId: null });
      if (id === 'sql-grain') expect(result.rows.filter(r => ['o1', 'o2'].includes(r.leftRowId!))).toHaveLength(4);
    }
  });
  it('sorts correctly through real swap and shift frames with stable equal-key identity', () => {
    for (const id of ['algorithm-bubble-sort', 'algorithm-stable-sort']) {
      const scene = visualExplanationFigure(id).spec as unknown as LoopSceneSpec;
      const frames = scene.frames.map((_, i) => compileLoopFrame(scene, i));
      const value = (id: string) => String(scene.items.find(item => item.id === id)!.value);
      expect(frames.at(-1)!.itemOrder.map(value)).toEqual(id === 'algorithm-bubble-sort' ? ['1', '2', '4', '5'] : ['1', '2', '3a', '3b']);
      for (const [i, f] of frames.entries()) {
        expect(new Set(f.itemOrder).size).toBe(scene.items.length);
        const operation = f.frame.operation;
        if (operation === 'SWAP' || operation === 'SHIFT') expect(f.itemOrder).not.toEqual(frames[i - 1].itemOrder);
        expect(scene.explanation!.steps[i].focus.codeRefs).toEqual(f.frame.codeLineIds);
      }
    }
  });
  it('changes grouping grain, preserves window grain and computes moving-frame sums', () => {
    const group = visualExplanationFigure('sql-group').spec as unknown as CollectionFlowSpec;
    expect(compileCollectionFrame(group, 1).transition.movingIds).toHaveLength(4);
    expect(group.frames[2].summaries?.map(s => s.sourceItemIds)).toEqual([['o1', 'o2'], ['o3'], ['o4']]);
    const rank = visualExplanationFigure('sql-window-rank').spec as unknown as CollectionFlowSpec;
    expect(compileCollectionFrame(rank, 1).loads).toEqual({ input: 0, 'partition-A': 2, 'partition-B': 2 });
    expect(rank.frames[2].placements.every(p => p.annotation)).toBe(true);
    expect(compileCollectionFrame(rank, 2).snapshot.entities.filter(e => e.kind === 'mark' && e.visible)).toHaveLength(4);
    const window = visualExplanationFigure('sql-rows-between').spec as unknown as TableSvgSceneSpec;
    expect(window.explanation!.steps.map(s => s.state!.find(v => v.key === 'sum')!.value)).toEqual([10, 30, 50, 70, 90]);
    expect(window.windowFrames!.map(w => w.memberRowIds)).toEqual([['r1'], ['r1', 'r2'], ['r2', 'r3'], ['r3', 'r4'], ['r4', 'r5']]);
  });
  it('proves cross-domain container reuse, conservation, skew and fewer moved coalesce items', () => {
    for (const id of ['de-hash', 'de-shuffle', 'de-skew', 'de-repartition', 'de-coalesce', 'algorithm-dfs-worklist']) {
      const scene = visualExplanationFigure(id).spec as unknown as CollectionFlowSpec;
      for (let i = 0; i < scene.frames.length; i++) expect(Object.values(compileCollectionFrame(scene, i).loads).reduce((a, b) => a + b, 0)).toBe(scene.items.length);
      const final = compileCollectionFrame(scene, scene.frames.length - 1);
      if (id === 'de-skew') expect(final.loads).toMatchObject({ reduce0: 5, reduce1: 1 });
      if (id === 'de-coalesce') {
        const moved = new Set(scene.frames.flatMap((_, i) => compileCollectionFrame(scene, i).transition.movingIds));
        expect([...moved].sort()).toEqual(['r5', 'r6']);
        expect(final.loads).toEqual({ p0: 4, p1: 2, p2: 0 });
        const repartition = visualExplanationFigure('de-repartition').spec as unknown as CollectionFlowSpec;
        expect(repartition.frames[0].placements).toEqual(scene.frames[0].placements);
        expect(compileCollectionFrame(repartition, repartition.frames.length - 1).loads).toEqual({ p0: 3, p1: 3, p2: 0 });
      }
      if (id === 'algorithm-dfs-worklist') expect(scene.frames.at(-1)!.placements.map(p => p.itemId)).toEqual(['A', 'C', 'B']);
    }
  });
  it('retains retry and backfill fan-out/fan-in on WorkflowSpec', () => {
    const scene = visualExplanationFigure('de-backfill').spec as unknown as WorkflowSpec;
    const at = (i: number) => compileWorkflowRunFrame(scene, scene.runs![0].id, i).states;
    expect(at(1)).toMatchObject({ day1: { status: 'running' }, day2: { status: 'running' }, publish: { status: 'pending' } });
    expect(at(2)).toMatchObject({ day1: { status: 'success' }, day2: { status: 'retrying', attempt: 2 }, publish: { status: 'pending' } });
    expect(at(3)).toMatchObject({ day1: { status: 'success' }, day2: { status: 'success', attempt: 2 }, publish: { status: 'running' } });
    expect(at(4).publish.status).toBe('success');
  });
});
