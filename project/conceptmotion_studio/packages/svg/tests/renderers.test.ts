import {
  compileLoopFrame,
  compileRegressionFrame,
  compileTableFilter,
  compileTableJoin,
  compileTableSort,
  compileTableState,
  compileWorkflowRunFrame,
  getLineagePortId,
  type LineageSpec,
  type LoopSceneSpec,
  type RegressionSceneSpec,
  type TableData,
  type TableJoinSpec,
  type WorkflowSpec,
} from '@conceptmotion/core';
import { describe, expect, it, vi } from 'vitest';

import {
  createDefaultRendererRegistry,
  createRendererRegistry,
  DiagramRenderer,
  JoinRenderer,
  LineageRenderer,
  LoopRenderer,
  RegressionRenderer,
  TableRenderer,
  WorkflowRenderer,
  type RendererRegistration,
  type SvgRenderer,
} from '../src/index.js';

function svg(): SVGSVGElement {
  return document.createElementNS('http://www.w3.org/2000/svg', 'svg');
}

const orders: TableData = {
  id: 'orders',
  columns: [
    { id: 'order', label: 'Order' },
    { id: 'amount', label: 'Amount' },
    { id: 'late', label: 'Late' },
  ],
  rows: [
    { id: 'row-a', values: { order: 'A', amount: 80, late: false } },
    { id: 'row-b', values: { order: 'B', amount: 20, late: true } },
    { id: 'row-c', values: { order: 'C', amount: 50, late: true } },
  ],
};

describe('renderer registry and lifecycle', () => {
  it('registers families explicitly and permits external family extension', () => {
    const registry = createDefaultRendererRegistry();
    expect(registry.ids()).toEqual([
      'algorithm.loop',
      'diagram.flow',
      'lineage.model',
      'statistics.regression',
      'table.join',
      'table.transform',
      'workflow.topology',
    ]);

    const destroy = vi.fn();
    const extension: RendererRegistration<string> = {
      id: 'future.chart',
      family: 'chart',
      create: () => ({ mount: vi.fn(), update: vi.fn(), destroy, freeze: () => '<svg></svg>' }),
    };
    registry.register(extension);
    expect(registry.ids('chart')).toEqual(['future.chart']);
    expect(registry.create<string>('future.chart')).toBeDefined();
  });

  it('rejects duplicate registration IDs with a useful error', () => {
    const registry = createRendererRegistry();
    const registration: RendererRegistration<unknown> = {
      id: 'sample.renderer',
      family: 'sample',
      create: () => ({ mount() {}, update() {}, destroy() {}, freeze: () => '<svg></svg>' }),
    };
    registry.register(registration);
    expect(() => registry.register(registration)).toThrow('already registered');
  });
});

describe('table and join object continuity', () => {
  it('keeps the same keyed row elements through filter and sort updates', () => {
    const host = svg();
    const renderer = new TableRenderer();
    renderer.mount(host, { state: compileTableState(orders), title: 'Orders' }, { reducedMotion: true });
    const before = new Map(
      [...host.querySelectorAll<SVGGElement>('g[data-role="row"]')].map((row) => [row.dataset.rowId!, row]),
    );

    const filtered = compileTableFilter(orders, { columnId: 'late', operator: 'eq', value: true });
    renderer.update({ state: filtered, title: 'Late orders' }, { reducedMotion: true });
    expect(host.querySelector('g[data-row-id="row-a"]')?.getAttribute('data-visible')).toBe('false');
    expect(host.querySelector('g[data-row-id="row-b"]')).toBe(before.get('row-b'));
    const filteredTransform = host.querySelector('g[data-row-id="row-b"]')?.getAttribute('transform');

    const sorted = compileTableSort(orders, [{ columnId: 'amount', direction: 'desc' }]);
    renderer.update({ state: sorted }, { reducedMotion: true });
    expect(host.querySelector('g[data-row-id="row-b"]')).toBe(before.get('row-b'));
    expect(host.querySelector('g[data-row-id="row-b"]')?.getAttribute('transform')).not.toBe(filteredTransform);
    expect(host.querySelector('g[data-row-id="row-a"]')?.textContent).toContain('#1 kept');

    const frozen = renderer.freeze();
    expect(renderer.freeze()).toBe(frozen);
    expect(frozen).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(frozen).not.toContain('transition:');
    renderer.destroy();
    expect(host.querySelector('[data-cm-root]')).toBeNull();
  });

  it('reveals fan-out rows without replacing prior result identity', () => {
    const join: TableJoinSpec = {
      id: 'customer-orders',
      joinType: 'left',
      left: {
        id: 'customers',
        columns: [{ id: 'id' }, { id: 'name' }],
        rows: [
          { id: 'customer-1', values: { id: 1, name: 'Ava' } },
          { id: 'customer-2', values: { id: 2, name: 'Bo' } },
        ],
      },
      right: {
        id: 'orders',
        columns: [{ id: 'customer_id' }, { id: 'amount' }],
        rows: [
          { id: 'order-1', values: { customer_id: 1, amount: 10 } },
          { id: 'order-2', values: { customer_id: 1, amount: 20 } },
        ],
      },
      leftKey: 'id',
      rightKey: 'customer_id',
    };
    const result = compileTableJoin(join);
    expect(result.rows).toHaveLength(3);
    const host = svg();
    const renderer = new JoinRenderer();
    renderer.mount(host, { spec: join, result, revealCount: 1 }, { reducedMotion: true });
    const first = host.querySelector('g[data-role="result-row"]');
    renderer.update({ spec: join, result }, { reducedMotion: true });
    expect(host.querySelectorAll('g[data-role="result-row"]')).toHaveLength(3);
    expect(host.querySelector('g[data-role="result-row"]')).toBe(first);
    expect(host.querySelectorAll('path[data-role="lineage"]')).toHaveLength(5);
    expect(host.textContent).toContain('NULL-EXTENDED');
  });
});

