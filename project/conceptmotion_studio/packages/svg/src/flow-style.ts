import { getFlowKindSemantics, type FlowKind } from '@conceptmotion/core';

import { setAttributes, svgElement } from './dom.js';
import type { SemanticTheme } from './theme.js';

export interface FlowVisualStyle {
  stroke: string;
  width: number;
  dasharray?: string;
  markerId: string;
  glyph: string;
  label: string;
}

export function flowVisualStyle(kind: FlowKind, theme: SemanticTheme, markerPrefix = 'cm'): FlowVisualStyle {
  const semantics = getFlowKindSemantics(kind);
  const safeMarkerPrefix = markerPrefix.replace(/[^A-Za-z0-9_-]/g, '-');
  const stroke =
    semantics.channel === 'data'
      ? kind === 'data-stream'
        ? theme.dataStream
        : kind === 'cdc'
          ? theme.cdc
          : theme.dataBatch
      : semantics.channel === 'lineage'
        ? theme.lineage
        : kind === 'failure'
          ? theme.error
          : kind === 'success'
            ? theme.success
            : theme.control;
  const dasharray =
    semantics.linePattern === 'dashed'
      ? '8 5'
      : semantics.linePattern === 'dotted'
        ? '2 5'
        : semantics.linePattern === 'double'
          ? '12 3 2 3'
          : undefined;
  const glyphs: Record<string, string> = {
    batch: '▰',
    event: '•••',
    change: '±',
    control: '◇',
    success: '✓',
    failure: '×',
    completion: '‖',
    skip: '○',
    arrow: '›',
  };
  return {
    stroke,
    width: semantics.linePattern === 'double' ? 3 : 2,
    dasharray,
    markerId: `${safeMarkerPrefix}-${semantics.marker}`,
    glyph: glyphs[semantics.marker] ?? '›',
    label: semantics.defaultLabel,
  };
}

export function ensureFlowMarkers(defs: SVGDefsElement, theme: SemanticTheme, prefix = 'cm'): void {
  const kinds: FlowKind[] = [
    'data',
    'data-batch',
    'data-stream',
    'cdc',
    'control',
    'dependency',
    'lineage',
    'success',
    'failure',
    'completion',
    'skip',
  ];
  const markerKinds = new Map(kinds.map((kind) => [flowVisualStyle(kind, theme, prefix).markerId, kind]));
  for (const [markerId, kind] of markerKinds) {
    let marker = Array.from(defs.children).find((child): child is SVGMarkerElement => child.id === markerId && child.tagName.toLowerCase() === 'marker');
    if (!marker) {
      marker = svgElement(defs.ownerDocument, 'marker');
      marker.id = markerId;
      defs.append(marker);
    }
    setAttributes(marker, {
      viewBox: '0 0 12 12',
      refX: 10,
      refY: 6,
      markerWidth: 7,
      markerHeight: 7,
      orient: 'auto-start-reverse',
      markerUnits: 'strokeWidth',
    });
    let path = marker.querySelector<SVGPathElement>('path');
    if (!path) {
      path = svgElement(defs.ownerDocument, 'path');
      marker.append(path);
    }
    const style = flowVisualStyle(kind, theme, prefix);
    const semantics = getFlowKindSemantics(kind);
    const pathData =
      semantics.marker === 'failure'
        ? 'M2 2 L10 10 M10 2 L2 10'
        : semantics.marker === 'completion'
          ? 'M4 1 V11 M8 1 V11'
          : semantics.marker === 'skip'
            ? 'M6 1 A5 5 0 1 1 5.99 1 M3 6 H9'
            : semantics.marker === 'change'
              ? 'M2 3 H10 M7 1 L10 3 L7 5 M10 9 H2 M5 7 L2 9 L5 11'
              : 'M1 1 L11 6 L1 11 Z';
    setAttributes(path, {
      d: pathData,
      fill: pathData.endsWith('Z') ? style.stroke : 'none',
      stroke: style.stroke,
      'stroke-width': pathData.endsWith('Z') ? 0 : 1.8,
    });
  }
}
