import type { FigureSpec } from '@datapass/content';

/** Canonical JSON-first examples for the Visual Sandbox. No code is executed. */
const filterRows: FigureSpec = {
  id: 'sandbox-table-trace-filter',
  kind: 'concept',
  rendererId: 'table.trace',
  title: 'Table trace · filter rows',
  fallbackText: 'The status cells are read; late rows survive and the ok row is dropped.',
  staticState: 1,
  reducedMotionState: 1,
  profile: 'professional',
  spec: {
    kind: 'table-trace', version: '1', id: 'sandbox-table-trace-filter', title: 'Filter late orders',
    description: 'Predicate cells explain which rows survive.',
    views: [
      { id: 'before', role: 'input', label: 'Before', table: { id: 'orders', columns: [{ id: 'customer' }, { id: 'status' }, { id: 'amount' }], rows: [
        { id: 'o1', values: { customer: 'A', status: 'late', amount: 80 } },
        { id: 'o2', values: { customer: 'B', status: 'ok', amount: 20 } },
        { id: 'o3', values: { customer: 'C', status: 'late', amount: 70 } },
      ] } },
      { id: 'after', role: 'output', label: 'After', table: { id: 'orders', columns: [{ id: 'customer' }, { id: 'status' }, { id: 'amount' }], rows: [
        { id: 'o1', values: { customer: 'A', status: 'late', amount: 80 } },
        { id: 'o3', values: { customer: 'C', status: 'late', amount: 70 } },
      ] } },
    ],
    relations: [
      { id: 'read-status', kind: 'use', from: [
        { viewId: 'before', kind: 'cell', rowId: 'o1', columnId: 'status' },
        { viewId: 'before', kind: 'cell', rowId: 'o2', columnId: 'status' },
        { viewId: 'before', kind: 'cell', rowId: 'o3', columnId: 'status' },
      ], label: 'Evaluate status = late' },
      { id: 'keep-o1', kind: 'map', from: [{ viewId: 'before', kind: 'row', rowId: 'o1' }], to: [{ viewId: 'after', kind: 'row', rowId: 'o1' }] },
      { id: 'drop-o2', kind: 'drop', from: [{ viewId: 'before', kind: 'row', rowId: 'o2' }] },
      { id: 'keep-o3', kind: 'map', from: [{ viewId: 'before', kind: 'row', rowId: 'o3' }], to: [{ viewId: 'after', kind: 'row', rowId: 'o3' }] },
    ],
    frames: [
      { id: 'predicate', caption: 'Read the status cells used by the predicate.', activeRelationIds: ['read-status'] },
      { id: 'result', caption: 'Matching rows travel to the result; the rejected row fades.', activeRelationIds: ['keep-o1', 'drop-o2', 'keep-o3'] },
    ],
  },
};

const sortRows: FigureSpec = {
  id: 'sandbox-table-trace-sort',
  kind: 'concept',
  rendererId: 'table.trace',
  title: 'Table trace · sort rows',
  fallbackText: 'The same order rows are displayed in descending amount order.',
  staticState: 0,
  reducedMotionState: 0,
  profile: 'professional',
  spec: {
    kind: 'table-trace', version: '1', id: 'sandbox-table-trace-sort', title: 'Sort by amount descending',
    description: 'Stable row identity makes row reordering visible without a sort-specific renderer.',
    views: [
      { id: 'before', role: 'input', label: 'Original order', table: { id: 'orders', columns: [{ id: 'customer' }, { id: 'amount' }], rows: [
        { id: 'o1', values: { customer: 'A', amount: 20 } },
        { id: 'o2', values: { customer: 'B', amount: 90 } },
        { id: 'o3', values: { customer: 'C', amount: 50 } },
      ] } },
      { id: 'after', role: 'output', label: 'Sorted order', table: { id: 'orders', columns: [{ id: 'customer' }, { id: 'amount' }], rows: [
        { id: 'o2', values: { customer: 'B', amount: 90 } },
        { id: 'o3', values: { customer: 'C', amount: 50 } },
        { id: 'o1', values: { customer: 'A', amount: 20 } },
      ] } },
    ],
    relations: [
      { id: 'o1-order', kind: 'map', from: [{ viewId: 'before', kind: 'row', rowId: 'o1' }], to: [{ viewId: 'after', kind: 'row', rowId: 'o1' }] },
      { id: 'o2-order', kind: 'map', from: [{ viewId: 'before', kind: 'row', rowId: 'o2' }], to: [{ viewId: 'after', kind: 'row', rowId: 'o2' }] },
      { id: 'o3-order', kind: 'map', from: [{ viewId: 'before', kind: 'row', rowId: 'o3' }], to: [{ viewId: 'after', kind: 'row', rowId: 'o3' }] },
    ],
    frames: [{ id: 'reorder', caption: 'Each stable row travels from its old display position to its new one.', activeRelationIds: ['o1-order', 'o2-order', 'o3-order'] }],
  },
};

