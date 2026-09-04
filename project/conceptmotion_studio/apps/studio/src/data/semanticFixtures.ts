import {
  compileLoopFrame,
  compileRegressionFrame,
  compileTableFilter,
  compileTableJoin,
  compileTableSort,
  compileTableState,
  planTransitions,
  type CompiledLoopFrame,
  type CompiledRegressionFrame,
  type CompiledTableState,
  type JoinResult,
  type LoopSceneSpec,
  type RegressionSceneSpec,
  type TableData,
  type TableJoinSpec,
  type TransitionPlan,
} from '@conceptmotion/core';

export interface SemanticLessonFrame<T> {
  id: string;
  operation: string;
  caption: string;
  state: T;
  transition: TransitionPlan;
}

export const ordersTable: TableData = {
  id: 'orders',
  columns: [
    { id: 'order_id', label: 'Order', role: 'key' },
    { id: 'customer', label: 'Customer' },
    { id: 'status', label: 'Status' },
    { id: 'amount', label: 'Amount', dataType: 'currency' },
  ],
  rows: [
    { id: 'order-1042', values: { order_id: '1042', customer: 'Northwind', status: 'late', amount: 640 } },
    { id: 'order-1043', values: { order_id: '1043', customer: 'Contoso', status: 'ready', amount: 280 } },
    { id: 'order-1044', values: { order_id: '1044', customer: 'Fabrikam', status: 'late', amount: 920 } },
    { id: 'order-1045', values: { order_id: '1045', customer: 'Adventure', status: 'late', amount: 410 } },
    { id: 'order-1046', values: { order_id: '1046', customer: 'Tailspin', status: 'ready', amount: 760 } },
  ],
};

const initialOrders = compileTableState(ordersTable, 'orders:all');
const filteredOrders = compileTableFilter(ordersTable, { columnId: 'status', operator: 'eq', value: 'late' }, 'orders:late');
const lateOrders: TableData = {
  ...ordersTable,
  rows: ordersTable.rows.filter((row) => filteredOrders.visibleRowIds.includes(row.id)),
};
const sortedOrders = compileTableSort(lateOrders, [{ columnId: 'amount', direction: 'desc' }], 'orders:late:amount-desc');

export const tableLessonFrames: Array<SemanticLessonFrame<CompiledTableState>> = [
  {
    id: 'all-orders',
    operation: 'SOURCE',
    caption: 'Every order begins with a stable row ID that is independent of its screen position.',
    state: initialOrders,
    transition: planTransitions(undefined, initialOrders.snapshot),
  },
  {
    id: 'filter-late',
    operation: 'FILTER status = late',
    caption: 'Ready orders exit; the three late orders keep the same semantic identities.',
    state: filteredOrders,
    transition: planTransitions(initialOrders.snapshot, filteredOrders.snapshot),
  },
  {
    id: 'sort-amount',
    operation: 'SORT amount DESC',
    caption: 'The surviving rows physically move into descending amount order without being recreated.',
    state: sortedOrders,
    transition: planTransitions(filteredOrders.snapshot, sortedOrders.snapshot),
  },
];

export const tableSceneSpec = {
  kind: 'table' as const,
  version: '1.1',
  id: 'table-filter-sort',
  title: { en: 'Orders keep stable identity', no: 'Ordrer beholder stabil identitet' },
  description: 'Filter and sort compile to stable semantic row snapshots.',
  frames: tableLessonFrames.map((frame) => frame.state),
};

const customers: TableData = {
  id: 'customers',
  columns: [
    { id: 'customer_id', label: 'Customer ID', role: 'key' },
    { id: 'name', label: 'Customer' },
  ],
  rows: [
    { id: 'customer-c1', values: { customer_id: 'C1', name: 'Northwind' } },
    { id: 'customer-c2', values: { customer_id: 'C2', name: 'Contoso' } },
    { id: 'customer-c3', values: { customer_id: 'C3', name: 'Fabrikam' } },
  ],
};

const orderFacts: TableData = {
  id: 'order-facts',
  columns: [
    { id: 'order_id', label: 'Order ID', role: 'key' },
    { id: 'customer_id', label: 'Customer ID', role: 'foreign-key' },
    { id: 'amount', label: 'Amount' },
  ],
  rows: [
    { id: 'fact-o11', values: { order_id: 'O11', customer_id: 'C1', amount: 125 } },
    { id: 'fact-o12', values: { order_id: 'O12', customer_id: 'C1', amount: 210 } },
    { id: 'fact-o13', values: { order_id: 'O13', customer_id: 'C3', amount: 90 } },
  ],
};

function joinWithRows(rows: TableData['rows'], joinType: TableJoinSpec['joinType']): JoinResult {
  return compileTableJoin({
    id: 'customer-orders',
    joinType,
    left: customers,
    right: { ...orderFacts, rows },
    leftKey: 'customer_id',
    rightKey: 'customer_id',
  });
}

const joinEmpty = joinWithRows([], 'inner');
const joinFirst = joinWithRows(orderFacts.rows.slice(0, 1), 'inner');
const joinFanout = joinWithRows(orderFacts.rows.slice(0, 2), 'inner');
const joinFinal = joinWithRows(orderFacts.rows, 'left');

