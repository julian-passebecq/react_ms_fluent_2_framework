import {
  compileTableTrace,
  resolveLocalizedText,
  tableTraceRefKey,
  type CompiledTableTrace,
  type TableColumn,
  type TableRow,
  type TableTraceRef,
  type TableTraceRelationKind,
  type TableTraceSpec,
  type TableTraceView,
  type ResolvedExplanation,
} from '@conceptmotion/core';
import { BaseSvgRenderer } from '../base-renderer.js';
import { ensureChild, keyedChildren, setAccessibleText, setAttributes, setSvgTransform, setText } from '../dom.js';
import { renderExplanationPanel } from '../explanation.js';
import { routeOrthogonal } from '../layout.js';
import type { RendererRegistration } from '../types.js';
import { formatValue, makeSelectable, renderHeading, truncate } from './shared.js';

export interface TableTraceRendererInput {
  readonly spec: TableTraceSpec;
  readonly trace?: CompiledTableTrace;
  /** When omitted all relations are shown. Frames can expose a focused subset. */
  readonly activeRelationIds?: readonly string[];
  readonly explanation?: ResolvedExplanation;
}

interface ViewLayout {
  view: TableTraceView;
  x: number;
  y: number;
  width: number;
  height: number;
  headerTop: number;
  rowsTop: number;
  headerHeight: number;
  rowHeight: number;
  columns: readonly TableColumn[];
  rows: readonly TableRow[];
  cellWidth: number;
}

interface Point { x: number; y: number }

const DESIRED_ROWS = 8;
const DESIRED_COLUMNS = 6;

function refsForView(spec: TableTraceSpec, viewId: string): TableTraceRef[] {
  const refs = spec.relations.flatMap((relation) => [...(relation.from ?? []), ...(relation.to ?? [])]).filter((ref) => ref.viewId === viewId);
  return refs;
}

function compactRows(trace: CompiledTableTrace, view: TableTraceView): readonly TableRow[] {
  const relevant = new Set<string>();
  for (const ref of refsForView(trace.spec, view.id)) {
    if (ref.kind === 'row' || ref.kind === 'cell') relevant.add(ref.rowId);
    if (ref.kind === 'group') {
      const group = trace.spec.groups?.find((candidate) => candidate.viewId === view.id && candidate.id === ref.groupId);
      group?.rowIds.forEach((rowId) => relevant.add(rowId));
    }
  }
  const selected = new Set(relevant);
  for (const row of view.table.rows) {
    if (selected.size >= Math.max(DESIRED_ROWS, relevant.size)) break;
    selected.add(row.id);
  }
  return view.table.rows.filter((row) => selected.has(row.id));
}

function compactColumns(trace: CompiledTableTrace, view: TableTraceView): readonly TableColumn[] {
  const relevant = new Set<string>();
  for (const ref of refsForView(trace.spec, view.id)) {
    if (ref.kind === 'column' || ref.kind === 'cell') relevant.add(ref.columnId);
  }
  const selected = new Set(relevant);
  for (const column of view.table.columns) {
    if (selected.size >= Math.max(DESIRED_COLUMNS, relevant.size)) break;
    selected.add(column.id);
  }
  return view.table.columns.filter((column) => selected.has(column.id));
}

function layoutView(trace: CompiledTableTrace, view: TableTraceView, x: number, y: number, width: number): ViewLayout {
  const columns = compactColumns(trace, view);
  const rows = compactRows(trace, view);
  const headerTop = 24;
  const headerHeight = 30;
  const rowHeight = 31;
  const rowsTop = headerTop + headerHeight + 5;
  const footer = view.table.rows.length > rows.length || view.table.columns.length > columns.length ? 22 : 0;
  return {
    view,
    x,
    y,
    width,
    height: rowsTop + rows.length * rowHeight + footer,
    headerTop,
    rowsTop,
    headerHeight,
    rowHeight,
    columns,
    rows,
    cellWidth: width / Math.max(1, columns.length),
  };
}

