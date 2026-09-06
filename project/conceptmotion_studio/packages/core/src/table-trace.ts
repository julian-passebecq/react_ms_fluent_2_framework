import type { LocalizedText } from './localization';
import {
  compileTableState,
  getTableCellEntityId,
  getTableRowEntityId,
  type TableData,
} from './table';

export type TableTraceViewRole = 'input' | 'output';

export interface TableTraceView {
  readonly id: string;
  readonly role: TableTraceViewRole;
  readonly table: TableData;
  readonly label?: LocalizedText;
}

export interface TableTraceGroup {
  readonly id: string;
  readonly viewId: string;
  readonly rowIds: readonly string[];
  readonly label?: LocalizedText;
}

export type TableTraceRef =
  | { readonly viewId: string; readonly kind: 'table' }
  | { readonly viewId: string; readonly kind: 'row'; readonly rowId: string }
  | { readonly viewId: string; readonly kind: 'column'; readonly columnId: string }
  | { readonly viewId: string; readonly kind: 'cell'; readonly rowId: string; readonly columnId: string }
  | { readonly viewId: string; readonly kind: 'group'; readonly groupId: string };

export type TableTraceRelationKind = 'use' | 'map' | 'drop' | 'create' | 'derive' | 'group';

export interface TableTraceRelation {
  readonly id: string;
  readonly kind: TableTraceRelationKind;
  readonly from?: readonly TableTraceRef[];
  readonly to?: readonly TableTraceRef[];
  readonly label?: LocalizedText;
}

export interface TableTraceSpec {
  readonly kind: 'table-trace';
  readonly version: string;
  readonly id: string;
  readonly title: LocalizedText;
  readonly description?: LocalizedText;
  readonly views: readonly TableTraceView[];
  readonly groups?: readonly TableTraceGroup[];
  readonly relations: readonly TableTraceRelation[];
}

export interface CompiledTableTraceRelation extends TableTraceRelation {
  readonly fromKeys: readonly string[];
  readonly toKeys: readonly string[];
  readonly fromEntityIds: readonly string[];
  readonly toEntityIds: readonly string[];
}

export interface CompiledTableTrace {
  readonly spec: TableTraceSpec;
  readonly relations: readonly CompiledTableTraceRelation[];
  /** View-scoped IDs used by renderers and explanation focus. */
  readonly referenceKeys: readonly string[];
  /** Underlying semantic table entity IDs; stable across before/after views when table IDs are stable. */
  readonly semanticEntityIds: readonly string[];
}

function encoded(value: string): string {
  return encodeURIComponent(value);
}

export function tableTraceRefKey(ref: TableTraceRef): string {
  const base = `trace:${encoded(ref.viewId)}`;
  switch (ref.kind) {
    case 'table': return `${base}:table`;
    case 'row': return `${base}:row:${encoded(ref.rowId)}`;
    case 'column': return `${base}:column:${encoded(ref.columnId)}`;
    case 'cell': return `${base}:cell:${encoded(ref.rowId)}:${encoded(ref.columnId)}`;
    case 'group': return `${base}:group:${encoded(ref.groupId)}`;
  }
}

function tableForRef(spec: TableTraceSpec, ref: TableTraceRef): TableData {
  const view = spec.views.find((candidate) => candidate.id === ref.viewId);
  if (!view) throw new Error(`Table trace reference uses unknown view "${ref.viewId}".`);
  return view.table;
}

function groupForRef(spec: TableTraceSpec, ref: Extract<TableTraceRef, { kind: 'group' }>): TableTraceGroup {
  const group = spec.groups?.find((candidate) => candidate.viewId === ref.viewId && candidate.id === ref.groupId);
  if (!group) throw new Error(`Table trace reference uses unknown group "${ref.groupId}" in view "${ref.viewId}".`);
  return group;
}

export function tableTraceSemanticEntityId(spec: TableTraceSpec, ref: TableTraceRef): string {
  const table = tableForRef(spec, ref);
  switch (ref.kind) {
    case 'table': return `${table.id}:table`;
    case 'row': return getTableRowEntityId(table.id, ref.rowId);
    case 'column': return `${table.id}:column:${encoded(ref.columnId)}`;
    case 'cell': return getTableCellEntityId(table.id, ref.rowId, ref.columnId);
    case 'group': return `${table.id}:group:${encoded(groupForRef(spec, ref).id)}`;
  }
}