const groupAggregate: FigureSpec = {
  id: 'sandbox-table-trace-group-sum',
  kind: 'concept',
  rendererId: 'table.trace',
  title: 'Table trace · group and aggregate',
  fallbackText: 'Rows are grouped by customer and their amounts contribute to one total per customer.',
  staticState: 1,
  reducedMotionState: 1,
  profile: 'professional',
  spec: {
    kind: 'table-trace', version: '1', id: 'sandbox-table-trace-group-sum', title: 'GROUP BY customer, SUM(amount)',
    description: 'Rows form groups first; measure cells then converge into aggregate cells.',
    views: [
      { id: 'detail', role: 'input', label: 'Detail rows', table: { id: 'orders', columns: [{ id: 'customer' }, { id: 'amount' }], rows: [
        { id: 'o1', values: { customer: 'A', amount: 80 } },
        { id: 'o2', values: { customer: 'B', amount: 20 } },
        { id: 'o3', values: { customer: 'A', amount: 70 } },
      ] } },
      { id: 'summary', role: 'output', label: 'Grouped result', table: { id: 'summary', columns: [{ id: 'customer' }, { id: 'total' }], rows: [
        { id: 'A', values: { customer: 'A', total: 150 } },
        { id: 'B', values: { customer: 'B', total: 20 } },
      ] } },
    ],
    groups: [
      { id: 'customer-a', viewId: 'detail', rowIds: ['o1', 'o3'], label: 'customer = A' },
      { id: 'customer-b', viewId: 'detail', rowIds: ['o2'], label: 'customer = B' },
    ],
    relations: [
      { id: 'group-a', kind: 'group', from: [{ viewId: 'detail', kind: 'row', rowId: 'o1' }, { viewId: 'detail', kind: 'row', rowId: 'o3' }], to: [{ viewId: 'detail', kind: 'group', groupId: 'customer-a' }] },
      { id: 'group-b', kind: 'group', from: [{ viewId: 'detail', kind: 'row', rowId: 'o2' }], to: [{ viewId: 'detail', kind: 'group', groupId: 'customer-b' }] },
      { id: 'sum-a', kind: 'derive', from: [{ viewId: 'detail', kind: 'cell', rowId: 'o1', columnId: 'amount' }, { viewId: 'detail', kind: 'cell', rowId: 'o3', columnId: 'amount' }], to: [{ viewId: 'summary', kind: 'cell', rowId: 'A', columnId: 'total' }] },
      { id: 'sum-b', kind: 'derive', from: [{ viewId: 'detail', kind: 'cell', rowId: 'o2', columnId: 'amount' }], to: [{ viewId: 'summary', kind: 'cell', rowId: 'B', columnId: 'total' }] },
    ],
    frames: [
      { id: 'groups', caption: 'Rows cluster into semantic customer groups.', activeRelationIds: ['group-a', 'group-b'] },
      { id: 'aggregate', caption: 'Amount cells converge into the two SUM outputs.', activeRelationIds: ['sum-a', 'sum-b'] },
    ],
  },
};

