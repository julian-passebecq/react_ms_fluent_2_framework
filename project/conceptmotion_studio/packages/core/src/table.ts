import { createSemanticSnapshot, type EntitySnapshot, type SemanticSnapshot } from './entities';
import type { LocalizedText } from './localization';

export type TableCellValue = string | number | boolean | null;

export interface TableColumn {
  readonly id: string;
  readonly label?: LocalizedText;
  readonly dataType?: string;
  readonly role?: string;
}

export interface TableRow {
  readonly id: string;
  readonly values: Readonly<Record<string, TableCellValue>>;
}

export interface TableData {
  readonly id: string;
  readonly columns: readonly TableColumn[];
  readonly rows: readonly TableRow[];
}

export type TableComparisonOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'not-in'
  | 'contains'
  | 'is-null'
  | 'is-not-null';

export interface TableComparisonPredicate {
  readonly columnId: string;
  readonly operator: TableComparisonOperator;
  readonly value?: TableCellValue | readonly TableCellValue[];
}

export interface TablePredicateGroup {
  readonly operator: 'and' | 'or';
  readonly predicates: readonly TablePredicate[];
}

export type TablePredicate = TableComparisonPredicate | TablePredicateGroup;

export interface TableSortKey {
  readonly columnId: string;
  readonly direction?: 'asc' | 'desc';
}

export type JoinType = 'inner' | 'left' | 'right' | 'full' | 'cross' | 'semi' | 'anti';

export interface TableJoinSpec {
  readonly id: string;
  readonly joinType: JoinType;
  readonly left: TableData;
  readonly right: TableData;
  readonly leftKey?: string;
  readonly rightKey?: string;
}

export interface TableFilterAction {
  readonly id: string;
  readonly action: 'filter';
  readonly target: string;
  readonly predicate: TablePredicate;
}

export interface TableSortAction {
  readonly id: string;
  readonly action: 'sort';
  readonly target: string;
  readonly by: readonly TableSortKey[];
}

export interface TableJoinAction extends TableJoinSpec {
  readonly action: 'join';
}

export type TableAction = TableFilterAction | TableSortAction | TableJoinAction;

export interface CompiledTableState {
  readonly tableId: string;
  readonly columns: readonly TableColumn[];
  readonly rows: readonly TableRow[];
  /** Visible rows in semantic display order. */
  readonly rowOrder: readonly string[];
  readonly visibleRowIds: readonly string[];
  readonly filteredOutRowIds: readonly string[];
  readonly snapshot: SemanticSnapshot;
}

export interface JoinedTableRow extends TableRow {
  readonly leftRowId: string | null;
  readonly rightRowId: string | null;
  readonly sourceRowIds: readonly string[];
}

export interface JoinResult {
  readonly id: string;
  readonly joinType: JoinType;
  readonly columns: readonly TableColumn[];
  readonly rows: readonly JoinedTableRow[];
  readonly rowOrder: readonly string[];
  readonly snapshot: SemanticSnapshot;
}

function encoded(value: string): string {
  return encodeURIComponent(value);
}

export function getTableRowEntityId(tableId: string, rowId: string): string {
  return `${tableId}:row:${encoded(rowId)}`;
}

export function getTableCellEntityId(tableId: string, rowId: string, columnId: string): string {
  return `${tableId}:cell:${encoded(rowId)}:${encoded(columnId)}`;
}

function assertTable(table: TableData): void {
  if (!table.id.trim()) throw new Error('Table id must be non-empty.');
  const columnIds = new Set<string>();
  for (const column of table.columns) {
    if (!column.id.trim()) throw new Error(`Table "${table.id}" contains a column with an empty id.`);
    if (columnIds.has(column.id)) throw new Error(`Table "${table.id}" contains duplicate column id "${column.id}".`);
    columnIds.add(column.id);
  }
  const rowIds = new Set<string>();
  for (const row of table.rows) {
    if (!row.id.trim()) throw new Error(`Table "${table.id}" contains a row with an empty id.`);
    if (rowIds.has(row.id)) throw new Error(`Table "${table.id}" contains duplicate row id "${row.id}".`);
    rowIds.add(row.id);
  }
}

