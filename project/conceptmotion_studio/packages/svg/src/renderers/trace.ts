import {
  compileTableTrace,
  resolveLocalizedText,
  tableTraceRefKey,
  type CompiledTableTrace,
  type CompiledTableTraceRelation,
  type ResolvedExplanation,
  type TableColumn,
  type TableRow,
  type TableTraceRef,
  type TableTraceRelationKind,
  type TableTraceSpec,
  type TableTraceView,
} from '@conceptmotion/core';
import { BaseSvgRenderer } from '../base-renderer.js';
import { ensureChild, keyedChildren, round, setAccessibleText, setAttributes, setSvgTransform, setText } from '../dom.js';
import { renderExplanationPanel } from '../explanation.js';
import { routeOrthogonal } from '../layout.js';
import { MotionController } from '../motion.js';
import type { SemanticTheme } from '../theme.js';
import type { RendererRegistration } from '../types.js';
import { formatValue, makeSelectable, renderHeading, truncate } from './shared.js';

export interface TableTraceRendererInput {
  readonly spec: TableTraceSpec;
  readonly trace?: CompiledTableTrace;
  /** Stable authored frame identity. Used only to avoid replaying motion on unrelated React updates. */
  readonly frameId?: string;
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
type TraceMotionKind = 'travel' | 'converge' | 'fade' | 'enter' | 'pulse';
type TraceLocale = 'en' | 'no';

interface TraceMotionCue {
  key: string;
  relationId: string;
  relationKind: TableTraceRelationKind;
  motionKind: TraceMotionKind;
  source: Point;
  target: Point;
  label: string;
  color: string;
  glyph: string;
  delayMs: number;
}

interface RelationEdge {
  key: string;
  relation: CompiledTableTraceRelation;
  source: { ref: TableTraceRef; point: Point };
  target: { ref: TableTraceRef; point: Point };
}

const DESIRED_ROWS = 8;
const DESIRED_COLUMNS = 6;
const MAX_INDIVIDUAL_MOTION_PAIRS = 24;

function refsForView(spec: TableTraceSpec, viewId: string): TableTraceRef[] {
  return spec.relations.flatMap((relation) => [...(relation.from ?? []), ...(relation.to ?? [])]).filter((ref) => ref.viewId === viewId);
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

function accentForKinds(kinds: ReadonlySet<TableTraceRelationKind> | undefined, theme: Pick<SemanticTheme, 'accent' | 'lineage' | 'error' | 'success' | 'info' | 'border'>): string {
  if (!kinds?.size) return theme.border;
  if (kinds.has('drop')) return theme.error;
  if (kinds.has('create')) return theme.success;
  if (kinds.has('use')) return theme.accent;
  if (kinds.has('derive') || kinds.has('map')) return theme.lineage;
  return theme.info;
}

function motionColor(kind: TableTraceRelationKind, theme: SemanticTheme): string {
  if (kind === 'drop') return theme.error;
  if (kind === 'create') return theme.success;
  if (kind === 'derive' || kind === 'map') return theme.lineage;
  if (kind === 'group') return theme.info;
  return theme.accent;
}

function motionKind(kind: TableTraceRelationKind): TraceMotionKind {
  if (kind === 'map') return 'travel';
  if (kind === 'derive' || kind === 'group') return 'converge';
  if (kind === 'drop') return 'fade';
  if (kind === 'create') return 'enter';
  return 'pulse';
}

function motionGlyph(kind: TableTraceRelationKind): string {
  if (kind === 'derive') return 'Σ';
  if (kind === 'group') return '⊂';
  if (kind === 'drop') return '×';
  if (kind === 'create') return '+';
  if (kind === 'map') return '›';
  return '•';
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

function refLabel(spec: TableTraceSpec, ref: TableTraceRef, locale: TraceLocale): string {
  const view = spec.views.find((candidate) => candidate.id === ref.viewId);
  if (!view) return ref.kind;
  if (ref.kind === 'table') return view.table.id;
  if (ref.kind === 'column') {
    const column = view.table.columns.find((candidate) => candidate.id === ref.columnId);
    return resolveLocalizedText(column?.label, locale) || ref.columnId;
  }
  if (ref.kind === 'row') return ref.rowId;
  if (ref.kind === 'cell') {
    const row = view.table.rows.find((candidate) => candidate.id === ref.rowId);
    return truncate(formatValue(row?.values[ref.columnId]), 10);
  }
  const group = spec.groups?.find((candidate) => candidate.viewId === ref.viewId && candidate.id === ref.groupId);
  return resolveLocalizedText(group?.label, locale) || ref.groupId;
}

function averagePoint(points: readonly { point: Point }[]): Point {
  return {
    x: points.reduce((sum, item) => sum + item.point.x, 0) / Math.max(1, points.length),
    y: points.reduce((sum, item) => sum + item.point.y, 0) / Math.max(1, points.length),
  };
}

function relationEdges(
  trace: CompiledTableTrace,
  active: ReadonlySet<string>,
  layoutByView: ReadonlyMap<string, ViewLayout>,
): RelationEdge[] {
  const drawable = trace.relations.filter((relation) => active.has(relation.id) && (relation.kind === 'map' || relation.kind === 'derive' || relation.kind === 'group'));
  return drawable.flatMap((relation) => {
    const from = (relation.from ?? []).flatMap((ref) => {
      const layout = layoutByView.get(ref.viewId); const point = layout ? refPoint(layout, trace.spec, ref) : undefined;
      return point ? [{ ref, point }] : [];
    });
    const to = (relation.to ?? []).flatMap((ref) => {
      const layout = layoutByView.get(ref.viewId); const point = layout ? refPoint(layout, trace.spec, ref) : undefined;
      return point ? [{ ref, point }] : [];
    });
    const pairs = from.flatMap((source) => to.map((target) => ({ source, target })));
    if (pairs.length <= MAX_INDIVIDUAL_MOTION_PAIRS) return pairs.map((pair, index) => ({ key: `${relation.id}:${index}`, relation, ...pair }));
    if (!from.length || !to.length) return [];
    return [{
      key: `${relation.id}:bundle`,
      relation,
      source: { ref: from[0].ref, point: averagePoint(from) },
      target: { ref: to[0].ref, point: averagePoint(to) },
    }];
  });
}

function relationMotionCues(
  trace: CompiledTableTrace,
  active: ReadonlySet<string>,
  layoutByView: ReadonlyMap<string, ViewLayout>,
  locale: TraceLocale,
  theme: SemanticTheme,
): TraceMotionCue[] {
  const cues: TraceMotionCue[] = [];
  for (const relation of trace.relations) {
    if (!active.has(relation.id)) continue;
    const from = (relation.from ?? []).flatMap((ref) => {
      const layout = layoutByView.get(ref.viewId); const point = layout ? refPoint(layout, trace.spec, ref) : undefined;
      return point ? [{ ref, point }] : [];
    });
    const to = (relation.to ?? []).flatMap((ref) => {
      const layout = layoutByView.get(ref.viewId); const point = layout ? refPoint(layout, trace.spec, ref) : undefined;
      return point ? [{ ref, point }] : [];
    });
    const color = motionColor(relation.kind, theme);
    const kind = motionKind(relation.kind);
    const glyph = motionGlyph(relation.kind);

    if (relation.kind === 'map' || relation.kind === 'derive' || relation.kind === 'group') {
      const pairs = from.flatMap((source) => to.map((target) => ({ source, target })));
      if (pairs.length > MAX_INDIVIDUAL_MOTION_PAIRS && from.length && to.length) {
        cues.push({
          key: `${relation.id}:bundle`, relationId: relation.id, relationKind: relation.kind, motionKind: kind,
          source: averagePoint(from), target: averagePoint(to), label: resolveLocalizedText(relation.label, locale) || relation.kind,
          color, glyph, delayMs: 0,
        });
      } else {
        pairs.forEach((pair, index) => cues.push({
          key: `${relation.id}:${index}`, relationId: relation.id, relationKind: relation.kind, motionKind: kind,
          source: pair.source.point, target: pair.target.point,
          label: refLabel(trace.spec, pair.source.ref, locale), color, glyph, delayMs: Math.min(240, index * 45),
        }));
      }
      continue;
    }

    if (relation.kind === 'drop') {
      from.forEach((source, index) => cues.push({
        key: `${relation.id}:${index}`, relationId: relation.id, relationKind: relation.kind, motionKind: kind,
        source: source.point, target: { x: source.point.x - 18, y: source.point.y },
        label: refLabel(trace.spec, source.ref, locale), color, glyph, delayMs: Math.min(240, index * 45),
      }));
      continue;
    }

    const points = relation.kind === 'create' ? to : from;
    points.forEach((entry, index) => cues.push({
      key: `${relation.id}:${index}`, relationId: relation.id, relationKind: relation.kind, motionKind: kind,
      source: entry.point, target: entry.point,
      label: refLabel(trace.spec, entry.ref, locale), color, glyph, delayMs: Math.min(240, index * 45),
    }));
  }
  return cues;
}

function tokenKeyframes(cue: TraceMotionCue): Keyframe[] {
  const source = `translate(${round(cue.source.x)}px, ${round(cue.source.y)}px)`;
  const target = `translate(${round(cue.target.x)}px, ${round(cue.target.y)}px)`;
  if (cue.motionKind === 'travel') return [
    { transform: source, opacity: 0, offset: 0 },
    { transform: source, opacity: 1, offset: .12 },
    { transform: target, opacity: 1, offset: .78 },
    { transform: target, opacity: 0, offset: 1 },
  ];
  if (cue.motionKind === 'converge') return [
    { transform: source, opacity: 0, offset: 0 },
    { transform: source, opacity: 1, offset: .12 },
    { transform: target, opacity: 1, offset: .7 },
    { transform: target, opacity: 0, offset: 1 },
  ];
  if (cue.motionKind === 'fade') return [
    { transform: source, opacity: 0, offset: 0 },
    { transform: source, opacity: 1, offset: .18 },
    { transform: target, opacity: .7, offset: .68 },
    { transform: target, opacity: 0, offset: 1 },
  ];
  return [
    { transform: target, opacity: 0, offset: 0 },
    { transform: target, opacity: 1, offset: .38 },
    { transform: target, opacity: 0, offset: 1 },
  ];
}

export class TableTraceRenderer extends BaseSvgRenderer<TableTraceRendererInput> {
  private readonly motion = new MotionController();
  private previousFrameKey?: string;
  private previousRelationSignature?: string;

  constructor() {
    super('table-trace');
  }

  protected beforeDestroy(): void {
    this.motion.cancelAll();
    this.previousFrameKey = undefined;
    this.previousRelationSignature = undefined;
  }

  protected render(input: TableTraceRendererInput, initial = false): void {
    const surface = this.surface!;
    const options = this.options;
    const locale: TraceLocale = options.locale === 'no' ? 'no' : 'en';
    const trace = input.trace ?? compileTableTrace(input.spec);
    const allRelationIds = new Set(trace.relations.map((relation) => relation.id));
    const active = new Set(input.activeRelationIds?.filter((id) => allRelationIds.has(id)) ?? [...allRelationIds]);
    const relationSignature = [...active].sort().join('|');
    const frameKey = input.frameId ?? `relations:${relationSignature}`;
    const choreographyChanged = initial || frameKey !== this.previousFrameKey || relationSignature !== this.previousRelationSignature;
    if (this.reducedMotion || choreographyChanged) this.motion.cancelAll();

    const kindsByKey = relationKinds(trace, active);
    const title = resolveLocalizedText(trace.spec.title, locale);
    const description = resolveLocalizedText(trace.spec.description, locale) || `${trace.spec.views.length} table views · ${active.size} active semantic relations.`;
    const top = renderHeading(surface, title, description, options);
    setAccessibleText(surface, title, description);

    const layer = ensureChild(surface.root, 'g[data-role="table-trace"]', 'g', {
      'data-role': 'table-trace',
      'data-frame-id': input.frameId,
      'data-motion-enabled': String(!this.reducedMotion),
    });
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
    const edges = relationEdges(trace, active, layoutByView);
    keyedChildren(relationLayer, 'g[data-role="trace-edge"]', 'g', edges, (edge) => edge.key, (group, edge) => {
      const color = motionColor(edge.relation.kind, surface.theme);
      setAttributes(group, { 'data-role': 'trace-edge', 'data-relation-id': edge.relation.id, 'data-relation-kind': edge.relation.kind });
      const path = ensureChild(group, 'path', 'path');
      setAttributes(path, {
        d: routeOrthogonal(edge.source.point, edge.target.point), fill: 'none', stroke: color,
        'stroke-width': edge.relation.kind === 'derive' ? 2.4 : 1.6,
        'stroke-dasharray': edge.relation.kind === 'group' ? '4 3' : undefined,
        opacity: .78,
      });
      const head = ensureChild(group, 'polygon[data-role="arrowhead"]', 'polygon', { 'data-role': 'arrowhead' });
      const { x, y } = edge.target.point;
      setAttributes(head, { points: `${x - 7},${y - 4} ${x},${y} ${x - 7},${y + 4}`, fill: color });
      if (choreographyChanged && !this.reducedMotion) {
        this.motion.run(path, [{ opacity: .25 }, { opacity: 1 }, { opacity: .78 }], { durationMs: Math.max(320, this.durationMs * 1.6) });
      }
    });

    const refElements = new Map<string, SVGElement>();
    keyedChildren(layer, 'g[data-role="trace-view"]', 'g', layouts, (layout) => layout.view.id, (viewGroup, layout) => {
      setAttributes(viewGroup, { 'data-role': 'trace-view', 'data-view-id': layout.view.id, 'data-view-role': layout.view.role });
      setSvgTransform(viewGroup, layout.x, layout.y, this.reducedMotion, this.durationMs);
      const tableKey = tableTraceRefKey({ viewId: layout.view.id, kind: 'table' });
      refElements.set(tableKey, viewGroup);
      const tableKinds = kindsByKey.get(tableKey);
      const label = ensureChild(viewGroup, 'text[data-role="view-label"]', 'text', { 'data-role': 'view-label', x: 0, y: 13, fill: surface.theme.mutedInk, 'font-size': 10, 'font-weight': 700, 'letter-spacing': .7 });
      setText(label, resolveLocalizedText(layout.view.label, locale) || `${layout.view.role.toUpperCase()} · ${layout.view.table.id}`);
      const outline = ensureChild(viewGroup, 'rect[data-role="table-outline"]', 'rect', { 'data-role': 'table-outline', x: 0, y: layout.headerTop, width: layout.width, height: layout.headerHeight + layout.rows.length * layout.rowHeight + 5, rx: surface.theme.radius, fill: surface.theme.surface, stroke: accentForKinds(tableKinds, surface.theme), 'stroke-width': tableKinds?.size ? 2 : 1 });
      outline.setAttribute('aria-hidden', 'true');
      makeSelectable(viewGroup, tableKey, `Table ${layout.view.table.id}, ${layout.view.role}`, options);

      keyedChildren(viewGroup, 'g[data-role="trace-column"]', 'g', layout.columns, (column) => column.id, (columnGroup, column, index) => {
        const key = tableTraceRefKey({ viewId: layout.view.id, kind: 'column', columnId: column.id });
        refElements.set(key, columnGroup);
        const kinds = kindsByKey.get(key);
        setAttributes(columnGroup, { 'data-role': 'trace-column', 'data-column-id': column.id, 'data-trace-ref': key, 'data-trace-kinds': kinds ? [...kinds].sort().join(' ') : '' });
        setSvgTransform(columnGroup, index * layout.cellWidth, layout.headerTop, true, 0);
        makeSelectable(columnGroup, key, `Column ${column.id}`, options);
        ensureChild(columnGroup, 'rect', 'rect', { width: layout.cellWidth, height: layout.headerHeight, fill: kinds?.size ? surface.theme.accentSubtle : surface.theme.surfaceRaised, stroke: accentForKinds(kinds, surface.theme) });
        const text = ensureChild(columnGroup, 'text', 'text', { x: 7, y: 19, fill: surface.theme.ink, 'font-size': 10, 'font-weight': 650 });
        setText(text, truncate(resolveLocalizedText(column.label, locale) || column.id, 14));
      });

      keyedChildren(viewGroup, 'g[data-role="trace-row"]', 'g', layout.rows, (row) => row.id, (rowGroup, row, rowIndex) => {
        const rowKey = tableTraceRefKey({ viewId: layout.view.id, kind: 'row', rowId: row.id });
        refElements.set(rowKey, rowGroup);
        const rowKinds = kindsByKey.get(rowKey);
        setAttributes(rowGroup, { 'data-role': 'trace-row', 'data-row-id': row.id, 'data-trace-ref': rowKey, 'data-trace-kinds': rowKinds ? [...rowKinds].sort().join(' ') : '' });
        setSvgTransform(rowGroup, 0, layout.rowsTop + rowIndex * layout.rowHeight, this.reducedMotion, this.durationMs);
        makeSelectable(rowGroup, rowKey, `Row ${row.id}`, options);
        ensureChild(rowGroup, 'rect[data-role="row-outline"]', 'rect', { 'data-role': 'row-outline', width: layout.width, height: layout.rowHeight - 4, fill: surface.theme.surface, stroke: accentForKinds(rowKinds, surface.theme), 'stroke-width': rowKinds?.size ? 2 : 1 });
        keyedChildren(rowGroup, 'g[data-role="trace-cell"]', 'g', layout.columns, (column) => column.id, (cellGroup, column, columnIndex) => {
          const cellKey = tableTraceRefKey({ viewId: layout.view.id, kind: 'cell', rowId: row.id, columnId: column.id });
          refElements.set(cellKey, cellGroup);
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
        refElements.set(key, groupNode);
        const y = layout.rowsTop + first * layout.rowHeight - 2;
        setSvgTransform(groupNode, -4, y, true, 0);
        ensureChild(groupNode, 'rect', 'rect', { width: layout.width + 8, height: (last - first + 1) * layout.rowHeight, rx: surface.theme.radius, fill: 'none', stroke: surface.theme.info, 'stroke-width': 2, 'stroke-dasharray': '5 3' });
        const groupLabel = ensureChild(groupNode, 'text', 'text', { x: layout.width - 6, y: 12, fill: surface.theme.info, 'font-size': 9, 'font-weight': 700, 'text-anchor': 'end' });
        setText(groupLabel, resolveLocalizedText(group.label, locale) || group.id);
        makeSelectable(groupNode, key, `Group ${group.id}`, options);
      }

      if (layout.view.table.rows.length > layout.rows.length || layout.view.table.columns.length > layout.columns.length) {
        const footer = ensureChild(viewGroup, 'text[data-role="compact-note"]', 'text', { 'data-role': 'compact-note', x: 0, y: layout.rowsTop + layout.rows.length * layout.rowHeight + 15, fill: surface.theme.mutedInk, 'font-size': 9 });
        setText(footer, `Compact teaching view · ${layout.rows.length}/${layout.view.table.rows.length} rows · ${layout.columns.length}/${layout.view.table.columns.length} columns`);
      }
    });

    const motionLayer = ensureChild(layer, 'g[data-role="trace-motion-layer"]', 'g', {
      'data-role': 'trace-motion-layer',
      'data-cm-transient': 'true',
      'aria-hidden': 'true',
      'pointer-events': 'none',
    });
    layer.append(motionLayer);
    const cues = this.reducedMotion ? [] : relationMotionCues(trace, active, layoutByView, locale, surface.theme);
    const cueDuration = Math.max(420, Math.min(760, this.durationMs * 2.5));
    keyedChildren(motionLayer, 'g[data-role="trace-motion-token"]', 'g', cues, (cue) => cue.key, (token, cue) => {
      setAttributes(token, {
        'data-role': 'trace-motion-token',
        'data-relation-id': cue.relationId,
        'data-relation-kind': cue.relationKind,
        'data-motion': cue.motionKind,
        opacity: 0,
      });
      setSvgTransform(token, cue.target.x, cue.target.y, true, 0);
      token.style.setProperty('transform-box', 'fill-box');
      token.style.setProperty('transform-origin', 'center');
      const visibleLabel = truncate(cue.label || cue.relationKind, 10);
      const tokenWidth = Math.max(30, Math.min(86, 24 + visibleLabel.length * 6));
      ensureChild(token, 'rect[data-role="token-shape"]', 'rect', {
        'data-role': 'token-shape', x: -tokenWidth / 2, y: -10, width: tokenWidth, height: 20, rx: 10,
        fill: surface.theme.surface, stroke: cue.color, 'stroke-width': 2,
      });
      const glyph = ensureChild(token, 'text[data-role="token-glyph"]', 'text', {
        'data-role': 'token-glyph', x: -tokenWidth / 2 + 8, y: 4, fill: cue.color, 'font-size': 10, 'font-weight': 800, 'text-anchor': 'middle',
      });
      setText(glyph, cue.glyph);
      const label = ensureChild(token, 'text[data-role="token-label"]', 'text', {
        'data-role': 'token-label', x: -tokenWidth / 2 + 16, y: 4, fill: surface.theme.ink, 'font-family': surface.theme.monoFontFamily, 'font-size': 9,
      });
      setText(label, visibleLabel);
      if (choreographyChanged) {
        this.motion.run(token, tokenKeyframes(cue), { durationMs: cueDuration, delayMs: cue.delayMs });
      }
    });

    if (choreographyChanged && !this.reducedMotion) {
      const pulseDuration = Math.max(260, Math.min(520, this.durationMs * 1.8));
      for (const relation of trace.relations) {
        if (!active.has(relation.id)) continue;
        const refs = [...(relation.from ?? []), ...(relation.to ?? [])];
        refs.forEach((ref, index) => {
          const element = refElements.get(tableTraceRefKey(ref));
          if (!element) return;
          this.motion.run(element, [{ opacity: 1 }, { opacity: .58 }, { opacity: 1 }], {
            durationMs: pulseDuration,
            delayMs: Math.min(180, index * 35),
          });
        });
      }
    }

    const bottom = Math.max(...layouts.map((layout) => layout.y + layout.height));
    renderExplanationPanel(surface, input.explanation, bottom + 18, options.locale);
    this.previousFrameKey = frameKey;
    this.previousRelationSignature = relationSignature;
  }
}

export const tableTraceRendererRegistration: RendererRegistration<TableTraceRendererInput> = {
  id: 'table.trace',
  family: 'table',
  description: 'Before/after table provenance with semantic relation choreography across cells, rows, columns and groups.',
  create: () => new TableTraceRenderer(),
};

export function registerTableTraceRenderers(registry: { register<Input>(registration: RendererRegistration<Input>): unknown }): void {
  registry.register(tableTraceRendererRegistration);
}
