import { describe, expect, it } from 'vitest';
import { TableTraceRenderer, resolveSvgScene, type TableTraceSvgSceneSpec } from '../src';

const spec: TableTraceSvgSceneSpec = {
  kind: 'table-trace',
  version: '1',
  id: 'a11y-trace',
  title: 'Trace focus hierarchy',
  views: [
    {
      id: 'before',
      role: 'input',
      table: {
        id: 'orders',
        columns: [{ id: 'status' }, { id: 'amount' }],
        rows: [{ id: 'o1', values: { status: 'late', amount: 80 } }],
      },
    },
    {
      id: 'after',
      role: 'output',
      table: {
        id: 'orders',
        columns: [{ id: 'status' }, { id: 'amount' }],
        rows: [{ id: 'o1', values: { status: 'late', amount: 80 } }],
      },
    },
  ],
  relations: [
    {
      id: 'keep',
      kind: 'map',
      from: [{ viewId: 'before', kind: 'row', rowId: 'o1' }],
      to: [{ viewId: 'after', kind: 'row', rowId: 'o1' }],
    },
  ],
};

describe('table trace accessibility hierarchy', () => {
  it('keeps structural view/row groups non-interactive while semantic leaf handles remain keyboard selectable', () => {
    const resolved = resolveSvgScene(spec, 0);
    if (resolved.rendererId !== 'table.trace') throw new Error('unexpected renderer');
    const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const renderer = new TableTraceRenderer();
    renderer.mount(host, resolved.input, { reducedMotion: true });

    expect(host.querySelector('[data-role="trace-view"]')?.getAttribute('role')).toBeNull();
    expect(host.querySelector('[data-role="trace-row"]')?.getAttribute('role')).toBeNull();
    expect(host.querySelector('[data-role="table-outline"]')?.getAttribute('role')).toBe('button');
    expect(host.querySelector('[data-role="row-outline"]')?.getAttribute('role')).toBe('button');
    expect(host.querySelector('[data-role="trace-column"]')?.getAttribute('role')).toBe('button');
    expect(host.querySelector('[data-role="trace-cell"]')?.getAttribute('role')).toBe('button');
    expect(host.querySelectorAll('[role="button"] [role="button"]')).toHaveLength(0);

    renderer.destroy();
  });
});
