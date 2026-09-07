import { describe, expect, it, vi } from 'vitest';
import { TableTraceRenderer, recommendedSceneViewport, rendererIdForScene, resolveSvgScene, type TableTraceSvgSceneSpec } from '../src';

const spec: TableTraceSvgSceneSpec = {
  kind: 'table-trace',
  version: '1',
  id: 'filter-late',
  title: 'Filter late orders',
  description: 'Predicate cells explain which rows survive.',
  views: [
    {
      id: 'before', role: 'input', table: {
        id: 'orders',
        columns: [{ id: 'customer' }, { id: 'status' }],
        rows: [
          { id: 'o1', values: { customer: 'A', status: 'late' } },
          { id: 'o2', values: { customer: 'B', status: 'ok' } },
          { id: 'o3', values: { customer: 'C', status: 'late' } },
        ],
      },
    },
    {
      id: 'after', role: 'output', table: {
        id: 'orders',
        columns: [{ id: 'customer' }, { id: 'status' }],
        rows: [
          { id: 'o1', values: { customer: 'A', status: 'late' } },
          { id: 'o3', values: { customer: 'C', status: 'late' } },
        ],
      },
    },
  ],
  relations: [
    { id: 'predicate', kind: 'use', from: [
      { viewId: 'before', kind: 'cell', rowId: 'o1', columnId: 'status' },
      { viewId: 'before', kind: 'cell', rowId: 'o2', columnId: 'status' },
      { viewId: 'before', kind: 'cell', rowId: 'o3', columnId: 'status' },
    ] },
    { id: 'keep-o1', kind: 'map', from: [{ viewId: 'before', kind: 'row', rowId: 'o1' }], to: [{ viewId: 'after', kind: 'row', rowId: 'o1' }] },
    { id: 'drop-o2', kind: 'drop', from: [{ viewId: 'before', kind: 'row', rowId: 'o2' }] },
    { id: 'keep-o3', kind: 'map', from: [{ viewId: 'before', kind: 'row', rowId: 'o3' }], to: [{ viewId: 'after', kind: 'row', rowId: 'o3' }] },
  ],
  frames: [
    { id: 'predicate', caption: 'Read the predicate cells.', activeRelationIds: ['predicate'] },
    { id: 'result', caption: 'Carry matching rows and drop the rejected row.', activeRelationIds: ['keep-o1', 'drop-o2', 'keep-o3'] },
  ],
};

const aggregateSpec: TableTraceSvgSceneSpec = {
  kind: 'table-trace', version: '1', id: 'group-sum', title: 'Group and aggregate',
  views: [
    { id: 'detail', role: 'input', table: { id: 'orders', columns: [{ id: 'customer' }, { id: 'amount' }], rows: [
      { id: 'o1', values: { customer: 'A', amount: 80 } },
      { id: 'o2', values: { customer: 'A', amount: 70 } },
    ] } },
    { id: 'summary', role: 'output', table: { id: 'summary', columns: [{ id: 'customer' }, { id: 'total' }, { id: 'note' }], rows: [
      { id: 'A', values: { customer: 'A', total: 150, note: 'new' } },
    ] } },
  ],
  groups: [{ id: 'A', viewId: 'detail', rowIds: ['o1', 'o2'], label: 'customer = A' }],
  relations: [
    { id: 'group-a', kind: 'group', from: [{ viewId: 'detail', kind: 'row', rowId: 'o1' }, { viewId: 'detail', kind: 'row', rowId: 'o2' }], to: [{ viewId: 'detail', kind: 'group', groupId: 'A' }] },
    { id: 'sum-a', kind: 'derive', from: [{ viewId: 'detail', kind: 'cell', rowId: 'o1', columnId: 'amount' }, { viewId: 'detail', kind: 'cell', rowId: 'o2', columnId: 'amount' }], to: [{ viewId: 'summary', kind: 'cell', rowId: 'A', columnId: 'total' }] },
    { id: 'create-note', kind: 'create', to: [{ viewId: 'summary', kind: 'cell', rowId: 'A', columnId: 'note' }] },
  ],
  frames: [{ id: 'aggregate', activeRelationIds: ['group-a', 'sum-a', 'create-note'] }],
};

function installAnimateSpy() {
  const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'animate');
  const animate = vi.fn(() => ({ cancel: vi.fn() } as unknown as Animation));
  Object.defineProperty(Element.prototype, 'animate', { configurable: true, writable: true, value: animate });
  return {
    animate,
    restore: () => descriptor ? Object.defineProperty(Element.prototype, 'animate', descriptor) : delete (Element.prototype as { animate?: unknown }).animate,
  };
}

