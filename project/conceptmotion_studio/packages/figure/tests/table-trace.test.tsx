import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import type { FigureSpec } from '@datapass/content';
import type { TableTraceSvgSceneSpec } from '@conceptmotion/svg';
import { FigureView } from '../src/index.js';

const containers: HTMLDivElement[] = [];

afterEach(() => {
  containers.splice(0).forEach((element) => element.remove());
});

function host(): HTMLDivElement {
  const element = document.createElement('div');
  document.body.append(element);
  containers.push(element);
  return element;
}

const trace: TableTraceSvgSceneSpec = {
  kind: 'table-trace',
  version: '1',
  id: 'figure-filter-late',
  title: 'Filter late orders',
  views: [
    {
      id: 'before', role: 'input', table: {
        id: 'orders',
        columns: [{ id: 'status' }, { id: 'amount' }],
        rows: [
          { id: 'o1', values: { status: 'late', amount: 80 } },
          { id: 'o2', values: { status: 'ok', amount: 20 } },
        ],
      },
    },
    {
      id: 'after', role: 'output', table: {
        id: 'orders',
        columns: [{ id: 'status' }, { id: 'amount' }],
        rows: [{ id: 'o1', values: { status: 'late', amount: 80 } }],
      },
    },
  ],
  relations: [
    { id: 'predicate', kind: 'use', from: [
      { viewId: 'before', kind: 'cell', rowId: 'o1', columnId: 'status' },
      { viewId: 'before', kind: 'cell', rowId: 'o2', columnId: 'status' },
    ] },
    { id: 'keep', kind: 'map', from: [{ viewId: 'before', kind: 'row', rowId: 'o1' }], to: [{ viewId: 'after', kind: 'row', rowId: 'o1' }] },
    { id: 'drop', kind: 'drop', from: [{ viewId: 'before', kind: 'row', rowId: 'o2' }] },
  ],
  frames: [
    { id: 'read-predicate', activeRelationIds: ['predicate'] },
    { id: 'emit-result', activeRelationIds: ['keep', 'drop'] },
  ],
};

const figure: FigureSpec = {
  id: 'figure.table-trace.filter',
  kind: 'concept',
  rendererId: 'table.trace',
  title: 'Filter late orders',
  spec: trace as unknown as FigureSpec['spec'],
  fallbackText: 'The status column is tested; o1 survives and o2 is removed.',
  staticState: 1,
  reducedMotionState: 1,
  sourceIds: ['source.table-trace.fixture'],
};

describe('FigureView table trace integration', () => {
  it('renders the semantic trace through the shared Figure adapter', async () => {
    const element = host();
    const root = createRoot(element);
    await act(async () => root.render(<FigureView figure={figure} reducedMotion presentationSize="regular" />));
    expect(element.querySelector('figure')?.getAttribute('data-figure-renderer')).toBe('table.trace');
    expect(element.querySelector('[data-role="table-trace"]')).not.toBeNull();
    expect(element.querySelector('[data-trace-ref="trace:before:row:o2"]')?.getAttribute('data-trace-kinds')).toBe('drop');
    expect(element.querySelectorAll('[data-role="trace-edge"]')).toHaveLength(1);
    expect(element.textContent).toContain('Source IDs: source.table-trace.fixture');
    await act(async () => root.unmount());
  });

  it('can show the predicate step without replacing Figure chrome', async () => {
    const element = host();
    const root = createRoot(element);
    await act(async () => root.render(<FigureView figure={figure} frameIndex={0} reducedMotion />));
    const figureNode = element.querySelector('figure');
    expect(element.querySelector('[data-trace-ref="trace:before:cell:o1:status"]')?.getAttribute('data-trace-kinds')).toBe('use');
    await act(async () => root.render(<FigureView figure={figure} frameIndex={1} reducedMotion />));
    expect(element.querySelector('figure')).toBe(figureNode);
    expect(element.querySelector('[data-trace-ref="trace:before:row:o2"]')?.getAttribute('data-trace-kinds')).toBe('drop');
    await act(async () => root.unmount());
  });
});
