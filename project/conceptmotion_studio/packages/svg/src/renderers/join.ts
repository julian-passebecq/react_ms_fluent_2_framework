import {
  compileTableJoin,
  resolveLocalizedText,
  type JoinResult,
  type LocalizedText,
  type TableData,
  type TableJoinSpec,
  type TableRow,
  type ResolvedExplanation,
} from '@conceptmotion/core';
import { renderExplanationPanel } from '../explanation.js';

import { BaseSvgRenderer } from '../base-renderer.js';
import {
  ensureChild,
  keyedChildren,
  setAccessibleText,
  setAttributes,
  setSvgTransform,
  setText,
} from '../dom.js';
import { routeOrthogonal } from '../layout.js';
import type { RendererRegistration } from '../types.js';
import { formatValue, localText, makeSelectable, renderHeading, truncate } from './shared.js';

export interface JoinRendererInput {
  explanation?: ResolvedExplanation;
  spec: TableJoinSpec;
  result?: JoinResult;
  /** Number of output rows currently revealed; omitted means all. */
  revealCount?: number;
  title?: LocalizedText;
  description?: LocalizedText;
}

interface SourceRowLayout {
  key: string;
  side: 'left' | 'right';
  row: TableRow;
  table: TableData;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class JoinRenderer extends BaseSvgRenderer<JoinRendererInput> {
  constructor() {
    super('join');
  }

  protected render(input: JoinRendererInput): void {
    const surface = this.surface!;
    const options = this.options;
    const focus = new Set(input.explanation?.step.focus.entityIds ?? []);
    const result = input.result ?? compileTableJoin(input.spec);
    const visibleRows = result.rows.slice(0, input.revealCount ?? result.rows.length);
    const title = localText(input.title, options) || `${input.spec.joinType.toUpperCase()} join fan-out`;
    const nullExtended = visibleRows.filter((row) => row.leftRowId === null || row.rightRowId === null).length;
    const description =
      localText(input.description, options) ||
      `${visibleRows.length} result rows from ${input.spec.left.rows.length} left and ${input.spec.right.rows.length} right rows; ${nullExtended} NULL-extended.`;
    const top = renderHeading(surface, title, description, options);
    setAccessibleText(surface, title, description);

    const layer = ensureChild(surface.root, 'g[data-role="join"]', 'g', { 'data-role': 'join' });
    const sourceWidth = Math.max(140, Math.min(210, (surface.viewport.width - 420) / 2));
    const outputWidth = Math.max(260, surface.viewport.width - sourceWidth * 2 - 100);
    const rowHeight = 31;
    const leftX = 20;
    const rightX = leftX + sourceWidth + 26;
    const outputX = surface.viewport.width - outputWidth - 20;
    const bodyTop = top + 30;

    const renderTableLabel = (role: string, x: number, label: string): void => {
      const text = ensureChild(layer, `text[data-role="${role}"]`, 'text', {
        'data-role': role,
        x,
        y: top + 14,
        fill: surface.theme.mutedInk,
        'font-size': 10,
        'font-weight': 700,
        'letter-spacing': 0.8,
      });
      setText(text, label);
    };
    renderTableLabel('left-label', leftX, `LEFT · ${input.spec.left.id}`);
    renderTableLabel('right-label', rightX, `RIGHT · ${input.spec.right.id}`);
    renderTableLabel('output-label', outputX, `OUTPUT · ${result.joinType.toUpperCase()}`);

    const sources: SourceRowLayout[] = [
      ...input.spec.left.rows.map((row, index) => ({
        key: `left:${row.id}`,
        side: 'left' as const,
        row,
        table: input.spec.left,
        x: leftX,
        y: bodyTop + index * rowHeight,
        width: sourceWidth,
        height: rowHeight - 5,
      })),
      ...input.spec.right.rows.map((row, index) => ({
        key: `right:${row.id}`,
        side: 'right' as const,
        row,
        table: input.spec.right,
        x: rightX,
        y: bodyTop + index * rowHeight,
        width: sourceWidth,
        height: rowHeight - 5,
      })),
    ];
    const sourceLayouts = new Map(sources.map((row) => [row.key, row]));

    const edges = visibleRows.flatMap((row, outputIndex) => {
      const target = { x: outputX, y: bodyTop + outputIndex * rowHeight + (rowHeight - 5) / 2 };
      return [
        row.leftRowId
          ? { key: `${row.id}:left`, sourceKey: `left:${row.leftRowId}`, target, resultId: row.id, side: 'left' as const }
          : undefined,
        row.rightRowId
          ? { key: `${row.id}:right`, sourceKey: `right:${row.rightRowId}`, target, resultId: row.id, side: 'right' as const }
          : undefined,
      ].filter((edge): edge is NonNullable<typeof edge> => Boolean(edge));
    });

    keyedChildren(
      layer,
      'path[data-role="lineage"]',
      'path',
      edges,
      (edge) => edge.key,
      (path, edge) => {
        const source = sourceLayouts.get(edge.sourceKey)!;
        const sourcePoint = { x: source.x + source.width, y: source.y + source.height / 2 };
        setAttributes(path, {
          'data-role': 'lineage',
          'data-source-row': edge.sourceKey,
          'data-result-row': edge.resultId,
          d: routeOrthogonal(sourcePoint, edge.target),
          fill: 'none',
          stroke: edge.side === 'left' ? surface.theme.accent : surface.theme.lineage,
          'stroke-width': focus.has(edge.sourceKey) || focus.has(edge.resultId) ? 3 : 1.5,
          'stroke-dasharray': edge.side === 'right' ? '4 3' : undefined,
          opacity: 0.72,
        });
      },
    );

    keyedChildren(
      layer,
      'g[data-role="source-row"]',
      'g',
      sources,
      (row) => row.key,
      (group, source, _index, entering) => {
        setAttributes(group, {
          'data-role': 'source-row',
          'data-side': source.side,
          'data-row-id': source.row.id,
          'data-explanation-focused': String(focus.has(source.key)),
          'data-entering': entering ? 'true' : undefined,
        });
        setSvgTransform(group, source.x, source.y, this.reducedMotion, this.durationMs);
        makeSelectable(group, source.key, `${source.side} source row ${source.row.id}`, options);
        const rect = ensureChild(group, 'rect', 'rect', {
          width: source.width,
          height: source.height,
          rx: 4,
          fill: options.selectedId === source.key || focus.has(source.key) ? surface.theme.accentSubtle : surface.theme.surface,
          stroke: options.selectedId === source.key || focus.has(source.key) ? surface.theme.accent : surface.theme.border,
        });
        rect.setAttribute('aria-hidden', 'true');
        const keyColumn = source.side === 'left' ? input.spec.leftKey : input.spec.rightKey;
        const text = ensureChild(group, 'text[data-role="value"]', 'text', {
          'data-role': 'value',
          x: 9,
          y: 17,
          fill: surface.theme.ink,
          'font-size': 10,
          'font-family': surface.theme.monoFontFamily,
        });
        const keyValue = keyColumn ? source.row.values[keyColumn] : source.row.id;
        setText(text, `${truncate(source.row.id, 9)} · ${truncate(formatValue(keyValue), 12)}`);
      },
    );

    keyedChildren(
      layer,
      'g[data-role="result-row"]',
      'g',
      visibleRows,
      (row) => row.id,
      (group, row, index, entering) => {
        setAttributes(group, {
          'data-role': 'result-row',
          'data-row-id': row.id,
          'data-explanation-focused': String(focus.has(row.id)),
          'data-left-row-id': row.leftRowId ?? 'null',
          'data-right-row-id': row.rightRowId ?? 'null',
          'data-entering': entering ? 'true' : undefined,
        });
        setSvgTransform(group, outputX, bodyTop + index * rowHeight, this.reducedMotion, this.durationMs);
        makeSelectable(group, row.id, `Result row ${row.id}`, options);
        const rect = ensureChild(group, 'rect', 'rect', {
          width: outputWidth,
          height: rowHeight - 5,
          rx: 4,
          fill: options.selectedId === row.id || focus.has(row.id) ? surface.theme.accentSubtle : surface.theme.surfaceRaised,
          stroke: options.selectedId === row.id || focus.has(row.id) ? surface.theme.accent : surface.theme.border,
          'stroke-dasharray': row.leftRowId === null || row.rightRowId === null ? '4 3' : undefined,
        });
        rect.setAttribute('aria-hidden', 'true');
        const value = ensureChild(group, 'text[data-role="value"]', 'text', {
          'data-role': 'value',
          x: 10,
          y: 17,
          fill: surface.theme.ink,
          'font-size': 10,
          'font-family': surface.theme.monoFontFamily,
        });
        const sourceLabel = `${row.leftRowId ?? 'NULL'} × ${row.rightRowId ?? 'NULL'}`;
        setText(value, truncate(sourceLabel, 36));
        const badge = ensureChild(group, 'text[data-role="fanout-badge"]', 'text', {
          'data-role': 'fanout-badge',
          x: outputWidth - 10,
          y: 17,
          fill: row.leftRowId === null || row.rightRowId === null ? surface.theme.warning : surface.theme.success,
          'font-size': 10,
          'font-weight': 700,
          'text-anchor': 'end',
        });
        setText(badge, row.leftRowId === null || row.rightRowId === null ? 'NULL-EXTENDED' : 'MATCH');
      },
    );
    renderExplanationPanel(surface, input.explanation, bodyTop + Math.max(input.spec.left.rows.length, input.spec.right.rows.length, result.rows.length) * rowHeight + 18, options.locale);
  }
}

export const joinRendererRegistration: RendererRegistration<JoinRendererInput> = {
  id: 'table.join',
  family: 'table',
  description: 'Stable source/result rows and fan-out lineage for relational joins.',
  create: () => new JoinRenderer(),
};

export function registerJoinRenderers(registry: { register<Input>(registration: RendererRegistration<Input>): unknown }): void {
  registry.register(joinRendererRegistration);
}
