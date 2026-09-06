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
