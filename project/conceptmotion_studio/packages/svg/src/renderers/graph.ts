import { createIconRegistry, type DiagramLayoutResult, type EntityId, type FlowKind } from '@conceptmotion/core';

import { ensureChild, keyedChildren, round, setAttributes, setSvgTransform, setText, type SvgSurface } from '../dom.js';
import { ensureFlowMarkers, flowVisualStyle } from '../flow-style.js';
import { edgeAnchor, layoutLayeredGraph, routeOrthogonal, type LayoutDirection } from '../layout.js';
import type { Point, PositionedEntity, RenderOptions } from '../types.js';
import { makeSelectable, truncate } from './shared.js';

export interface GraphPortModel {
  id: string;
  label?: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
  role?: string;
}

export interface GraphNodeModel {
  id: EntityId;
  label: string;
  kind?: string;
  groupId?: string;
  iconId?: string;
  ports?: readonly GraphPortModel[];
  preferredRank?: number;
  status?: string;
  statusLabel?: string;
  metadata?: Readonly<Record<string, unknown>>;
}

export interface GraphEdgeModel {
  id: EntityId;
  from: { nodeId: EntityId; portId?: string };
  to: { nodeId: EntityId; portId?: string };
  label?: string;
  flowKind: FlowKind;
  active?: boolean;
  offset?: number;
}

export interface GraphGroupModel {
  id: EntityId;
  label: string;
  kind?: string;
  childNodeIds: readonly EntityId[];
  status?: string;
}

export interface GraphRenderModel {
  explanationFocusIds?: readonly EntityId[];
  /** Opt-in semantic node cards; omitted retains legacy workflow/diagram chrome. */
  semanticNodes?: boolean;
  availableHeight?: number;
  id: string;
  layoutResult?: DiagramLayoutResult;
  /** Generic diagrams describe concepts, not task execution. */
  semanticOnly?: boolean;
  direction?: LayoutDirection;
  nodes: readonly GraphNodeModel[];
  edges: readonly GraphEdgeModel[];
  groups?: readonly GraphGroupModel[];
  focusedGroupId?: EntityId;
}

