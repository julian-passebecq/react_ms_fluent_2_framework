import { describe, expect, it } from 'vitest';
import { CollectionRenderer, WorkflowRenderer, createDefaultRendererRegistry, recommendedSceneViewport, resolveSvgScene, type SvgSceneSpec, type TableSvgSceneSpec } from '../../packages/svg/src';
import { compileCollectionFrame, compileWorkflowRunFrame, type CollectionFlowSpec, type WorkflowSpec } from '@conceptmotion/core';
import { visualExplanationFigure, visualExplanationFigures } from '../../content/visuals/explanation-examples';

describe('production explanatory renderers', () => {
  it('keeps full workflow attempt state on a separate line from the task type', () => {
    const spec = visualExplanationFigure('de-backfill').spec as unknown as WorkflowSpec;
    const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const renderer = new WorkflowRenderer();
    const input = (index: number) => ({ spec, frame: compileWorkflowRunFrame(spec, spec.runs![0].id, index) });
    renderer.mount(host, input(2), { ...recommendedSceneViewport(spec, 'compact'), reducedMotion: true });
    expect(host.querySelector('[data-role="workflow"]')!.getAttribute('data-layout-provider')).toBe('contract');
    expect(host.querySelector('[data-role="breadcrumb"]')!.closest('[data-role="workflow"]')).toBeNull();
    expect(host.querySelector('[data-node-id="day1"]')!.getAttribute('transform')).not.toBe(host.querySelector('[data-node-id="day2"]')!.getAttribute('transform'));
    const task = host.querySelector('[data-node-id="day2"]')!;
    const status = task.querySelector('[data-role="status"]')!;
    expect(status.textContent).toContain('RETRYING · ATTEMPT 2');
    expect(status.getAttribute('y')).toBe('61');
    expect(task.querySelector('[data-role="kind"]')!.getAttribute('y')).toBe('47');
    renderer.update(input(0));
    expect(status.getAttribute('y')).toBe('47');
    expect(host.querySelectorAll('[data-role="breadcrumb"]')).toHaveLength(1);
    const exported = renderer.freeze();
    renderer.update(input(0));
    expect(renderer.freeze()).toBe(exported);
    renderer.destroy();
  });
  it('retains the same DOM item through movement, aggregation and reverse stepping', () => {
    const spec = visualExplanationFigure('sql-group').spec as unknown as CollectionFlowSpec;
    const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const renderer = new CollectionRenderer();
    renderer.mount(host, { spec, frame: compileCollectionFrame(spec, 0) }, { ...recommendedSceneViewport(spec, 'compact'), reducedMotion: false });
    const item = host.querySelector('[data-item-id="o1"]')!;
    const before = item.getAttribute('transform');
    renderer.update({ spec, frame: compileCollectionFrame(spec, 1) });
    expect(host.querySelector('[data-item-id="o1"]')).toBe(item);
    expect(item.getAttribute('transform')).not.toBe(before);
    expect(item.getAttribute('data-container-id')).toBe('group-A');
    expect(item.getAttribute('style')).toContain('transition: transform');
    renderer.update({ spec, frame: compileCollectionFrame(spec, 2) }, { reducedMotion: true });
    expect(item.getAttribute('data-collapsed-into')).toBe('total-A');
    expect(host.querySelector('[data-summary-id="total-A"]')?.textContent).toContain('SUM = 150');
    expect(host.querySelector('[data-summary-id="total-A"]')?.textContent).toContain('o1, o2');
    expect(renderer.freeze()).toBe(renderer.freeze());
    expect(renderer.freeze()).not.toContain('transition:');
    renderer.update({ spec, frame: compileCollectionFrame(spec, 0) });
    expect(host.querySelector('[data-item-id="o1"]')).toBe(item);
    expect(item.getAttribute('transform')).toBe(before);
    expect(item.getAttribute('aria-hidden')).toBeNull();
    expect(host.querySelector('[data-summary-id]')).toBeNull();
    renderer.destroy();
  });
  it('renders and deterministically exports every step of every non-workflow example', () => {
    for (const figure of visualExplanationFigures.filter(f => !f.rendererId.startsWith('workflow'))) {
      const spec = figure.spec as unknown as SvgSceneSpec;
      const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const count = 'revealCounts' in spec ? spec.revealCounts!.length : 'frames' in spec ? spec.frames!.length : 1;
      const renderer = createDefaultRendererRegistry().create<unknown>(figure.rendererId);
      renderer.mount(host, resolveSvgScene(spec, 0).input, { ...recommendedSceneViewport(spec, 'compact'), reducedMotion: true });
      for (let i = 0; i < count; i++) {
        renderer.update(resolveSvgScene(spec, i).input);
        expect(host.querySelector('[data-role="explanation"]')?.getAttribute('data-explanation-step'), `${figure.id}:${i}`).toBeTruthy();
        expect(renderer.freeze()).toBe(renderer.freeze());
      }
      renderer.destroy();
    }
  });
  it('moves the window overlay while retaining table row identity and rejects misaligned overlays', () => {
    const spec = visualExplanationFigure('sql-rows-between').spec as unknown as TableSvgSceneSpec;
    const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const renderer = createDefaultRendererRegistry().create<unknown>('table.transform');
    renderer.mount(host, resolveSvgScene(spec, 1).input, { reducedMotion: true });
    const row = host.querySelector('[data-row-id="r2"]');
    const initial = host.querySelector('[data-role="window-frame"]')!.getAttribute('transform');
    renderer.update(resolveSvgScene(spec, 2).input);
    expect(host.querySelector('[data-row-id="r2"]')).toBe(row);
    expect(host.querySelector('[data-role="window-frame"]')!.getAttribute('transform')).not.toBe(initial);
    expect(host.querySelector('[data-current-row="true"]')?.getAttribute('data-row-id')).toBe('r3');
    expect(host.querySelectorAll('[data-window-member="true"]')).toHaveLength(2);
    expect(() => resolveSvgScene({ ...spec, windowFrames: [] })).toThrow('align');
    renderer.update(resolveSvgScene({ ...spec, windowFrames: undefined }, 0).input);
    expect(host.querySelector('[data-role="window-frame"]')).toBeNull();
    renderer.destroy();
  });
});
