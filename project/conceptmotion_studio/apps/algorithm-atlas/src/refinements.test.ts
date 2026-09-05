import { describe, expect, it } from 'vitest';
import { compileLoopFrame, compileWorkflowRunFrame, type LoopSceneSpec, type WorkflowSpec } from '@conceptmotion/core';
import { createDefaultRendererRegistry, recommendedSceneViewport, resolveSceneExplanation, resolveSvgScene, WorkflowRenderer, type SvgSceneSpec } from '@conceptmotion/svg';
import { migratedVisuals, refinedVisualIds, visualById } from '../../../content/visuals';
import { hasPracticeVisual, visualPracticeIds } from '../../../content/visuals/practice-availability';

const resolved = (id: string, frame: number) => resolveSceneExplanation(visualById(id)!.figure.spec as unknown as SvgSceneSpec | WorkflowSpec, frame)!;
const state = (id: string, frame: number, key: string) => resolved(id, frame).step.state!.find(value => value.key === key)!.value;
describe('V4 selective synchronized refinements', () => {
  it('keeps the metadata-only practice availability index exactly equal to real figure mappings', () => {
    expect(visualPracticeIds).toEqual([...new Set(migratedVisuals.flatMap(entry => entry.practiceIds))].sort());
    expect(visualPracticeIds.every(hasPracticeVisual)).toBe(true);
    expect(hasPracticeVisual('unknown')).toBe(false);
  });
  it('enriches exactly eleven of the thirty existing IDs', () => {
    expect(migratedVisuals).toHaveLength(30);
    expect(migratedVisuals.filter(entry => 'explanation' in (entry.figure.spec as object)).map(entry => entry.id).sort()).toEqual([...refinedVisualIds].sort());
    for (const id of refinedVisualIds) {
      const spec = visualById(id)!.figure.spec as unknown as SvgSceneSpec | WorkflowSpec;
      const count = spec.kind === 'workflow' ? spec.runs![0].frames.length : spec.kind === 'join' ? spec.revealCounts!.length : 'frames' in spec ? spec.frames!.length : 0;
      const steps = Array.from({ length: count }, (_, frame) => resolveSceneExplanation(spec, frame)!);
      expect(new Set(steps.map(value => value.step.id)).size).toBe(count);
      expect(steps.every(value => value.step.focus.codeRefs!.length > 0 && value.step.focus.entityIds!.length > 0 && value.step.state!.length > 0)).toBe(true);
      if (spec.kind === 'loop') for (let frame = 0; frame < count; frame++) expect(compileLoopFrame(spec, frame).frame.codeLineIds).toEqual(steps[frame].step.focus.codeRefs);
    }
  });
  it('keeps focus explanations faithful to the exact data and changing operation', () => {
    expect(state('sql-filter', 1, 'rows')).toBe(2);
    expect(state('sql-inner-join', 2, 'output')).toBe(3);
    expect(state('sql-left-join', 2, 'nulls')).toBe(1);
    expect(state('sql-grain', 1, 'output')).toBe(4);
    expect(state('sql-grain', 2, 'distinct')).toBe(3);
    expect(state('sql-grain', 2, 'output')).toBe(5);
    expect(state('sql-group', 0, 'total')).toBe(state('sql-group', 1, 'total'));
    expect(state('sql-window-rank', 0, 'rows')).toBe(state('sql-window-rank', 1, 'rows'));
    expect([0, 1, 2].map(frame => state('algorithm-sliding-window', frame, 'sum'))).toEqual([6, 6, 9]);
    expect([0, 1, 2].map(frame => state('algorithm-binary-search', frame, 'mid'))).toEqual([3, 5, 4]);
    expect([0, 1, 2].map(frame => state('algorithm-two-pointers', frame, 'sum'))).toEqual([12, 8, 9]);
    expect(state('algorithm-prefix-sum', 4, 'result')).toBe(6);
    expect(resolved('algorithm-prefix-sum', 4).step.focus.codeRefs).toEqual(['query']);
    for (const key of ['event', 'rows', 'value']) expect(state('de-retry', 1, key)).toBe(state('de-retry', 2, key));
    expect(state('de-retry', 2, 'attempt')).toBe(2);
    expect(state('de-retry', 2, 'publish')).toBe('waiting');
  });
  for (const id of refinedVisualIds) it(`${id} exports actual synchronized SVG states with stable objects`, () => {
    const spec = visualById(id)!.figure.spec as unknown as SvgSceneSpec | WorkflowSpec;
    const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const viewport = recommendedSceneViewport(spec, 'compact');
    expect(viewport.width).toBe(960); expect(viewport.height).toBeGreaterThanOrEqual(280);
    const getInput = (frame: number) => spec.kind === 'workflow' ? { spec, frame: compileWorkflowRunFrame(spec, spec.runs![0].id, frame), mode: 'run' as const } : resolveSvgScene(spec, frame).input;
    const renderer = spec.kind === 'workflow' ? new WorkflowRenderer() : createDefaultRendererRegistry().create(resolveSvgScene(spec).rendererId);
    renderer.mount(host, getInput(0) as never, { ...viewport, reducedMotion: true });
    const objects = [...host.querySelectorAll('[data-item-id], [data-role="source-row"], [data-node-id]')];
    const before = renderer.freeze();
    expect(before).toContain('data-explanation-step');
    renderer.update(getInput(1) as never);
    expect(renderer.freeze()).not.toBe(before);
    expect(host.querySelector('[data-role="explanation-code"][data-focused="true"]')).not.toBeNull();
    expect(host.querySelector('[data-role="explanation-state"][data-focused="true"]')).not.toBeNull();
    expect(host.querySelector('[data-explanation-focused="true"]')).not.toBeNull();
    for (const object of objects) expect(host.contains(object)).toBe(true);
    const after = renderer.freeze(); renderer.update(getInput(1) as never); expect(renderer.freeze()).toBe(after);
    if (spec.kind === 'loop') expect(host.querySelector('[data-role="item"] [data-role="label"]')!.textContent).toBe('Index 0');
    renderer.destroy(); expect(host.children).toHaveLength(0);
  });
});
