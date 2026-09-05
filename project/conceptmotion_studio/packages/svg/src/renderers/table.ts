import {
  resolveLocalizedText,
  type CompiledTableState,
  type LocalizedText,
  type TableColumn,
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
import type { RendererRegistration } from '../types.js';
import { formatValue, localText, makeSelectable, renderHeading, truncate } from './shared.js';

export interface TableRendererInput {
  explanation?: ResolvedExplanation;
  state: CompiledTableState;
  title?: LocalizedText;
  description?: LocalizedText;
}

interface RowLayout {
  row: TableRow;
  visible: boolean;
  slot: number;
}

function columnLabel(column: TableColumn, locale: 'en' | 'no'): string {
  return resolveLocalizedText(column.label, locale) || column.id;
}

export class TableRenderer extends BaseSvgRenderer<TableRendererInput> {
  constructor() {
    super('table');
  }

  protected render(input: TableRendererInput): void {
    const surface = this.surface!;
    const options = this.options;
    const focus = new Set(input.explanation?.step.focus.entityIds ?? []);
    const title = localText(input.title, options) || input.state.tableId;
    const description =
      localText(input.description, options) ||
      `${input.state.visibleRowIds.length} of ${input.state.rows.length} rows visible. Stable row IDs are preserved.`;
    const top = renderHeading(surface, title, description, options);
    setAccessibleText(surface, title, description);

    const layer = ensureChild(surface.root, 'g[data-role="table"]', 'g', { 'data-role': 'table' });
    const left = 20;
    const availableWidth = Math.max(240, surface.viewport.width - 40);
    const rowHeight = surface.theme.density === 'compact' ? 34 : 42;
    const headerHeight = 30;
    const statusWidth = 72;
    const columnWidth = Math.max(72, (availableWidth - statusWidth) / Math.max(1, input.state.columns.length));

    const header = ensureChild(layer, 'g[data-role="header"]', 'g', { 'data-role': 'header' });
    setSvgTransform(header, left, top, true, 0);
    const headerBackground = ensureChild(header, 'rect[data-role="background"]', 'rect', {
      'data-role': 'background',
      x: 0,
      y: 0,
      width: availableWidth,
      height: headerHeight,
      fill: surface.theme.surfaceRaised,
      stroke: surface.theme.border,
      rx: surface.theme.radius,
    });
    headerBackground.setAttribute('aria-hidden', 'true');
    keyedChildren(
      header,
      'text[data-role="column"]',
      'text',
      input.state.columns,
      (column) => column.id,
      (text, column, index) => {
        setAttributes(text, {
          'data-role': 'column',
          x: 12 + index * columnWidth,
          y: 20,
          fill: surface.theme.ink,
          'font-size': 11,
          'font-weight': 650,
        });
        setText(text, truncate(columnLabel(column, options.locale ?? 'en'), 18));
      },
    );
    const statusHeader = ensureChild(header, 'text[data-role="status-header"]', 'text', {
      'data-role': 'status-header',
      x: availableWidth - statusWidth + 8,
      y: 20,
      fill: surface.theme.mutedInk,
      'font-size': 10,
      'font-weight': 650,
    });
    setText(statusHeader, 'STATE');
    // Keyed columns move in display order; keep fixed chrome in a stable slot too.
    header.appendChild(statusHeader);

    const rowById = new Map(input.state.rows.map((row) => [row.id, row]));
    const visible = new Set(input.state.visibleRowIds);
    const orderedIds = [
      ...input.state.rowOrder,
      ...input.state.rows.map((row) => row.id).filter((id) => !visible.has(id)),
    ];
    const rows: RowLayout[] = orderedIds.flatMap((id, slot) => {
      const row = rowById.get(id);
      return row ? [{ row, visible: visible.has(id), slot }] : [];
    });

    keyedChildren(
      layer,
      'g[data-role="row"]',
      'g',
      rows,
      ({ row }) => row.id,
      (rowGroup, rowLayout, _index, entering) => {
        const y = top + headerHeight + 7 + rowLayout.slot * rowHeight;
        setAttributes(rowGroup, {
          'data-role': 'row',
          'data-row-id': rowLayout.row.id,
          'data-explanation-focused': String(focus.has(rowLayout.row.id)),
          'data-visible': String(rowLayout.visible),
          'data-entering': entering ? 'true' : undefined,
          opacity: rowLayout.visible ? 1 : 0.42,
        });
        setSvgTransform(rowGroup, left, y, this.reducedMotion, this.durationMs);
        makeSelectable(rowGroup, rowLayout.row.id, `Row ${rowLayout.row.id}, ${rowLayout.visible ? 'visible' : 'filtered out'}`, options);

        const background = ensureChild(rowGroup, 'rect[data-role="background"]', 'rect', {
          'data-role': 'background',
          width: availableWidth,
          height: rowHeight - 5,
          rx: Math.max(2, surface.theme.radius - 2),
          fill:
            options.selectedId === rowLayout.row.id || focus.has(rowLayout.row.id)
              ? surface.theme.accentSubtle
              : rowLayout.visible
                ? surface.theme.surface
                : surface.theme.surfaceRaised,
          stroke: options.selectedId === rowLayout.row.id || focus.has(rowLayout.row.id) ? surface.theme.accent : surface.theme.border,
          'stroke-dasharray': rowLayout.visible ? undefined : '3 3',
        });
        background.setAttribute('aria-hidden', 'true');

        keyedChildren(
          rowGroup,
          'text[data-role="cell"]',
          'text',
          input.state.columns,
          (column) => column.id,
          (cell, column, columnIndex) => {
            setAttributes(cell, {
              'data-role': 'cell',
              'data-column-id': column.id,
              x: 12 + columnIndex * columnWidth,
              y: rowHeight / 2 + 3,
              fill: rowLayout.visible ? surface.theme.ink : surface.theme.mutedInk,
              'font-size': 11,
              'font-family': surface.theme.monoFontFamily,
            });
            setText(cell, truncate(formatValue(rowLayout.row.values[column.id]), 16));
          },
        );
        const state = ensureChild(rowGroup, 'text[data-role="row-state"]', 'text', {
          'data-role': 'row-state',
          x: availableWidth - statusWidth + 8,
          y: rowHeight / 2 + 3,
          fill: rowLayout.visible ? surface.theme.success : surface.theme.mutedInk,
          'font-size': 10,
          'font-weight': 650,
        });
        setText(state, rowLayout.visible ? `#${rowLayout.slot + 1} kept` : '⊘ filtered');
        rowGroup.appendChild(state);
      },
    );
    renderExplanationPanel(surface, input.explanation, top + headerHeight + 18 + rows.length * rowHeight, options.locale);
  }
}

export const tableRendererRegistration: RendererRegistration<TableRendererInput> = {
  id: 'table.transform',
  family: 'table',
  description: 'Keyed table rows for filter and sort explanations.',
  create: () => new TableRenderer(),
};

export function registerTableRenderers(registry: { register<Input>(registration: RendererRegistration<Input>): unknown }): void {
  registry.register(tableRendererRegistration);
}