function assertColumn(table: TableData, columnId: string | undefined, purpose: string): asserts columnId is string {
  if (!columnId || !table.columns.some((column) => column.id === columnId)) {
    throw new Error(`${purpose} references unknown column "${columnId ?? ''}" in table "${table.id}".`);
  }
}

function evaluateComparison(value: TableCellValue | undefined, predicate: TableComparisonPredicate): boolean {
  const expected = predicate.value;
  const compared = Array.isArray(expected) || value == null || expected == null
    ? undefined
    : compareValues(value, expected as TableCellValue);
  switch (predicate.operator) {
    case 'eq': return value !== null && value !== undefined && Object.is(value, expected);
    case 'neq': return value !== null && value !== undefined && !Object.is(value, expected);
    case 'gt': return typeof value === typeof expected && compared !== undefined && compared > 0;
    case 'gte': return typeof value === typeof expected && compared !== undefined && compared >= 0;
    case 'lt': return typeof value === typeof expected && compared !== undefined && compared < 0;
    case 'lte': return typeof value === typeof expected && compared !== undefined && compared <= 0;
    case 'in': return Array.isArray(expected) && expected.some((candidate) => Object.is(candidate, value));
    case 'not-in': return Array.isArray(expected) && !expected.some((candidate) => Object.is(candidate, value));
    case 'contains': return typeof value === 'string' && typeof expected === 'string' && value.includes(expected);
    case 'is-null': return value === null || value === undefined;
    case 'is-not-null': return value !== null && value !== undefined;
  }
}

export function evaluateTablePredicate(row: TableRow, predicate: TablePredicate): boolean {
  if ('predicates' in predicate) {
    return predicate.operator === 'and'
      ? predicate.predicates.every((child) => evaluateTablePredicate(row, child))
      : predicate.predicates.some((child) => evaluateTablePredicate(row, child));
  }
  return evaluateComparison(row.values[predicate.columnId], predicate);
}

function tableSnapshot(
  table: TableData,
  snapshotId: string,
  visibleOrder: readonly string[],
  filteredOutIds: ReadonlySet<string>
): SemanticSnapshot {
  const visibleSlots = new Map(visibleOrder.map((rowId, index) => [rowId, index]));
  const sourceSlots = new Map(table.rows.map((row, index) => [row.id, index]));
  const entities: EntitySnapshot[] = [];
  for (const row of table.rows) {
    const visible = !filteredOutIds.has(row.id);
    const slot = visible ? visibleSlots.get(row.id) : sourceSlots.get(row.id);
    const rowEntityId = getTableRowEntityId(table.id, row.id);
    entities.push({
      id: rowEntityId,
      kind: 'row',
      role: 'table-row',
      position: { slot },
      visible,
      data: { tableId: table.id, rowId: row.id, values: row.values }
    });
    table.columns.forEach((column, columnIndex) => {
      entities.push({
        id: getTableCellEntityId(table.id, row.id, column.id),
        kind: 'cell',
        role: column.role ?? 'table-cell',
        parentId: rowEntityId,
        position: { slot, rank: columnIndex },
        visible,
        data: { tableId: table.id, rowId: row.id, columnId: column.id, value: row.values[column.id] ?? null }
      });
    });
  }
  return createSemanticSnapshot(snapshotId, entities, { tableId: table.id, rowOrder: visibleOrder });
}

export function compileTableState(table: TableData, snapshotId = `${table.id}:initial`): CompiledTableState {
  assertTable(table);
  const rowOrder = table.rows.map((row) => row.id);
  return {
    tableId: table.id,
    columns: table.columns,
    rows: table.rows,
    rowOrder,
    visibleRowIds: rowOrder,
    filteredOutRowIds: [],
    snapshot: tableSnapshot(table, snapshotId, rowOrder, new Set())
  };
}

function predicateColumns(predicate: TablePredicate): readonly string[] {
  return 'predicates' in predicate
    ? predicate.predicates.flatMap(predicateColumns)
    : [predicate.columnId];
}