const STATUS_GLYPH: Readonly<Record<string, string>> = {
  pending: '○',
  queued: '◷',
  running: '▶',
  success: '✓',
  failed: '×',
  retrying: '↻',
  skipped: '⊘',
  upstream_failed: '⊥',
};
const nodeIcons = createIconRegistry();
const PROJECT_STATUSES = new Set(['active', 'building', 'planned', 'experimental', 'legacy', 'archived']);
// Conservative em budgets keep wrapping deterministic across platform fonts.
// Character counts alone under-budget uppercase/wide glyphs (e.g. "ML ... Web").
// This is presentation-only: full semantic labels remain in the node's ARIA name.
function titleGlyphWidth(char: string): number {
  if (/\s/.test(char)) return .62;
  if (/[MWmw@%&]/.test(char)) return 1.05;
  if (/[ilI|.,:;'!]/.test(char)) return .62;
  if (/[A-Z]/.test(char)) return .9;
  if (/[a-z0-9/()[\]{}+_=\-]/.test(char)) return .75;
  return 1.1;
}
function labelLines(text: string, width: number): string[] {
  const budget = width / 14;
  const value = text.trim().replace(/\s+/g, ' ');
  // Normalize once in linear time. Thereafter inspect only the two visible
  // lines, plus one bounded suffix-reserved pass if an ellipsis is needed.
  const scan = (start: number, limit: number) => {
    let end = start, used = 0, lastSpace = -1;
    while (end < value.length) {
      const char = String.fromCodePoint(value.codePointAt(end)!);
      const next = used + titleGlyphWidth(char);
      if (next > limit) break;
      used = next;
      if (char === ' ') lastSpace = end;
      end += char.length;
    }
    return { end, lastSpace };
  };
  const first = scan(0, budget);
  if (first.end === value.length) return [value];
  const firstEnd = first.lastSpace > 0 ? first.lastSpace : first.end;
  const secondStart = firstEnd + (value[firstEnd] === ' ' ? 1 : 0);
  const second = scan(secondStart, budget);
  if (second.end === value.length) return [value.slice(0, firstEnd), value.slice(secondStart)];
  const finalEnd = scan(secondStart, budget - titleGlyphWidth('…')).end;
  return [value.slice(0, firstEnd), `${value.slice(secondStart, finalEnd).trimEnd()}…`];
}

function statusColor(status: string | undefined, surface: SvgSurface): string {
  if (status === 'success') return surface.theme.success;
  if (status === 'failed' || status === 'upstream_failed') return surface.theme.error;
  if (status === 'retrying' || status === 'queued') return surface.theme.warning;
  if (status === 'running') return surface.theme.accent;
  return surface.theme.mutedInk;
}

function inferredSide(
  endpoint: 'source' | 'target',
  direction: LayoutDirection,
): 'left' | 'right' | 'top' | 'bottom' {
  if (direction === 'tb') return endpoint === 'source' ? 'bottom' : 'top';
  if (direction === 'bt') return endpoint === 'source' ? 'top' : 'bottom';
  if (direction === 'rl') return endpoint === 'source' ? 'left' : 'right';
  return endpoint === 'source' ? 'right' : 'left';
}

function portSide(node: GraphNodeModel, portId: string | undefined, fallback: 'left' | 'right' | 'top' | 'bottom') {
  return node.ports?.find((port) => port.id === portId)?.side ?? fallback;
}

function pathMidpoint(source: Point, target: Point): Point {
  return { x: round((source.x + target.x) / 2), y: round((source.y + target.y) / 2) };
}

export function renderGraph(
  surface: SvgSurface,
  root: SVGGElement,
  model: GraphRenderModel,
  options: RenderOptions,
  reducedMotion: boolean,
  durationMs: number,
): Map<EntityId, PositionedEntity> {
  const direction = model.direction ?? 'lr';
  const layout = model.layoutResult ? new Map(model.layoutResult.nodes.map(node => [node.id, { ...node }])) : layoutLayeredGraph(
    model.nodes.map((node) => ({ id: node.id, preferredRank: node.preferredRank })),
    model.edges.map((edge) => ({ from: edge.from.nodeId, to: edge.to.nodeId })),
    {
      direction,
      width: surface.viewport.width,
      height: (model.availableHeight ?? surface.viewport.height) - 72,
      padding: 92,
      nodeWidth: 154,
      nodeHeight: 68,
    },
  );
  // Account for heading space without introducing spec-level coordinates.
  if (model.layoutResult) {
    const result = model.layoutResult;
    const scale = Math.min(surface.viewport.width / result.width, (surface.viewport.height - 68) / result.height);
    root.setAttribute('transform', `translate(${round((surface.viewport.width - result.width * scale) / 2)} 58) scale(${round(scale, 5)})`);
    root.setAttribute('data-layout-provider', 'contract');
  } else {
    root.removeAttribute('transform');
    root.removeAttribute('data-layout-provider');
    layout.forEach((rect) => { rect.y += 58; });
  }
  const nodeById = new Map(model.nodes.map((node) => [node.id, node]));
  ensureFlowMarkers(surface.defs, surface.theme, `${model.id}-marker`);

  const groupsLayer = ensureChild(root, 'g[data-layer="groups"]', 'g', { 'data-layer': 'groups' });
  const edgesLayer = ensureChild(root, 'g[data-layer="edges"]', 'g', { 'data-layer': 'edges' });
  const tokensLayer = ensureChild(root, 'g[data-layer="tokens"]', 'g', { 'data-layer': 'tokens' });
  const nodesLayer = ensureChild(root, 'g[data-layer="nodes"]', 'g', { 'data-layer': 'nodes' });

  const groupLayouts = (model.groups ?? []).flatMap((group) => {
    // Category membership controls radial order. A rectangle spanning an arc
    // could cover the hub; category labels/counts belong in the consumer legend.
    if (model.semanticNodes && group.kind === 'category') return [];
    const provided = model.layoutResult?.groups?.find(entry => entry.id === group.id);
    if (provided) return [{ group, x: provided.x, y: provided.y, width: provided.width, height: provided.height }];
    const children = group.childNodeIds.flatMap((id) => {
      const rect = layout.get(id);
      return rect ? [rect] : [];
    });
    if (children.length === 0) return [];
    const padding = 20;
    const minX = Math.min(...children.map((rect) => rect.x)) - padding;
    const minY = Math.min(...children.map((rect) => rect.y)) - padding - 16;
    const maxX = Math.max(...children.map((rect) => rect.x + rect.width)) + padding;
    const maxY = Math.max(...children.map((rect) => rect.y + rect.height)) + padding;
    return [{ group, x: minX, y: minY, width: maxX - minX, height: maxY - minY }];
  });
  keyedChildren(
    groupsLayer,
    'g[data-role="group"]',
    'g',
    groupLayouts,
    ({ group }) => group.id,
    (groupNode, entry) => {
      const focused = model.focusedGroupId === entry.group.id;
      setAttributes(groupNode, { 'data-role': 'group', 'data-group-id': entry.group.id, 'data-focused': String(focused) });
      const rect = ensureChild(groupNode, 'rect', 'rect', {
        x: round(entry.x),
        y: round(entry.y),
        width: round(entry.width),
        height: round(entry.height),
        rx: surface.theme.radius + 3,
        fill: focused ? surface.theme.accentSubtle : surface.theme.surfaceRaised,
        'fill-opacity': focused ? 0.72 : 0.48,
        stroke: focused ? surface.theme.accent : surface.theme.border,
        'stroke-width': focused ? 2 : 1,
        'stroke-dasharray': entry.group.kind === 'foreach' || entry.group.kind === 'task-group' ? '6 3' : undefined,
      });
      rect.setAttribute('aria-hidden', 'true');
      const label = ensureChild(groupNode, 'text', 'text', {
        x: round(entry.x + 9),
        y: round(entry.y + 13),
        fill: surface.theme.mutedInk,
        'font-size': 9,
        'font-weight': 700,
        'letter-spacing': 0.7,
      });
      setText(label, `${(entry.group.kind ?? 'group').toUpperCase()} · ${truncate(entry.group.label, 25)}`);
    },
  );

  const routedEdges = model.edges.flatMap((edge) => {
    const sourceRect = layout.get(edge.from.nodeId);
    const targetRect = layout.get(edge.to.nodeId);
    const sourceNode = nodeById.get(edge.from.nodeId);
    const targetNode = nodeById.get(edge.to.nodeId);
    if (!sourceRect || !targetRect || !sourceNode || !targetNode) return [];
    const route = model.layoutResult?.edgeRoutes[edge.id];
    if (route?.length) {
      const source = route[0];
      const target = route[route.length - 1];
      return [{ edge, source, target, path: route.map((point, index) => `${index ? 'L' : 'M'}${round(point.x)},${round(point.y)}`).join(' '), midpoint: pathMidpoint(source, target) }];
    }
    const sourceSide = portSide(sourceNode, edge.from.portId, inferredSide('source', direction));
    const targetSide = portSide(targetNode, edge.to.portId, inferredSide('target', direction));
    const source = edgeAnchor(sourceRect, sourceSide);
    const target = edgeAnchor(targetRect, targetSide);
    if (edge.offset) {
      if (direction === 'tb' || direction === 'bt') {
        source.x += edge.offset;
        target.x += edge.offset;
      } else {
        source.y += edge.offset;
        target.y += edge.offset;
      }
    }
    return [{ edge, source, target, path: routeOrthogonal(source, target, direction), midpoint: pathMidpoint(source, target) }];
  });

  keyedChildren(
    edgesLayer,
    'g[data-role="edge"]',
    'g',
    routedEdges,
    ({ edge }) => edge.id,
    (edgeGroup, routed) => {
      const visual = flowVisualStyle(routed.edge.flowKind, surface.theme, `${model.id}-marker`);
      setAttributes(edgeGroup, {
        'data-role': 'edge',
        'data-edge-id': routed.edge.id,
        'data-flow-kind': routed.edge.flowKind,
        'data-active': String(Boolean(routed.edge.active)),
      });
      makeSelectable(edgeGroup, routed.edge.id, `${routed.edge.label ?? visual.label} edge from ${routed.edge.from.nodeId} to ${routed.edge.to.nodeId}`, options);
      const path = ensureChild(edgeGroup, 'path[data-role="route"]', 'path', {
        'data-role': 'route',
        d: routed.path,
        fill: 'none',
        stroke: visual.stroke,
        'stroke-width': routed.edge.active ? visual.width + 1.5 : visual.width,
        'stroke-dasharray': visual.dasharray,
        'marker-end': `url(#${visual.markerId})`,
        opacity: routed.edge.active ? 1 : 0.78,
      });
      path.style.transition = reducedMotion ? 'none' : `all ${durationMs}ms ease`;
      const label = ensureChild(edgeGroup, 'text[data-role="label"]', 'text', {
        'data-role': 'label',
        x: routed.midpoint.x,
        y: routed.midpoint.y - 7,
        fill: visual.stroke,
        'font-size': 9,
        'font-weight': 650,
        'text-anchor': 'middle',
      });
      setText(label, `${visual.glyph} ${routed.edge.label ?? visual.label}`);
    },
  );

  keyedChildren(
    tokensLayer,
    'g[data-role="flow-token"]',
    'g',
    routedEdges.filter(({ edge }) => edge.active),
    ({ edge }) => edge.id,
    (token, routed, _index, entering) => {
      const visual = flowVisualStyle(routed.edge.flowKind, surface.theme, `${model.id}-marker`);
      setAttributes(token, {
        'data-role': 'flow-token',
        'data-edge-id': routed.edge.id,
        'data-motion': reducedMotion ? 'static' : 'semantic-pulse',
        'data-entering': entering ? 'true' : undefined,
      });
      setSvgTransform(token, routed.midpoint.x, routed.midpoint.y, reducedMotion, durationMs);
      const tokenShape = ensureChild(token, 'rect', 'rect', {
        x: -13,
        y: -10,
        width: 26,
        height: 20,
        rx: 10,
        fill: surface.theme.surface,
        stroke: visual.stroke,
        'stroke-width': 2,
        'stroke-dasharray': visual.dasharray,
      });
      tokenShape.setAttribute('aria-hidden', 'true');
      const glyph = ensureChild(token, 'text', 'text', {
        x: 0,
        y: 4,
        fill: visual.stroke,
        'font-size': 9,
        'font-weight': 750,
        'text-anchor': 'middle',
      });
      setText(glyph, visual.glyph);
    },
  );

  keyedChildren(
    nodesLayer,
    'g[data-role="node"]',
    'g',
    model.nodes,
    (node) => node.id,
    (nodeGroup, node, _index, entering) => {
      const rect = layout.get(node.id)!;
      const selected = options.selectedId === node.id;
      const explanationFocused = model.explanationFocusIds?.includes(node.id) ?? false;
      const status = node.status ?? 'pending';
      const publicStatus = model.semanticNodes && typeof node.metadata?.status === 'string' && PROJECT_STATUSES.has(node.metadata.status) ? node.metadata.status : '';
      const hub = model.semanticNodes && node.kind === 'hub';
      const semanticIcon = nodeIcons.resolve(node.iconId ?? `data.${node.kind ?? 'unknown'}`);
      setAttributes(nodeGroup, {
        'data-role': 'node',
        'data-node-id': node.id,
        'data-kind': node.kind ?? 'generic',
        'data-status': status,
        'data-semantic-node': model.semanticNodes ? 'true' : undefined,
        'data-category-id': node.groupId,
        'data-public-status': publicStatus || undefined,
        'data-explanation-focused': model.explanationFocusIds ? String(explanationFocused) : undefined,
        'data-entering': entering ? 'true' : undefined,
      });
      setSvgTransform(nodeGroup, rect.x, rect.y, reducedMotion, durationMs);
      makeSelectable(nodeGroup, node.id, `${node.label}, ${node.kind ?? 'node'}${publicStatus ? `, project status ${publicStatus}` : model.semanticOnly ? status === 'running' ? ', active' : status === 'failed' ? ', issue' : '' : `, status ${status}`}`, options);
      const background = ensureChild(nodeGroup, 'rect[data-role="background"]', 'rect', {
        'data-role': 'background',
        width: rect.width,
        height: rect.height,
        rx: surface.theme.radius,
        fill: hub ? surface.theme.accent : selected || explanationFocused ? surface.theme.accentSubtle : surface.theme.surface,
        stroke: selected || explanationFocused ? surface.theme.accent : statusColor(status, surface),
        'stroke-width': hub || selected || explanationFocused || status === 'running' || status === 'failed' ? 2.4 : 1.2,
        'stroke-dasharray': status === 'queued' || status === 'retrying' ? '5 3' : undefined,
      });
      background.setAttribute('aria-hidden', 'true');
      const icon = ensureChild(nodeGroup, 'text[data-role="icon"]', 'text', {
        'data-role': 'icon',
        'data-icon-id': node.iconId ?? 'generic.node',
        'data-icon-resolved': model.semanticNodes ? semanticIcon.resolvedId : undefined,
        x: 13,
        y: 24,
        fill: hub ? surface.theme.surface : surface.theme.accent,
        'font-size': model.semanticNodes && (semanticIcon.glyph?.length ?? 0) > 1 ? 11 : 15,
        'font-weight': 700,
      });
      // A deterministic generic glyph is safer than coupling specs to vendor asset paths.
      setText(icon, model.semanticNodes ? semanticIcon.glyph ?? '◇' : node.kind === 'database' || node.kind === 'table' ? '▤' : node.kind === 'source' ? '◉' : '□');
      const label = ensureChild(nodeGroup, 'text[data-role="label"]', 'text', {
        'data-role': 'label',
        x: 38,
        y: 23,
        fill: hub ? surface.theme.surface : surface.theme.ink,
        'font-size': model.semanticNodes ? 14 : 11,
        'font-weight': 650,
      });
      if (model.semanticNodes) {
        for (const child of Array.from(label.childNodes)) if (child.nodeType === 3) child.remove();
        keyedChildren(label, 'tspan', 'tspan', labelLines(node.label, rect.width - 50).map((text, index) => ({ id: String(index), text })), line => line.id, (span, line, index) => { setAttributes(span, { x: 38, dy: index ? 17 : 0 }); setText(span, line.text); });
      } else setText(label, truncate(node.label, 19));
      const category = model.semanticNodes ? model.groups?.find(group => group.id === node.groupId && group.kind === 'category') : undefined;
      if (category) {
        const categoryLabel = ensureChild(nodeGroup, 'text[data-role="category"]', 'text', { 'data-role': 'category', x: 13, y: 55, fill: surface.theme.accent, 'font-size': 10, 'font-weight': 650 });
        setText(categoryLabel, category.label);
      } else nodeGroup.querySelector('[data-role="category"]')?.remove();
      const kind = ensureChild(nodeGroup, 'text[data-role="kind"]', 'text', {
        'data-role': 'kind',
        x: 13,
        y: model.semanticNodes ? 73 : 47,
        fill: hub ? surface.theme.surface : surface.theme.mutedInk,
        'font-size': 9,
      });
      setText(kind, model.semanticNodes ? (node.kind ?? 'node').replaceAll('-', ' ').toUpperCase() : (node.kind ?? 'generic').toUpperCase());
      const statusBadge = ensureChild(nodeGroup, 'text[data-role="status"]', 'text', {
        'data-role': 'status',
        x: rect.width - 10,
        y: model.semanticNodes ? 73 : 47,
        fill: hub ? surface.theme.surface : publicStatus === 'building' ? surface.theme.warning : statusColor(status, surface),
        'font-size': model.semanticNodes ? 11 : 10,
        'font-weight': 750,
        'text-anchor': 'end',
      });
      setText(statusBadge, publicStatus ? publicStatus.toUpperCase() : model.semanticOnly ? status === 'running' ? 'ACTIVE' : status === 'failed' ? 'ISSUE' : '' : `${STATUS_GLYPH[status] ?? '•'} ${(node.statusLabel ?? status).replaceAll('_', ' ').toUpperCase()}`);

      const ports = node.ports ?? (model.semanticNodes ? [] : [
        { id: 'in', side: inferredSide('target', direction) },
        { id: 'out', side: inferredSide('source', direction) },
      ]);
      keyedChildren(
        nodeGroup,
        'g[data-role="port"]',
        'g',
        ports,
        (port) => port.id,
        (portGroup, port) => {
          const side = port.side ?? inferredSide(port.id === 'out' ? 'source' : 'target', direction);
          const point = edgeAnchor({ ...rect, x: 0, y: 0 }, side);
          setAttributes(portGroup, {
            'data-role': 'port',
            'data-port-id': port.id,
            'data-side': side,
            transform: `translate(${round(point.x)} ${round(point.y)})`,
            'aria-label': `${port.label ?? port.id} port`,
          });
          const circle = ensureChild(portGroup, 'circle', 'circle', {
            r: 4,
            fill: surface.theme.surface,
            stroke: surface.theme.ink,
            'stroke-width': 1.3,
          });
          circle.setAttribute('aria-hidden', 'true');
        },
      );
    },
  );

  return layout;
}
