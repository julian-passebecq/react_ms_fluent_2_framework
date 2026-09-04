import { describe, expect, it } from 'vitest';
import {
  compileTableFilter,
  compileTableJoin,
  compileTableSort,
  compileTableState,
  createSemanticSnapshot,
  planTransitions,
  type TableData
} from '../src/index';

const orders: TableData = {
  id: 'orders',
  columns: [
    { id: 'customer_id', label: 'Customer' },
    { id: 'amount', label: 'Amount' },
    { id: 'status', label: 'Status' }
  ],
  rows: [
    { id: 'order-10', values: { customer_id: 'c1', amount: 80, status: 'late' } },
    { id: 'order-11', values: { customer_id: 'c1', amount: 120, status: 'late' } },
    { id: 'order-12', values: { customer_id: 'c3', amount: 50, status: 'ok' } }
  ]
};

describe('stable table compilation', () => {
  it('filters without replacing surviving row or cell identities', () => {
    const initial = compileTableState(orders);
    const filtered = compileTableFilter(orders, { columnId: 'status', operator: 'eq', value: 'late' });
    expect(filtered.rowOrder).toEqual(['order-10', 'order-11']);
    expect(filtered.filteredOutRowIds).toEqual(['order-12']);
    const initialIds = new Set(initial.snapshot.entities.map((entity) => entity.id));
    expect(filtered.snapshot.entities.filter((entity) => entity.visible !== false).every((entity) => initialIds.has(entity.id))).toBe(true);
    const transition = planTransitions(initial.snapshot, filtered.snapshot);
    expect(transition.items.find((item) => item.entityId.includes('order-12'))?.changes).toContain('visibility');
  });

  it('sorts deterministically while the same row entities move', () => {
    const initial = compileTableState(orders);
    const sorted = compileTableSort(orders, [{ columnId: 'amount', direction: 'desc' }]);
    expect(sorted.rowOrder).toEqual(['order-11', 'order-10', 'order-12']);
    expect(planTransitions(initial.snapshot, sorted.snapshot).movingIds).toEqual([
      'orders:cell:order-10:amount',
      'orders:cell:order-10:customer_id',
      'orders:cell:order-10:status',
      'orders:cell:order-11:amount',
      'orders:cell:order-11:customer_id',
      'orders:cell:order-11:status',
      'orders:row:order-10',
      'orders:row:order-11'
    ]);
  });

  it('builds stable one-to-many join output identities', () => {
    const customers: TableData = {
      id: 'customers',
      columns: [{ id: 'customer_id' }, { id: 'name' }],
      rows: [
        { id: 'customer-c1', values: { customer_id: 'c1', name: 'Ana' } },
        { id: 'customer-c2', values: { customer_id: 'c2', name: 'Ben' } }
      ]
    };
    const spec = {
      id: 'customer-orders',
      joinType: 'left' as const,
      left: customers,
      right: orders,
      leftKey: 'customer_id',
      rightKey: 'customer_id'
    };
    const first = compileTableJoin(spec);
    const second = compileTableJoin(spec);
    expect(first.rows.map((row) => row.id)).toEqual(second.rows.map((row) => row.id));
    expect(first.rows.map((row) => [row.leftRowId, row.rightRowId])).toEqual([
      ['customer-c1', 'order-10'],
      ['customer-c1', 'order-11'],
      ['customer-c2', null]
    ]);
    expect(new Set(first.rows.map((row) => row.id)).size).toBe(3);
  });
});

describe('transition planning', () => {
  it('classifies stable entities deterministically', () => {
    const before = createSemanticSnapshot('before', [
      { id: 'a', kind: 'row', position: { slot: 0 } },
      { id: 'b', kind: 'row', position: { slot: 1 }, emphasized: true },
      { id: 'gone', kind: 'row' }
    ]);
    const after = createSemanticSnapshot('after', [
      { id: 'a', kind: 'row', position: { slot: 1 } },
      { id: 'b', kind: 'row', position: { slot: 1 }, emphasized: false },
      { id: 'new', kind: 'row' }
    ]);
    const plan = planTransitions(before, after);
    expect(plan.items.map((item) => [item.entityId, item.kind])).toEqual([
      ['a', 'move'],
      ['b', 'de-emphasize'],
      ['gone', 'exit'],
      ['new', 'enter']
    ]);
  });
});