export function compileTableFilter(
  table: TableData,
  predicate: TablePredicate,
  snapshotId = `${table.id}:filter`
): CompiledTableState {
  assertTable(table);
  for (const columnId of predicateColumns(predicate)) assertColumn(table, columnId, 'Filter predicate');
  const visibleRows = table.rows.filter((row) => evaluateTablePredicate(row, predicate));
  const visibleIds = visibleRows.map((row) => row.id);
  const visibleSet = new Set(visibleIds);
  const filteredOutIds = table.rows.map((row) => row.id).filter((rowId) => !visibleSet.has(rowId));
  return {
    tableId: table.id,
    columns: table.columns,
    rows: table.rows,
    rowOrder: visibleIds,
    visibleRowIds: visibleIds,
    filteredOutRowIds: filteredOutIds,
    snapshot: tableSnapshot(table, snapshotId, visibleIds, new Set(filteredOutIds))
  };
}

function compareValues(left: TableCellValue | undefined, right: TableCellValue | undefined): number {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  if (typeof left === 'number' && typeof right === 'number') return left - right;
  if (typeof left === 'boolean' && typeof right === 'boolean') return Number(left) - Number(right);
  const leftText = String(left);
  const rightText = String(right);
  return leftText < rightText ? -1 : leftText > rightText ? 1 : 0;
}

export function compileTableSort(
  table: TableData,
  by: readonly TableSortKey[],
  snapshotId = `${table.id}:sort`
): CompiledTableState {
  assertTable(table);
  for (const key of by) assertColumn(table, key.columnId, 'Sort key');
  const sourceIndex = new Map(table.rows.map((row, index) => [row.id, index]));
  const orderedRows = [...table.rows].sort((left, right) => {
    for (const key of by) {
      const compared = compareValues(left.values[key.columnId], right.values[key.columnId]);
      if (compared !== 0) return (key.direction ?? 'asc') === 'desc' ? -compared : compared;
    }
    return (sourceIndex.get(left.id) ?? 0) - (sourceIndex.get(right.id) ?? 0);
  });
  const rowOrder = orderedRows.map((row) => row.id);
  return {
    tableId: table.id,
    columns: table.columns,
    rows: table.rows,
    rowOrder,
    visibleRowIds: rowOrder,
    filteredOutRowIds: [],
    snapshot: tableSnapshot(table, snapshotId, rowOrder, new Set())
  };
}

function joinColumn(table: TableData, side: 'left' | 'right', column: TableColumn): TableColumn {
  return { ...column, id: `${side}.${table.id}.${column.id}` };
}

function joinRowId(joinId: string, leftRowId: string | null, rightRowId: string | null): string {
  const leftPart = leftRowId === null ? 'none' : `value:${encoded(leftRowId)}`;
  const rightPart = rightRowId === null ? 'none' : `value:${encoded(rightRowId)}`;
  return `${joinId}:row:left:${leftPart}:right:${rightPart}`;
}

function joinedValues(
  columns: readonly TableColumn[],
  left: TableData,
  leftRow: TableRow | null,
  right: TableData,
  rightRow: TableRow | null
): Readonly<Record<string, TableCellValue>> {
  const values: Record<string, TableCellValue> = {};
  for (const column of columns) {
    if (column.id.startsWith('left.')) {
      const sourceId = column.id.slice(`left.${left.id}.`.length);
      values[column.id] = leftRow?.values[sourceId] ?? null;
    } else {
      const sourceId = column.id.slice(`right.${right.id}.`.length);
      values[column.id] = rightRow?.values[sourceId] ?? null;
    }
  }
  return values;
}