function assertRef(spec: TableTraceSpec, ref: TableTraceRef): void {
  const table = tableForRef(spec, ref);
  if (ref.kind === 'table') return;
  if (ref.kind === 'row') {
    if (!table.rows.some((row) => row.id === ref.rowId)) throw new Error(`Table trace row "${ref.rowId}" does not exist in view "${ref.viewId}".`);
    return;
  }
  if (ref.kind === 'column') {
    if (!table.columns.some((column) => column.id === ref.columnId)) throw new Error(`Table trace column "${ref.columnId}" does not exist in view "${ref.viewId}".`);
    return;
  }
  if (ref.kind === 'cell') {
    if (!table.rows.some((row) => row.id === ref.rowId)) throw new Error(`Table trace cell references unknown row "${ref.rowId}" in view "${ref.viewId}".`);
    if (!table.columns.some((column) => column.id === ref.columnId)) throw new Error(`Table trace cell references unknown column "${ref.columnId}" in view "${ref.viewId}".`);
    return;
  }
  groupForRef(spec, ref);
}

function assertRelationShape(relation: TableTraceRelation): void {
  const fromCount = relation.from?.length ?? 0;
  const toCount = relation.to?.length ?? 0;
  switch (relation.kind) {
    case 'use':
    case 'drop':
      if (fromCount < 1 || toCount !== 0) throw new Error(`Table trace relation "${relation.id}" (${relation.kind}) requires from references and no to references.`);
      break;
    case 'create':
      if (fromCount !== 0 || toCount < 1) throw new Error(`Table trace relation "${relation.id}" (create) requires to references and no from references.`);
      break;
    case 'map':
    case 'derive':
      if (fromCount < 1 || toCount < 1) throw new Error(`Table trace relation "${relation.id}" (${relation.kind}) requires both from and to references.`);
      break;
    case 'group':
      if (fromCount < 1 || toCount !== 1 || relation.to?.[0]?.kind !== 'group') {
        throw new Error(`Table trace relation "${relation.id}" (group) requires source references and exactly one group target.`);
      }
      break;
  }
}

/**
 * Validate a language-neutral educational table transformation trace.
 *
 * The compiler intentionally does not execute pandas/SQL/Polars/Spark code. Runtime
 * adapters may emit this trace later; authored examples can use the same contract now.
 */
export function compileTableTrace(spec: TableTraceSpec): CompiledTableTrace {
  if (!spec.id.trim()) throw new Error('Table trace id must be non-empty.');
  if (!spec.views.length) throw new Error('Table trace requires at least one input view and one output view.');
  const viewIds = new Set<string>();
  let inputCount = 0;
  let outputCount = 0;
  for (const view of spec.views) {
    if (!view.id.trim()) throw new Error('Table trace view id must be non-empty.');
    if (viewIds.has(view.id)) throw new Error(`Table trace contains duplicate view id "${view.id}".`);
    viewIds.add(view.id);
    if (view.role === 'input') inputCount += 1;
    else outputCount += 1;
    compileTableState(view.table, `${spec.id}:${view.id}`);
  }
  if (inputCount < 1 || outputCount !== 1) throw new Error('Table trace requires at least one input view and exactly one output view.');

  const groupIds = new Set<string>();
  for (const group of spec.groups ?? []) {
    const groupKey = `${group.viewId}:${group.id}`;
    if (!group.id.trim()) throw new Error('Table trace group id must be non-empty.');
    if (groupIds.has(groupKey)) throw new Error(`Table trace contains duplicate group "${group.id}" in view "${group.viewId}".`);
    groupIds.add(groupKey);
    const view = spec.views.find((candidate) => candidate.id === group.viewId);
    if (!view) throw new Error(`Table trace group "${group.id}" uses unknown view "${group.viewId}".`);
    if (!group.rowIds.length) throw new Error(`Table trace group "${group.id}" must contain at least one row.`);
    for (const rowId of group.rowIds) {
      if (!view.table.rows.some((row) => row.id === rowId)) throw new Error(`Table trace group "${group.id}" references unknown row "${rowId}".`);
    }
  }

  const relationIds = new Set<string>();
  const referenceKeys = new Set<string>();
  const semanticEntityIds = new Set<string>();
  const relations = spec.relations.map((relation): CompiledTableTraceRelation => {
    if (!relation.id.trim()) throw new Error('Table trace relation id must be non-empty.');
    if (relationIds.has(relation.id)) throw new Error(`Table trace contains duplicate relation id "${relation.id}".`);
    relationIds.add(relation.id);
    assertRelationShape(relation);
    const from = relation.from ?? [];
    const to = relation.to ?? [];
    [...from, ...to].forEach((ref) => {
      assertRef(spec, ref);
      referenceKeys.add(tableTraceRefKey(ref));
      semanticEntityIds.add(tableTraceSemanticEntityId(spec, ref));
    });
    return {
      ...relation,
      fromKeys: from.map(tableTraceRefKey),
      toKeys: to.map(tableTraceRefKey),
      fromEntityIds: from.map((ref) => tableTraceSemanticEntityId(spec, ref)),
      toEntityIds: to.map((ref) => tableTraceSemanticEntityId(spec, ref)),
    };
  });

  return {
    spec,
    relations,
    referenceKeys: [...referenceKeys].sort(),
    semanticEntityIds: [...semanticEntityIds].sort(),
  };
}