describe('table trace renderer', () => {
  it('resolves through the shared scene registry and keeps reduced-motion output static', () => {
    expect(rendererIdForScene(spec)).toBe('table.trace');
    const resolved = resolveSvgScene(spec, 1);
    expect(resolved.rendererId).toBe('table.trace');
    if (resolved.rendererId !== 'table.trace') throw new Error('unexpected renderer');
    expect(resolved.input.frameId).toBe('result');
    expect(resolved.input.activeRelationIds).toEqual(['keep-o1', 'drop-o2', 'keep-o3']);

    const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const renderer = new TableTraceRenderer();
    renderer.mount(host, resolved.input, { ...recommendedSceneViewport(spec, 'regular'), reducedMotion: true });

    expect(host.querySelectorAll('[data-role="trace-view"]')).toHaveLength(2);
    expect(host.querySelectorAll('[data-role="trace-edge"]')).toHaveLength(2);
    expect(host.querySelectorAll('[data-role="trace-motion-token"]')).toHaveLength(0);
    expect(host.querySelector('[data-role="table-trace"]')?.getAttribute('data-motion-enabled')).toBe('false');
    expect(host.querySelector('[data-trace-ref="trace:before:row:o2"]')?.getAttribute('data-trace-kinds')).toBe('drop');
    expect(host.querySelector('[data-trace-ref="trace:before:cell:o1:status"]')?.getAttribute('data-trace-kinds')).toBe('');
    expect(host.textContent).toContain('Filter late orders');
    renderer.destroy();
  });

  it('derives travel/fade choreography from active relations and strips transient travelers from frozen SVG', () => {
    const animation = installAnimateSpy();
    try {
      const resolved = resolveSvgScene(spec, 1);
      if (resolved.rendererId !== 'table.trace') throw new Error('unexpected renderer');
      const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const renderer = new TableTraceRenderer();
      renderer.mount(host, resolved.input, { reducedMotion: false, transitionDurationMs: 240 });

      expect(host.querySelectorAll('[data-motion="travel"]')).toHaveLength(2);
      expect(host.querySelectorAll('[data-motion="fade"]')).toHaveLength(1);
      expect(host.querySelector('[data-role="trace-motion-layer"]')?.getAttribute('data-cm-transient')).toBe('true');
      expect(animation.animate.mock.calls.length).toBeGreaterThanOrEqual(6);
      const frozen = renderer.freeze();
      expect(frozen).not.toContain('trace-motion-token');
      expect(frozen).not.toContain('data-cm-transient');
      expect(frozen).toContain('trace-edge');

      const calls = animation.animate.mock.calls.length;
      renderer.update(resolved.input, { selectedId: 'trace:before:row:o1' });
      expect(animation.animate.mock.calls).toHaveLength(calls);
      renderer.destroy();
    } finally {
      animation.restore();
    }
  });

  it('uses convergence/entry motion for grouping, derivation and creation without authored coordinates', () => {
    const animation = installAnimateSpy();
    try {
      const resolved = resolveSvgScene(aggregateSpec, 0);
      if (resolved.rendererId !== 'table.trace') throw new Error('unexpected renderer');
      const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const renderer = new TableTraceRenderer();
      renderer.mount(host, resolved.input, { reducedMotion: false });
      expect(host.querySelectorAll('[data-motion="converge"]')).toHaveLength(4);
      expect(host.querySelectorAll('[data-motion="enter"]')).toHaveLength(1);
      expect(host.querySelectorAll('[data-role="trace-edge"]')).toHaveLength(4);
      expect(animation.animate).toHaveBeenCalled();
      renderer.destroy();
    } finally {
      animation.restore();
    }
  });

  it('switches semantic relation focus without rebuilding table identity', () => {
    const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const renderer = new TableTraceRenderer();
    const first = resolveSvgScene(spec, 0);
    if (first.rendererId !== 'table.trace') throw new Error('unexpected renderer');
    renderer.mount(host, first.input, { reducedMotion: true });
    const stableRow = host.querySelector('[data-trace-ref="trace:before:row:o1"]');
    expect(host.querySelector('[data-trace-ref="trace:before:cell:o1:status"]')?.getAttribute('data-trace-kinds')).toBe('use');
    expect(host.querySelectorAll('[data-role="trace-edge"]')).toHaveLength(0);

    const second = resolveSvgScene(spec, 1);
    if (second.rendererId !== 'table.trace') throw new Error('unexpected renderer');
    renderer.update(second.input);
    expect(host.querySelector('[data-trace-ref="trace:before:row:o1"]')).toBe(stableRow);
    expect(host.querySelector('[data-trace-ref="trace:before:cell:o1:status"]')?.getAttribute('data-trace-kinds')).toBe('');
    expect(host.querySelectorAll('[data-role="trace-edge"]')).toHaveLength(2);
    renderer.destroy();
  });
});