describe('algorithm and statistical renderers', () => {
  it('moves the same loop item while synchronizing pointer, code, and variables', () => {
    const spec: LoopSceneSpec = {
      kind: 'loop',
      version: '1.1',
      id: 'sum-loop',
      title: 'Accumulate values',
      items: [
        { id: 'a', value: 2 },
        { id: 'b', value: 4 },
      ],
      codeLines: [
        { id: 'line-loop', text: 'for value in values:' },
        { id: 'line-add', text: '  total += value' },
      ],
      frames: [
        { id: 'f0', iteration: 0, pointerItemId: 'a', activeItemIds: ['a'], variables: { total: 0 }, codeLineIds: ['line-loop'], operation: 'iterate', caption: 'Read first value.' },
        { id: 'f1', iteration: 1, pointerItemId: 'b', activeItemIds: ['b'], doneItemIds: ['a'], order: ['b', 'a'], variables: { total: 2 }, codeLineIds: ['line-add'], operation: 'accumulate', caption: 'Add the value.' },
      ],
    };
    const host = svg();
    const renderer = new LoopRenderer();
    renderer.mount(host, { spec, frame: compileLoopFrame(spec, 0) }, { reducedMotion: true });
    const itemB = host.querySelector('g[data-item-id="b"]');
    renderer.update({ spec, frame: compileLoopFrame(spec, 1) }, { reducedMotion: true });
    expect(host.querySelector('g[data-item-id="b"]')).toBe(itemB);
    expect(itemB?.getAttribute('data-state')).toBe('pointer');
    expect(host.querySelector('g[data-line-id="line-add"]')?.getAttribute('data-focused')).toBe('true');
    expect(host.textContent).toContain('total = 2');
  });

  it('updates a regression parameter while retaining point and line nodes', () => {
    const spec: RegressionSceneSpec = {
      kind: 'regression',
      version: '1.1',
      id: 'regression-demo',
      title: 'Residuals respond to slope',
      points: [
        { id: 'p1', x: 0, y: 1 },
        { id: 'p2', x: 1, y: 3 },
        { id: 'p3', x: 2, y: 5 },
      ],
      frames: [
        { id: 'flat', slope: 0, intercept: 1, operation: 'adjust', caption: 'Flat line.' },
        { id: 'fit', slope: 2, intercept: 1, operation: 'adjust', caption: 'Exact fit.' },
      ],
    };
    const host = svg();
    const renderer = new RegressionRenderer();
    renderer.mount(host, { spec, frame: compileRegressionFrame(spec, 0) }, { reducedMotion: true });
    const point = host.querySelector('g[data-point-id="p1"]');
    const fitLine = host.querySelector('line[data-role="fit-line"]');
    renderer.update({ spec, frame: compileRegressionFrame(spec, 1) }, { reducedMotion: true });
    expect(host.querySelector('g[data-point-id="p1"]')).toBe(point);
    expect(host.querySelector('line[data-role="fit-line"]')).toBe(fitLine);
    expect(host.textContent).toContain('MSE 0');
  });
});

