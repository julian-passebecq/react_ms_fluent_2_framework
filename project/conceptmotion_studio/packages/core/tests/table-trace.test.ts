import { describe, expect, it } from 'vitest';
import {
  compileTableTrace,
  tableTraceRefKey,
  tableTraceSemanticEntityId,
  type TableData,
  type TableTraceSpec,
} from '../src/index';

const before: TableData = {
  id: 'orders',
  columns: [{ id: 'customer' }, { id: 'amount' }, { id: 'status' }],
  rows: [
    { id: 'o1', values: { customer: 'A', amount: 80, status: 'late' } },
    { id: 'o2', values: { customer: 'B', amount: 20, status: 'ok' } },
    { id: 'o3', values: { customer: 'A', amount: 70, status: 'late' } },
  ],
};

const after: TableData = {
  ...before,
  rows: [before.rows[0], before.rows[2]],
};

function filterTrace(): TableTraceSpec {
  return {
    kind: 'table-trace',
    version: '1',
    id: 'filter-late',
    title: 'Filter late orders',
    views: [
      { id: 'before', role: 'input', table: before },
      { id: 'after', role: 'output', table: after },
    ],
    relations: [
      { id: 'predicate', kind: 'use', from: before.rows.map((row) => ({ viewId: 'before', kind: 'cell' as const, rowId: row.id, columnId: 'status' })) },
      { id: 'keep-o1', kind: 'map', from: [{ viewId: 'before', kind: 'row', rowId: 'o1' }], to: [{ viewId: 'after', kind: 'row', rowId: 'o1' }] },
      { id: 'drop-o2', kind: 'drop', from: [{ viewId: 'before', kind: 'row', rowId: 'o2' }] },
      { id: 'keep-o3', kind: 'map', from: [{ viewId: 'before', kind: 'row', rowId: 'o3' }], to: [{ viewId: 'after', kind: 'row', rowId: 'o3' }] },
    ],
  };
}