export function compileTableJoin(spec: TableJoinSpec): JoinResult {
  assertTable(spec.left);
  assertTable(spec.right);
  if (spec.joinType !== 'cross') {
    assertColumn(spec.left, spec.leftKey, 'Join');
    assertColumn(spec.right, spec.rightKey, 'Join');
  }
  const leftOnly = spec.joinType === 'semi' || spec.joinType === 'anti';
  const columns = leftOnly
    ? spec.left.columns.map((column) => joinColumn(spec.left, 'left', column))
    : [
        ...spec.left.columns.map((column) => joinColumn(spec.left, 'left', column)),
        ...spec.right.columns.map((column) => joinColumn(spec.right, 'right', column))
      ];
  const rows: JoinedTableRow[] = [];
  const matchedRightIds = new Set<string>();

  const matchesFor = (leftRow: TableRow): readonly TableRow[] => {
    if (spec.joinType === 'cross') return spec.right.rows;
    const leftValue = leftRow.values[spec.leftKey!];
    if (leftValue == null) return [];
    return spec.right.rows.filter((rightRow) => {
      const rightValue = rightRow.values[spec.rightKey!];
      return rightValue != null && Object.is(leftValue, rightValue);
    });
  };

  const append = (leftRow: TableRow | null, rightRow: TableRow | null): void => {
    const id = joinRowId(spec.id, leftRow?.id ?? null, rightRow?.id ?? null);
    rows.push({
      id,
      leftRowId: leftRow?.id ?? null,
      rightRowId: rightRow?.id ?? null,
      sourceRowIds: [leftRow?.id, rightRow?.id].filter((value): value is string => Boolean(value)),
      values: joinedValues(columns, spec.left, leftRow, spec.right, rightRow)
    });
  };

  for (const leftRow of spec.left.rows) {
    const matches = matchesFor(leftRow);
    matches.forEach((rightRow) => matchedRightIds.add(rightRow.id));
    if (spec.joinType === 'semi') {
      if (matches.length > 0) append(leftRow, null);
    } else if (spec.joinType === 'anti') {
      if (matches.length === 0) append(leftRow, null);
    } else if (matches.length > 0) {
      matches.forEach((rightRow) => append(leftRow, rightRow));
    } else if (spec.joinType === 'left' || spec.joinType === 'full') {
      append(leftRow, null);
    }
  }

  if (spec.joinType === 'right' || spec.joinType === 'full') {
    spec.right.rows.filter((row) => !matchedRightIds.has(row.id)).forEach((rightRow) => append(null, rightRow));
  }

  const outputTable: TableData = { id: spec.id, columns, rows };
  const state = compileTableState(outputTable, `${spec.id}:join`);
  return {
    id: spec.id,
    joinType: spec.joinType,
    columns,
    rows,
    rowOrder: state.rowOrder,
    snapshot: state.snapshot
  };
}

export function compileTableAction(table: TableData, action: TableAction): CompiledTableState | JoinResult {
  if (action.action === 'filter') {
    if (action.target !== table.id) throw new Error(`Filter action targets "${action.target}", not "${table.id}".`);
    return compileTableFilter(table, action.predicate, action.id);
  }
  if (action.action === 'sort') {
    if (action.target !== table.id) throw new Error(`Sort action targets "${action.target}", not "${table.id}".`);
    return compileTableSort(table, action.by, action.id);
  }
  if (action.left.id !== table.id) {
    throw new Error(`Join action uses left table "${action.left.id}", not supplied table "${table.id}".`);
  }
  return compileTableJoin(action);
}
/** Authored membership for a teaching ROWS frame; no SQL parsing or execution. */
export interface TableWindowFrame {
  readonly currentRowId: string;
  readonly memberRowIds: readonly string[];
}

export function validateTableWindowFrame(state: CompiledTableState, frame: TableWindowFrame): void {
  const order = state.rowOrder;
  const members = frame.memberRowIds;
  if (!Array.isArray(members) || !members.length || new Set(members).size !== members.length || !members.includes(frame.currentRowId) || members.some(id => !state.visibleRowIds.includes(id))) throw new Error('Window requires distinct visible members including the current row.');
  const slots = members.map(id => order.indexOf(id));
  if (slots.some((slot, index) => index > 0 && slot !== slots[index - 1] + 1)) throw new Error('ROWS frame members must be consecutive in display order.');
}