function relationKinds(trace: CompiledTableTrace, active: ReadonlySet<string>): Map<string, Set<TableTraceRelationKind>> {
  const result = new Map<string, Set<TableTraceRelationKind>>();
  for (const relation of trace.relations) {
    if (!active.has(relation.id)) continue;
    for (const ref of [...(relation.from ?? []), ...(relation.to ?? [])]) {
      const key = tableTraceRefKey(ref);
      const kinds = result.get(key) ?? new Set<TableTraceRelationKind>();
      kinds.add(relation.kind);
      result.set(key, kinds);
    }
  }
  return result;
}

function accentForKinds(kinds: ReadonlySet<TableTraceRelationKind> | undefined, theme: { accent: string; lineage: string; error: string; success: string; info: string; border: string }): string {
  if (!kinds?.size) return theme.border;
  if (kinds.has('drop')) return theme.error;
  if (kinds.has('create')) return theme.success;
  if (kinds.has('use')) return theme.accent;
  if (kinds.has('derive') || kinds.has('map')) return theme.lineage;
  return theme.info;
}

function refPoint(layout: ViewLayout, spec: TableTraceSpec, ref: TableTraceRef): Point | undefined {
  const input = layout.view.role === 'input';
  const edgeX = input ? layout.x + layout.width : layout.x;
  if (ref.kind === 'table') return { x: edgeX, y: layout.y + layout.height / 2 };
  if (ref.kind === 'column') {
    const index = layout.columns.findIndex((column) => column.id === ref.columnId);
    if (index < 0) return undefined;
    return { x: layout.x + (index + .5) * layout.cellWidth, y: layout.y + layout.headerTop + layout.headerHeight / 2 };
  }
  if (ref.kind === 'row' || ref.kind === 'cell') {
    const rowIndex = layout.rows.findIndex((row) => row.id === ref.rowId);
    if (rowIndex < 0) return undefined;
    const y = layout.y + layout.rowsTop + rowIndex * layout.rowHeight + (layout.rowHeight - 4) / 2;
    if (ref.kind === 'row') return { x: edgeX, y };
    const columnIndex = layout.columns.findIndex((column) => column.id === ref.columnId);
    if (columnIndex < 0) return undefined;
    return {
      x: layout.x + columnIndex * layout.cellWidth + (input ? layout.cellWidth : 0),
      y,
    };
  }
  const group = spec.groups?.find((candidate) => candidate.viewId === ref.viewId && candidate.id === ref.groupId);
  if (!group) return undefined;
  const positions = group.rowIds.map((rowId) => layout.rows.findIndex((row) => row.id === rowId)).filter((index) => index >= 0);
  if (!positions.length) return undefined;
  const average = positions.reduce((sum, value) => sum + value, 0) / positions.length;
  return { x: edgeX, y: layout.y + layout.rowsTop + average * layout.rowHeight + (layout.rowHeight - 4) / 2 };
}

export class TableTraceRenderer extends BaseSvgRenderer<TableTraceRendererInput> {
  constructor() {
    super('table-trace');
  }