describe('diagram, lineage, and workflow semantics', () => {
  it('renders reusable nodes, ports, routed semantic flows, and selectable keyboard targets', () => {
    const host = svg();
    const onSelect = vi.fn();
    const renderer = new DiagramRenderer();
    renderer.mount(
      host,
      {
        spec: {
          kind: 'diagram',
          version: '1.1',
          id: 'medallion',
          title: 'Medallion pipeline',
          nodes: [
            { id: 'source', label: 'Source', kind: 'source', ports: [{ id: 'out', side: 'right' }] },
            { id: 'bronze', label: 'Bronze', kind: 'database', ports: [{ id: 'in', side: 'left' }] },
          ],
          edges: [
            { id: 'events', from: { nodeId: 'source', portId: 'out' }, to: { nodeId: 'bronze', portId: 'in' }, flowKind: 'data-stream' },
          ],
        },
        activeEdgeIds: ['events'],
      },
      { reducedMotion: true, onSelect },
    );
    const source = host.querySelector<SVGGElement>('g[data-node-id="source"]')!;
    source.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(onSelect).toHaveBeenCalledWith('source');
    expect(host.querySelector('path[data-role="route"]')?.getAttribute('stroke-dasharray')).toBe('8 5');
    expect(host.querySelector('g[data-role="flow-token"]')?.getAttribute('data-motion')).toBe('static');
  });

  it('renders stable asset/column ports and derivation labels from a lineage fixture', () => {
    const lineage: LineageSpec = {
      kind: 'lineage',
      version: '1.1',
      id: 'sales-lineage',
      title: 'Sales lineage',
      assets: [
        { id: 'orders', label: 'Orders', type: 'table', columns: [{ id: 'amount', label: 'amount', role: 'source' }] },
        { id: 'sales', label: 'Sales', type: 'table', columns: [{ id: 'revenue', label: 'revenue', role: 'derived' }] },
      ],
      relations: [
        {
          id: 'revenue-expression',
          sources: [{ assetId: 'orders', columnId: 'amount' }],
          target: { assetId: 'sales', columnId: 'revenue' },
          changeType: 'derive',
          expression: 'SUM(amount)',
        },
      ],
    };
    const host = svg();
    const onSelect = vi.fn();
    new LineageRenderer().mount(host, { spec: lineage }, { reducedMotion: true, onSelect });
    const portId = getLineagePortId({ assetId: 'sales', columnId: 'revenue' });
    expect(host.querySelector(`g[data-port-id="${portId}"]`)).not.toBeNull();
    expect(host.querySelector('g[data-relation-id="revenue-expression"]')?.textContent).toContain('SUM(amount)');
    expect(host.querySelector('path[data-role="route"]')?.getAttribute('stroke-dasharray')).toBe('7 3');
    expect(host.querySelector('[role="button"] [role="button"]')).toBeNull();
    const assetControl = host.querySelector<SVGGElement>('g[data-asset-id="orders"] > g[data-role="asset-control"]')!;
    assetControl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(onSelect).toHaveBeenCalledWith('orders');
  });

  it('uses non-color workflow condition and status cues for run overlays', () => {
    const workflow: WorkflowSpec = {
      kind: 'workflow',
      version: '1.1',
      id: 'retry-flow',
      title: 'Retry flow',
      preset: 'airflow',
      nodes: [
        { id: 'copy', label: 'Copy', taskType: 'copy' },
        { id: 'notify', label: 'Notify', taskType: 'notify' },
      ],
      edges: [{ id: 'on-failure', from: 'copy', to: 'notify', condition: 'failure' }],
      runs: [
        {
          id: 'failed-run',
          frames: [{ id: 'failure', states: { copy: { status: 'failed' }, notify: { status: 'queued' } } }],
        },
      ],
    };
    const host = svg();
    new WorkflowRenderer().mount(
      host,
      { spec: workflow, frame: compileWorkflowRunFrame(workflow, 'failed-run', 0), mode: 'run' },
      { reducedMotion: true },
    );
    expect(host.querySelector('g[data-node-id="copy"]')?.getAttribute('data-status')).toBe('failed');
    expect(host.querySelector('g[data-node-id="copy"]')?.textContent).toContain('× FAILED');
    expect(host.querySelector('g[data-flow-kind="failure"] path')?.getAttribute('stroke-dasharray')).toBe('8 5');
    expect(host.querySelector('g[data-flow-kind="failure"]')?.textContent).toContain('×');
  });
});