export const joinLessonFrames: Array<SemanticLessonFrame<JoinResult>> = [
  {
    id: 'join-sources', operation: 'SOURCE TABLES',
    caption: 'Stable customer and order IDs establish the lineage before matching begins.',
    state: joinEmpty, transition: planTransitions(undefined, joinEmpty.snapshot),
  },
  {
    id: 'join-first-match', operation: 'MATCH C1 → O11',
    caption: 'The first C1 match creates one result row linked to both source rows.',
    state: joinFirst, transition: planTransitions(joinEmpty.snapshot, joinFirst.snapshot),
  },
  {
    id: 'join-fanout', operation: 'FAN OUT C1 → O12',
    caption: 'A second order with the same key creates another result row; the earlier result persists.',
    state: joinFanout, transition: planTransitions(joinFirst.snapshot, joinFanout.snapshot),
  },
  {
    id: 'join-left-complete', operation: 'LEFT JOIN COMPLETE',
    caption: 'C2 has no order, so the left join preserves it with NULL right-side values.',
    state: joinFinal, transition: planTransitions(joinFanout.snapshot, joinFinal.snapshot),
  },
];

export const joinSceneSpec = {
  kind: 'join' as const,
  version: '1.1',
  id: 'join-fanout',
  title: { en: 'One customer fans out to multiple orders', no: 'Én kunde gir flere ordrerader' },
  description: 'Stable source and output IDs make one-to-many multiplication visible.',
  join: {
    id: 'customer-orders',
    joinType: 'left' as const,
    left: customers,
    right: orderFacts,
    leftKey: 'customer_id',
    rightKey: 'customer_id',
  },
  revealCounts: [0, 1, 2, 4],
};

export const loopScene: LoopSceneSpec = {
  kind: 'loop',
  version: '1.1',
  id: 'sum-even-values',
  title: { en: 'Accumulate even values', no: 'Summer partall' },
  items: [
    { id: 'value-3', value: 3, label: '3' },
    { id: 'value-8', value: 8, label: '8' },
    { id: 'value-5', value: 5, label: '5' },
    { id: 'value-6', value: 6, label: '6' },
  ],
  codeLines: [
    { id: 'line-init', text: 'total = 0' },
    { id: 'line-loop', text: 'for value in values:' },
    { id: 'line-if', text: '    if value % 2 == 0:' },
    { id: 'line-add', text: '        total += value' },
  ],
  frames: [
    { id: 'loop-init', iteration: 0, variables: { total: 0 }, codeLineIds: ['line-init'], operation: 'INITIALIZE', caption: 'The accumulator begins at zero.' },
    { id: 'loop-3', iteration: 1, pointerItemId: 'value-3', activeItemIds: ['value-3'], variables: { value: 3, total: 0 }, codeLineIds: ['line-loop', 'line-if'], operation: 'TEST 3', caption: 'Three is odd, so the accumulator does not change.' },
    { id: 'loop-8', iteration: 2, pointerItemId: 'value-8', activeItemIds: ['value-8'], doneItemIds: ['value-3'], variables: { value: 8, total: 8 }, codeLineIds: ['line-loop', 'line-if', 'line-add'], operation: 'ADD 8', caption: 'Eight is even, so it is added to total.' },
    { id: 'loop-5', iteration: 3, pointerItemId: 'value-5', activeItemIds: ['value-5'], doneItemIds: ['value-3', 'value-8'], variables: { value: 5, total: 8 }, codeLineIds: ['line-loop', 'line-if'], operation: 'TEST 5', caption: 'Five is odd; total remains eight.' },
    { id: 'loop-6', iteration: 4, pointerItemId: 'value-6', activeItemIds: ['value-6'], doneItemIds: ['value-3', 'value-8', 'value-5', 'value-6'], variables: { value: 6, total: 14 }, codeLineIds: ['line-loop', 'line-if', 'line-add'], operation: 'ADD 6', caption: 'Six is added and the final total becomes fourteen.' },
  ],
};

export const loopLessonFrames: CompiledLoopFrame[] = loopScene.frames.map((frame) => compileLoopFrame(loopScene, frame.id));

export const regressionScene: RegressionSceneSpec = {
  kind: 'regression',
  version: '1.1',
  id: 'regression-residuals',
  title: { en: 'A fitted line minimizes residual error', no: 'En tilpasset linje minimerer residualfeil' },
  points: [
    { id: 'p1', x: 1, y: 2.2 }, { id: 'p2', x: 2, y: 2.9 }, { id: 'p3', x: 3, y: 4.5 },
    { id: 'p4', x: 4, y: 5.1 }, { id: 'p5', x: 5, y: 6.8 }, { id: 'p6', x: 6, y: 7.1 },
  ],
  frames: [
    { id: 'slope-low', slope: 0.55, intercept: 1.2, operation: 'UNDERFIT SLOPE', caption: 'A shallow slope leaves systematic residuals.' },
    { id: 'slope-close', slope: 1.02, intercept: 1.0, operation: 'REDUCE ERROR', caption: 'Increasing the slope shortens most residuals.' },
    { id: 'slope-fit', slope: 1.08, intercept: 0.95, operation: 'FITTED LINE', caption: 'The fitted line balances positive and negative errors with lower MSE.' },
  ],
};

export const regressionLessonFrames: CompiledRegressionFrame[] = regressionScene.frames.map((frame) => compileRegressionFrame(regressionScene, frame.id));