const pivotRows: FigureSpec = {
  id: 'sandbox-table-trace-pivot',
  kind: 'concept',
  rendererId: 'table.trace',
  title: 'Table trace · pivot / reshape',
  fallbackText: 'Quarter values move from repeated long rows into separate wide columns.',
  staticState: 0,
  reducedMotionState: 0,
  profile: 'professional',
  spec: {
    kind: 'table-trace', version: '1', id: 'sandbox-table-trace-pivot', title: 'Pivot quarters into columns',
    description: 'Cell identity is traced across a changed row/column shape.',
    views: [
      { id: 'long', role: 'input', label: 'Long', table: { id: 'sales-long', columns: [{ id: 'region' }, { id: 'quarter' }, { id: 'sales' }], rows: [
        { id: 'north-q1', values: { region: 'North', quarter: 'Q1', sales: 10 } },
        { id: 'north-q2', values: { region: 'North', quarter: 'Q2', sales: 14 } },
        { id: 'south-q1', values: { region: 'South', quarter: 'Q1', sales: 8 } },
        { id: 'south-q2', values: { region: 'South', quarter: 'Q2', sales: 12 } },
      ] } },
      { id: 'wide', role: 'output', label: 'Wide', table: { id: 'sales-wide', columns: [{ id: 'region' }, { id: 'Q1' }, { id: 'Q2' }], rows: [
        { id: 'north', values: { region: 'North', Q1: 10, Q2: 14 } },
        { id: 'south', values: { region: 'South', Q1: 8, Q2: 12 } },
      ] } },
    ],
    relations: [
      { id: 'north-q1', kind: 'map', from: [{ viewId: 'long', kind: 'cell', rowId: 'north-q1', columnId: 'sales' }], to: [{ viewId: 'wide', kind: 'cell', rowId: 'north', columnId: 'Q1' }] },
      { id: 'north-q2', kind: 'map', from: [{ viewId: 'long', kind: 'cell', rowId: 'north-q2', columnId: 'sales' }], to: [{ viewId: 'wide', kind: 'cell', rowId: 'north', columnId: 'Q2' }] },
      { id: 'south-q1', kind: 'map', from: [{ viewId: 'long', kind: 'cell', rowId: 'south-q1', columnId: 'sales' }], to: [{ viewId: 'wide', kind: 'cell', rowId: 'south', columnId: 'Q1' }] },
      { id: 'south-q2', kind: 'map', from: [{ viewId: 'long', kind: 'cell', rowId: 'south-q2', columnId: 'sales' }], to: [{ viewId: 'wide', kind: 'cell', rowId: 'south', columnId: 'Q2' }] },
    ],
    frames: [{ id: 'reshape', caption: 'Each sales value travels into its new quarter column.', activeRelationIds: ['north-q1', 'north-q2', 'south-q1', 'south-q2'] }],
  },
};

const joinRows: FigureSpec = {
  id: 'sandbox-table-trace-join',
  kind: 'concept',
  rendererId: 'table.trace',
  title: 'Table trace · two-input join',
  fallbackText: 'Customer keys are matched and rows from orders and customers jointly derive joined rows.',
  staticState: 1,
  reducedMotionState: 1,
  profile: 'professional',
  spec: {
    kind: 'table-trace', version: '1', id: 'sandbox-table-trace-join', title: 'Join orders to customers',
    description: 'Two input tables jointly contribute to each output row.',
    views: [
      { id: 'orders', role: 'input', label: 'Orders', table: { id: 'orders', columns: [{ id: 'order_id' }, { id: 'customer_id' }, { id: 'amount' }], rows: [
        { id: 'o1', values: { order_id: 1, customer_id: 'A', amount: 80 } },
        { id: 'o2', values: { order_id: 2, customer_id: 'B', amount: 20 } },
      ] } },
      { id: 'customers', role: 'input', label: 'Customers', table: { id: 'customers', columns: [{ id: 'customer_id' }, { id: 'segment' }], rows: [
        { id: 'A', values: { customer_id: 'A', segment: 'Enterprise' } },
        { id: 'B', values: { customer_id: 'B', segment: 'SMB' } },
      ] } },
      { id: 'joined', role: 'output', label: 'Joined result', table: { id: 'order-customer', columns: [{ id: 'order_id' }, { id: 'customer_id' }, { id: 'amount' }, { id: 'segment' }], rows: [
        { id: 'o1-A', values: { order_id: 1, customer_id: 'A', amount: 80, segment: 'Enterprise' } },
        { id: 'o2-B', values: { order_id: 2, customer_id: 'B', amount: 20, segment: 'SMB' } },
      ] } },
    ],
    relations: [
      { id: 'read-order-keys', kind: 'use', from: [{ viewId: 'orders', kind: 'column', columnId: 'customer_id' }] },
      { id: 'read-customer-keys', kind: 'use', from: [{ viewId: 'customers', kind: 'column', columnId: 'customer_id' }] },
      { id: 'join-o1-a', kind: 'derive', from: [{ viewId: 'orders', kind: 'row', rowId: 'o1' }, { viewId: 'customers', kind: 'row', rowId: 'A' }], to: [{ viewId: 'joined', kind: 'row', rowId: 'o1-A' }] },
      { id: 'join-o2-b', kind: 'derive', from: [{ viewId: 'orders', kind: 'row', rowId: 'o2' }, { viewId: 'customers', kind: 'row', rowId: 'B' }], to: [{ viewId: 'joined', kind: 'row', rowId: 'o2-B' }] },
    ],
    frames: [
      { id: 'keys', caption: 'Read the join-key columns on both inputs.', activeRelationIds: ['read-order-keys', 'read-customer-keys'] },
      { id: 'matches', caption: 'Matching source rows converge into joined output rows.', activeRelationIds: ['join-o1-a', 'join-o2-b'] },
    ],
  },
};

export const tableTraceSandboxExamples: readonly FigureSpec[] = [filterRows, sortRows, groupAggregate, pivotRows, joinRows];
export const tableTraceSandboxExample = filterRows;
