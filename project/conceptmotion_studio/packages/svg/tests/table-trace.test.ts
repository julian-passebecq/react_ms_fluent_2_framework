import { describe, expect, it } from 'vitest';
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
    { id: 'predicate', activeRelationIds: ['predicate'] },
    { id: 'result', activeRelationIds: ['keep-o1', 'drop-o2', 'keep-o3'] },
  ],
};

describe('table trace renderer', () => {
  it('resolves through the shared scene registry and exposes cell/row correspondence semantics', () => {
    expect(rendererIdForScene(spec)).toBe('table.trace');
    const resolved = resolveSvgScene(spec, 1);
    expect(resolved.rendererId).toBe('table.trace');
    if (resolved.rendererId !== 'table.trace') throw new Error('unexpected renderer');
    expect(resolved.input.activeRelationIds).toEqual(['keep-o1', 'drop-o2', 'keep-o3']);

    const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const renderer = new TableTraceRenderer();
    renderer.mount(host, resolved.input, { ...recommendedSceneViewport(spec, 'regular'), reducedMotion: true });

    expect(host.querySelectorAll('[data-role="trace-view"]')).toHaveLength(2);
    expect(host.querySelectorAll('[data-role="trace-edge"]')).toHaveLength(2);
    expect(host.querySelector('[data-trace-ref="trace:before:row:o2"]')?.getAttribute('data-trace-kinds')).toBe('drop');
    expect(host.querySelector('[data-trace-ref="trace:before:cell:o1:status"]')?.getAttribute('data-trace-kinds')).toBe('');
    expect(host.textContent).toContain('Filter late orders');
    renderer.destroy();
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