describe('table trace semantics', () => {
  it('keeps view-scoped references distinct while preserving stable semantic row identity', () => {
    const spec = filterTrace();
    const trace = compileTableTrace(spec);
    const beforeRef = { viewId: 'before', kind: 'row' as const, rowId: 'o1' };
    const afterRef = { viewId: 'after', kind: 'row' as const, rowId: 'o1' };
    expect(tableTraceRefKey(beforeRef)).not.toBe(tableTraceRefKey(afterRef));
    expect(tableTraceSemanticEntityId(spec, beforeRef)).toBe(tableTraceSemanticEntityId(spec, afterRef));
    expect(trace.relations.find((relation) => relation.id === 'keep-o1')?.fromEntityIds).toEqual(['orders:row:o1']);
    expect(trace.relations.find((relation) => relation.id === 'keep-o1')?.toEntityIds).toEqual(['orders:row:o1']);
    expect(trace.referenceKeys).toContain('trace:before:cell:o1:status');
    expect(trace.referenceKeys).toContain('trace:after:row:o3');
  });

  it('expresses a stable sort as row mappings rather than a sort-specific renderer', () => {
    const sorted: TableData = { ...before, rows: [before.rows[0], before.rows[2], before.rows[1]] };
    const spec: TableTraceSpec = {
      kind: 'table-trace', version: '1', id: 'sort-amount', title: 'Sort by amount',
      views: [{ id: 'before', role: 'input', table: before }, { id: 'after', role: 'output', table: sorted }],
      relations: before.rows.map((row) => ({
        id: `move-${row.id}`,
        kind: 'map' as const,
        from: [{ viewId: 'before', kind: 'row' as const, rowId: row.id }],
        to: [{ viewId: 'after', kind: 'row' as const, rowId: row.id }],
      })),
    };
    const trace = compileTableTrace(spec);
    expect(spec.views[1].table.rows.map((row) => row.id)).toEqual(['o1', 'o3', 'o2']);
    expect(trace.relations.every((relation) => relation.fromEntityIds[0] === relation.toEntityIds[0])).toBe(true);
  });

  it('supports group and many-to-one derive relations without a pandas-specific contract', () => {
    const grouped: TableData = {
      id: 'summary',
      columns: [{ id: 'customer' }, { id: 'total' }],
      rows: [{ id: 'A', values: { customer: 'A', total: 150 } }],
    };
    const spec: TableTraceSpec = {
      kind: 'table-trace', version: '1', id: 'group-sum', title: 'Group and aggregate',
      views: [{ id: 'detail', role: 'input', table: before }, { id: 'summary', role: 'output', table: grouped }],
      groups: [{ id: 'customer-a', viewId: 'detail', rowIds: ['o1', 'o3'], label: 'customer = A' }],
      relations: [
        { id: 'group-a', kind: 'group', from: [{ viewId: 'detail', kind: 'row', rowId: 'o1' }, { viewId: 'detail', kind: 'row', rowId: 'o3' }], to: [{ viewId: 'detail', kind: 'group', groupId: 'customer-a' }] },
        { id: 'sum-a', kind: 'derive', from: [{ viewId: 'detail', kind: 'cell', rowId: 'o1', columnId: 'amount' }, { viewId: 'detail', kind: 'cell', rowId: 'o3', columnId: 'amount' }], to: [{ viewId: 'summary', kind: 'cell', rowId: 'A', columnId: 'total' }] },
      ],
    };
    const trace = compileTableTrace(spec);
    expect(trace.relations.find((relation) => relation.id === 'sum-a')?.fromEntityIds).toEqual(['orders:cell:o1:amount', 'orders:cell:o3:amount']);
    expect(trace.relations.find((relation) => relation.id === 'sum-a')?.toEntityIds).toEqual(['summary:cell:A:total']);
  });

  it('expresses pivot/reshape as cell mappings across a changed table shape', () => {
    const long: TableData = {
      id: 'sales-long',
      columns: [{ id: 'region' }, { id: 'metric' }, { id: 'value' }],
      rows: [
        { id: 'north-revenue', values: { region: 'North', metric: 'revenue', value: 120 } },
        { id: 'north-cost', values: { region: 'North', metric: 'cost', value: 70 } },
      ],
    };
    const wide: TableData = {
      id: 'sales-wide',
      columns: [{ id: 'region' }, { id: 'revenue' }, { id: 'cost' }],
      rows: [{ id: 'North', values: { region: 'North', revenue: 120, cost: 70 } }],
    };
    const spec: TableTraceSpec = {
      kind: 'table-trace', version: '1', id: 'pivot-sales', title: 'Pivot metric into columns',
      views: [{ id: 'long', role: 'input', table: long }, { id: 'wide', role: 'output', table: wide }],
      relations: [
        { id: 'pivot-key', kind: 'use', from: [{ viewId: 'long', kind: 'column', columnId: 'metric' }] },
        { id: 'revenue-cell', kind: 'map', from: [{ viewId: 'long', kind: 'cell', rowId: 'north-revenue', columnId: 'value' }], to: [{ viewId: 'wide', kind: 'cell', rowId: 'North', columnId: 'revenue' }] },
        { id: 'cost-cell', kind: 'map', from: [{ viewId: 'long', kind: 'cell', rowId: 'north-cost', columnId: 'value' }], to: [{ viewId: 'wide', kind: 'cell', rowId: 'North', columnId: 'cost' }] },
      ],
    };
    const trace = compileTableTrace(spec);
    expect(trace.relations.find((relation) => relation.id === 'revenue-cell')?.fromEntityIds).toEqual(['sales-long:cell:north-revenue:value']);
    expect(trace.relations.find((relation) => relation.id === 'revenue-cell')?.toEntityIds).toEqual(['sales-wide:cell:North:revenue']);
  });

  it('supports two input tables and many-source derivation for a join result', () => {
    const customers: TableData = {
      id: 'customers', columns: [{ id: 'customer_id' }, { id: 'name' }],
      rows: [{ id: 'c1', values: { customer_id: 1, name: 'Ada' } }],
    };
    const orders: TableData = {
      id: 'join-orders', columns: [{ id: 'order_id' }, { id: 'customer_id' }],
      rows: [{ id: 'o10', values: { order_id: 10, customer_id: 1 } }],
    };
    const joined: TableData = {
      id: 'customer-orders', columns: [{ id: 'name' }, { id: 'order_id' }],
      rows: [{ id: 'c1-o10', values: { name: 'Ada', order_id: 10 } }],
    };
    const spec: TableTraceSpec = {
      kind: 'table-trace', version: '1', id: 'join-result', title: 'Join customers and orders',
      views: [
        { id: 'customers', role: 'input', table: customers },
        { id: 'orders', role: 'input', table: orders },
        { id: 'result', role: 'output', table: joined },
      ],
      relations: [
        { id: 'join-key-left', kind: 'use', from: [{ viewId: 'customers', kind: 'cell', rowId: 'c1', columnId: 'customer_id' }] },
        { id: 'join-key-right', kind: 'use', from: [{ viewId: 'orders', kind: 'cell', rowId: 'o10', columnId: 'customer_id' }] },
        { id: 'emit', kind: 'derive', from: [{ viewId: 'customers', kind: 'row', rowId: 'c1' }, { viewId: 'orders', kind: 'row', rowId: 'o10' }], to: [{ viewId: 'result', kind: 'row', rowId: 'c1-o10' }] },
      ],
    };
    const trace = compileTableTrace(spec);
    expect(spec.views.filter((view) => view.role === 'input')).toHaveLength(2);
    expect(trace.relations.find((relation) => relation.id === 'emit')?.fromEntityIds).toEqual(['customers:row:c1', 'join-orders:row:o10']);
    expect(trace.relations.find((relation) => relation.id === 'emit')?.toEntityIds).toEqual(['customer-orders:row:c1-o10']);
  });

  it('rejects missing cells and malformed relation shapes before rendering', () => {
    const base = filterTrace();
    const missingCell: TableTraceSpec = {
      ...base,
      relations: [{ id: 'bad', kind: 'use', from: [{ viewId: 'before', kind: 'cell', rowId: 'o1', columnId: 'missing' }] }],
    };
    expect(() => compileTableTrace(missingCell)).toThrow(/unknown column/i);

    const malformed: TableTraceSpec = {
      ...base,
      relations: [{ id: 'bad-map', kind: 'map', from: [{ viewId: 'before', kind: 'row', rowId: 'o1' }] }],
    };
    expect(() => compileTableTrace(malformed)).toThrow(/requires both from and to/i);
  });
});