  protected render(input: TableTraceRendererInput): void {
    const surface = this.surface!;
    const options = this.options;
    const trace = input.trace ?? compileTableTrace(input.spec);
    const allRelationIds = new Set(trace.relations.map((relation) => relation.id));
    const active = new Set(input.activeRelationIds?.filter((id) => allRelationIds.has(id)) ?? [...allRelationIds]);
    const kindsByKey = relationKinds(trace, active);
    const title = resolveLocalizedText(trace.spec.title, options.locale ?? 'en');
    const description = resolveLocalizedText(trace.spec.description, options.locale ?? 'en') || `${trace.spec.views.length} table views · ${active.size} active semantic relations.`;
    const top = renderHeading(surface, title, description, options);
    setAccessibleText(surface, title, description);

    const layer = ensureChild(surface.root, 'g[data-role="table-trace"]', 'g', { 'data-role': 'table-trace' });
    const inputs = trace.spec.views.filter((view) => view.role === 'input');
    const output = trace.spec.views.find((view) => view.role === 'output')!;
    const gap = Math.max(120, Math.min(190, surface.viewport.width * .19));
    const tableWidth = Math.max(260, (surface.viewport.width - 40 - gap) / 2);
    const leftX = 20;
    const rightX = surface.viewport.width - tableWidth - 20;
    const bodyTop = top + 22;

    const inputLayouts: ViewLayout[] = [];
    let inputY = bodyTop;
    for (const view of inputs) {
      const layout = layoutView(trace, view, leftX, inputY, tableWidth);
      inputLayouts.push(layout);
      inputY += layout.height + 22;
    }
    const outputSeed = layoutView(trace, output, rightX, bodyTop, tableWidth);
    const inputHeight = Math.max(0, inputY - bodyTop - 22);
    const outputY = bodyTop + Math.max(0, (inputHeight - outputSeed.height) / 2);
    const outputLayout = { ...outputSeed, y: outputY };
    const layouts = [...inputLayouts, outputLayout];
    const layoutByView = new Map(layouts.map((layout) => [layout.view.id, layout]));

    const relationLayer = ensureChild(layer, 'g[data-role="trace-relations"]', 'g', { 'data-role': 'trace-relations' });
    const drawable = trace.relations.filter((relation) => active.has(relation.id) && (relation.kind === 'map' || relation.kind === 'derive' || relation.kind === 'group'));
    const edges = drawable.flatMap((relation) => {
      const from = (relation.from ?? []).flatMap((ref) => {
        const layout = layoutByView.get(ref.viewId); const point = layout ? refPoint(layout, trace.spec, ref) : undefined;
        return point ? [{ ref, point }] : [];
      });
      const to = (relation.to ?? []).flatMap((ref) => {
        const layout = layoutByView.get(ref.viewId); const point = layout ? refPoint(layout, trace.spec, ref) : undefined;
        return point ? [{ ref, point }] : [];
      });
      const pairs = from.flatMap((source) => to.map((target) => ({ source, target })));
      if (pairs.length <= 24) return pairs.map((pair, index) => ({ key: `${relation.id}:${index}`, relation, ...pair }));
      const average = (points: readonly { point: Point }[]): Point => ({ x: points.reduce((sum, item) => sum + item.point.x, 0) / points.length, y: points.reduce((sum, item) => sum + item.point.y, 0) / points.length });
      return [{ key: `${relation.id}:bundle`, relation, source: { ref: from[0].ref, point: average(from) }, target: { ref: to[0].ref, point: average(to) } }];
    });
    keyedChildren(relationLayer, 'g[data-role="trace-edge"]', 'g', edges, (edge) => edge.key, (group, edge) => {
      setAttributes(group, { 'data-role': 'trace-edge', 'data-relation-id': edge.relation.id, 'data-relation-kind': edge.relation.kind });
      const path = ensureChild(group, 'path', 'path');
      setAttributes(path, { d: routeOrthogonal(edge.source.point, edge.target.point), fill: 'none', stroke: edge.relation.kind === 'derive' ? surface.theme.lineage : surface.theme.accent, 'stroke-width': edge.relation.kind === 'derive' ? 2.4 : 1.6, 'stroke-dasharray': edge.relation.kind === 'group' ? '4 3' : undefined, opacity: .78 });
      const head = ensureChild(group, 'polygon[data-role="arrowhead"]', 'polygon', { 'data-role': 'arrowhead' });
      const { x, y } = edge.target.point;
      setAttributes(head, { points: `${x - 7},${y - 4} ${x},${y} ${x - 7},${y + 4}`, fill: edge.relation.kind === 'derive' ? surface.theme.lineage : surface.theme.accent });
    });

    keyedChildren(layer, 'g[data-role="trace-view"]', 'g', layouts, (layout) => layout.view.id, (viewGroup, layout) => {
      setAttributes(viewGroup, { 'data-role': 'trace-view', 'data-view-id': layout.view.id, 'data-view-role': layout.view.role });
      setSvgTransform(viewGroup, layout.x, layout.y, this.reducedMotion, this.durationMs);
      const tableKey = tableTraceRefKey({ viewId: layout.view.id, kind: 'table' });
      const tableKinds = kindsByKey.get(tableKey);
      const label = ensureChild(viewGroup, 'text[data-role="view-label"]', 'text', { 'data-role': 'view-label', x: 0, y: 13, fill: surface.theme.mutedInk, 'font-size': 10, 'font-weight': 700, 'letter-spacing': .7 });
      setText(label, resolveLocalizedText(layout.view.label, options.locale ?? 'en') || `${layout.view.role.toUpperCase()} · ${layout.view.table.id}`);
      const outline = ensureChild(viewGroup, 'rect[data-role="table-outline"]', 'rect', { 'data-role': 'table-outline', x: 0, y: layout.headerTop, width: layout.width, height: layout.headerHeight + layout.rows.length * layout.rowHeight + 5, rx: surface.theme.radius, fill: surface.theme.surface, stroke: accentForKinds(tableKinds, surface.theme), 'stroke-width': tableKinds?.size ? 2 : 1 });
      outline.setAttribute('aria-hidden', 'true');
      makeSelectable(viewGroup, tableKey, `Table ${layout.view.table.id}, ${layout.view.role}`, options);

      keyedChildren(viewGroup, 'g[data-role="trace-column"]', 'g', layout.columns, (column) => column.id, (columnGroup, column, index) => {
        const key = tableTraceRefKey({ viewId: layout.view.id, kind: 'column', columnId: column.id });
        const kinds = kindsByKey.get(key);
        setAttributes(columnGroup, { 'data-role': 'trace-column', 'data-column-id': column.id, 'data-trace-ref': key, 'data-trace-kinds': kinds ? [...kinds].sort().join(' ') : '' });
        setSvgTransform(columnGroup, index * layout.cellWidth, layout.headerTop, true, 0);
        makeSelectable(columnGroup, key, `Column ${column.id}`, options);
        ensureChild(columnGroup, 'rect', 'rect', { width: layout.cellWidth, height: layout.headerHeight, fill: kinds?.size ? surface.theme.accentSubtle : surface.theme.surfaceRaised, stroke: accentForKinds(kinds, surface.theme) });
        const text = ensureChild(columnGroup, 'text', 'text', { x: 7, y: 19, fill: surface.theme.ink, 'font-size': 10, 'font-weight': 650 });
        setText(text, truncate(resolveLocalizedText(column.label, options.locale ?? 'en') || column.id, 14));
      });

      keyedChildren(viewGroup, 'g[data-role="trace-row"]', 'g', layout.rows, (row) => row.id, (rowGroup, row, rowIndex) => {
        const rowKey = tableTraceRefKey({ viewId: layout.view.id, kind: 'row', rowId: row.id });
        const rowKinds = kindsByKey.get(rowKey);
        setAttributes(rowGroup, { 'data-role': 'trace-row', 'data-row-id': row.id, 'data-trace-ref': rowKey, 'data-trace-kinds': rowKinds ? [...rowKinds].sort().join(' ') : '' });
        setSvgTransform(rowGroup, 0, layout.rowsTop + rowIndex * layout.rowHeight, this.reducedMotion, this.durationMs);
        makeSelectable(rowGroup, rowKey, `Row ${row.id}`, options);
        ensureChild(rowGroup, 'rect[data-role="row-outline"]', 'rect', { 'data-role': 'row-outline', width: layout.width, height: layout.rowHeight - 4, fill: surface.theme.surface, stroke: accentForKinds(rowKinds, surface.theme), 'stroke-width': rowKinds?.size ? 2 : 1 });
        keyedChildren(rowGroup, 'g[data-role="trace-cell"]', 'g', layout.columns, (column) => column.id, (cellGroup, column, columnIndex) => {
          const cellKey = tableTraceRefKey({ viewId: layout.view.id, kind: 'cell', rowId: row.id, columnId: column.id });
          const cellKinds = kindsByKey.get(cellKey);
          setAttributes(cellGroup, { 'data-role': 'trace-cell', 'data-column-id': column.id, 'data-trace-ref': cellKey, 'data-trace-kinds': cellKinds ? [...cellKinds].sort().join(' ') : '' });
          setSvgTransform(cellGroup, columnIndex * layout.cellWidth, 0, true, 0);
          makeSelectable(cellGroup, cellKey, `Cell ${row.id}, ${column.id}`, options);
          ensureChild(cellGroup, 'rect', 'rect', { width: layout.cellWidth, height: layout.rowHeight - 4, fill: cellKinds?.size ? surface.theme.accentSubtle : 'transparent', stroke: cellKinds?.size ? accentForKinds(cellKinds, surface.theme) : 'none', 'stroke-width': cellKinds?.size ? 2 : 0 });
          const text = ensureChild(cellGroup, 'text', 'text', { x: 7, y: 18, fill: cellKinds?.has('drop') ? surface.theme.error : surface.theme.ink, 'font-family': surface.theme.monoFontFamily, 'font-size': 10, 'text-decoration': cellKinds?.has('drop') ? 'line-through' : undefined });
          setText(text, truncate(formatValue(row.values[column.id]), 14));
        });
      });

      for (const group of trace.spec.groups?.filter((candidate) => candidate.viewId === layout.view.id) ?? []) {
        const key = tableTraceRefKey({ viewId: layout.view.id, kind: 'group', groupId: group.id });
        if (!kindsByKey.has(key)) continue;
        const indexes = group.rowIds.map((rowId) => layout.rows.findIndex((row) => row.id === rowId)).filter((index) => index >= 0);
        if (!indexes.length) continue;
        const first = Math.min(...indexes); const last = Math.max(...indexes);
        const groupNode = ensureChild(viewGroup, `g[data-group-id="${group.id}"]`, 'g', { 'data-role': 'trace-group', 'data-group-id': group.id, 'data-trace-ref': key });
        const y = layout.rowsTop + first * layout.rowHeight - 2;
        setSvgTransform(groupNode, -4, y, true, 0);
        ensureChild(groupNode, 'rect', 'rect', { width: layout.width + 8, height: (last - first + 1) * layout.rowHeight, rx: surface.theme.radius, fill: 'none', stroke: surface.theme.info, 'stroke-width': 2, 'stroke-dasharray': '5 3' });
        const groupLabel = ensureChild(groupNode, 'text', 'text', { x: layout.width - 6, y: 12, fill: surface.theme.info, 'font-size': 9, 'font-weight': 700, 'text-anchor': 'end' });
        setText(groupLabel, resolveLocalizedText(group.label, options.locale ?? 'en') || group.id);
        makeSelectable(groupNode, key, `Group ${group.id}`, options);
      }

      if (layout.view.table.rows.length > layout.rows.length || layout.view.table.columns.length > layout.columns.length) {
        const footer = ensureChild(viewGroup, 'text[data-role="compact-note"]', 'text', { 'data-role': 'compact-note', x: 0, y: layout.rowsTop + layout.rows.length * layout.rowHeight + 15, fill: surface.theme.mutedInk, 'font-size': 9 });
        setText(footer, `Compact teaching view · ${layout.rows.length}/${layout.view.table.rows.length} rows · ${layout.columns.length}/${layout.view.table.columns.length} columns`);
      }
    });

    const bottom = Math.max(...layouts.map((layout) => layout.y + layout.height));
    renderExplanationPanel(surface, input.explanation, bottom + 18, options.locale);
  }
}

export const tableTraceRendererRegistration: RendererRegistration<TableTraceRendererInput> = {
  id: 'table.trace',
  family: 'table',
  description: 'Before/after table provenance with cell, row, column and group-level semantic relations.',
  create: () => new TableTraceRenderer(),
};

export function registerTableTraceRenderers(registry: { register<Input>(registration: RendererRegistration<Input>): unknown }): void {
  registry.register(tableTraceRendererRegistration);
}
