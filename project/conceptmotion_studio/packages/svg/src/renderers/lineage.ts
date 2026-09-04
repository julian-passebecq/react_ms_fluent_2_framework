import {
  createIconRegistry,
  getLineagePortId,
  resolveLocalizedText,
  validateLineageSpec,
  type EntityId,
  type IconResolver,
  type LineageAsset,
  type LineageEndpoint,
  type LineageRelation,
  type LineageSpec,
  type LocalizedText,
} from '@conceptmotion/core';

import { BaseSvgRenderer } from '../base-renderer.js';
import {
  ensureChild,
  keyedChildren,
  round,
  setAccessibleText,
  setAttributes,
  setSvgTransform,
  setText,
} from '../dom.js';
import { ensureFlowMarkers, flowVisualStyle } from '../flow-style.js';
import { edgeAnchor, layoutLayeredGraph, routeOrthogonal } from '../layout.js';
import type { Point, PositionedEntity, RendererRegistration } from '../types.js';
import { localText, makeSelectable, renderHeading, truncate } from './shared.js';

export interface LineageRendererInput {
  spec: LineageSpec;
  title?: LocalizedText;
  description?: LocalizedText;
  activeRelationIds?: readonly EntityId[];
  iconResolver?: IconResolver;
}

interface EndpointPosition {
  point: Point;
  id: string;
}

function endpointKey(endpoint: LineageEndpoint): string {
  return `${endpoint.assetId}:${endpoint.columnId ?? '@asset'}`;
}

function relationGlyph(relation: LineageRelation): string {
  if (relation.changeType === 'aggregate') return '∑';
  if (relation.changeType === 'derive') return 'ƒ';
  if (relation.changeType === 'join') return '⋈';
  if (relation.changeType === 'filter') return '⌁';
  if (relation.changeType === 'rename') return '→';
  return '›';
}

function relationDash(relation: LineageRelation): string | undefined {
  if (relation.changeType === 'derive') return '7 3';
  if (relation.changeType === 'filter') return '2 4';
  if (relation.changeType === 'aggregate') return '10 3 2 3';
  return undefined;
}

export class LineageRenderer extends BaseSvgRenderer<LineageRendererInput> {
  constructor() {
    super('lineage');
  }

  protected render(input: LineageRendererInput): void {
    const validation = validateLineageSpec(input.spec);
    if (!validation.valid) {
      throw new Error(`Invalid lineage "${input.spec.id}": ${validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ')}`);
    }
    const surface = this.surface!;
    const options = this.options;
    const title = localText(input.title ?? input.spec.title, options) || input.spec.id;
    const columnRelations = input.spec.relations.filter((relation) => relation.target.columnId || relation.sources.some((source) => source.columnId)).length;
    const description =
      localText(input.description ?? input.spec.description, options) ||
      `${input.spec.assets.length} assets and ${columnRelations} column-level derivations from stable fixture IDs.`;
    const headingBottom = renderHeading(surface, title, description, options);
    setAccessibleText(surface, title, description);
    const layer = ensureChild(surface.root, 'g[data-role="lineage"]', 'g', { 'data-role': 'lineage' });
    const groupsLayer = ensureChild(layer, 'g[data-layer="relations"]', 'g', { 'data-layer': 'relations' });
    const assetsLayer = ensureChild(layer, 'g[data-layer="assets"]', 'g', { 'data-layer': 'assets' });
    ensureFlowMarkers(surface.defs, surface.theme, `${input.spec.id}-lineage`);

    const assetHeight = (asset: LineageAsset): number => 48 + Math.max(1, asset.columns?.length ?? 0) * 25;
    const assetEdges = input.spec.relations.flatMap((relation) =>
      relation.sources.map((source) => ({ from: source.assetId, to: relation.target.assetId })),
    );
    const layout = layoutLayeredGraph(
      input.spec.assets.map((asset) => ({ id: asset.id, width: 190, height: assetHeight(asset) })),
      assetEdges,
      {
        direction: 'lr',
        width: surface.viewport.width,
        height: Math.max(180, surface.viewport.height - headingBottom),
        padding: 54,
        nodeWidth: 190,
        nodeHeight: 100,
      },
    );
    layout.forEach((rect) => { rect.y += headingBottom - 12; });
    const assetById = new Map(input.spec.assets.map((asset) => [asset.id, asset]));
    const resolver = input.iconResolver ?? createIconRegistry();
    const endpointPositions = new Map<string, EndpointPosition>();
    const activeRelations = new Set(input.activeRelationIds ?? []);

    for (const asset of input.spec.assets) {
      const rect = layout.get(asset.id)!;
      endpointPositions.set(endpointKey({ assetId: asset.id }), {
        id: getLineagePortId({ assetId: asset.id }),
        point: edgeAnchor(rect, 'right'),
      });
      (asset.columns ?? []).forEach((column, index) => {
        const y = rect.y + 48 + index * 25 + 12;
        endpointPositions.set(endpointKey({ assetId: asset.id, columnId: column.id }), {
          id: getLineagePortId({ assetId: asset.id, columnId: column.id }),
          point: { x: rect.x + rect.width, y },
        });
      });
    }

    const relationSegments = input.spec.relations.flatMap((relation) =>
      relation.sources.flatMap((source, sourceIndex) => {
        const from = endpointPositions.get(endpointKey(source));
        const targetRect = layout.get(relation.target.assetId);
        const toRaw = endpointPositions.get(endpointKey(relation.target));
        if (!from || !toRaw || !targetRect) return [];
        const to = {
          ...toRaw,
          point: {
            x: relation.target.columnId ? targetRect.x : toRaw.point.x,
            y: toRaw.point.y,
          },
        };
        return [{ id: `${relation.id}:${sourceIndex}`, relation, source, from, to }];
      }),
    );
    keyedChildren(
      groupsLayer,
      'g[data-role="relation"]',
      'g',
      relationSegments,
      (segment) => segment.id,
      (group, segment) => {
        const active = activeRelations.size === 0 || activeRelations.has(segment.relation.id) || options.selectedId === segment.relation.id;
        const midpoint = {
          x: round((segment.from.point.x + segment.to.point.x) / 2),
          y: round((segment.from.point.y + segment.to.point.y) / 2),
        };
        setAttributes(group, {
          'data-role': 'relation',
          'data-relation-id': segment.relation.id,
          'data-source-port': segment.from.id,
          'data-target-port': segment.to.id,
          'data-change-type': segment.relation.changeType ?? 'unknown',
          opacity: active ? 1 : 0.25,
        });
        makeSelectable(group, segment.relation.id, `Lineage relation ${segment.relation.id}: ${segment.relation.changeType ?? 'unknown'}`, options);
        const path = ensureChild(group, 'path[data-role="route"]', 'path', {
          'data-role': 'route',
          d: routeOrthogonal(segment.from.point, segment.to.point, 'lr'),
          fill: 'none',
          stroke: surface.theme.lineage,
          'stroke-width': active ? 2.3 : 1.5,
          'stroke-dasharray': relationDash(segment.relation),
          'marker-end': `url(#${flowVisualStyle('lineage', surface.theme, `${input.spec.id}-lineage`).markerId})`,
        });
        path.style.transition = this.reducedMotion ? 'none' : `all ${this.durationMs}ms ease`;
        const label = ensureChild(group, 'text[data-role="label"]', 'text', {
          'data-role': 'label',
          x: midpoint.x,
          y: midpoint.y - 7,
          fill: surface.theme.lineage,
          'font-size': 9,
          'font-weight': 650,
          'text-anchor': 'middle',
        });
        const expression = segment.relation.expression ?? resolveLocalizedText(segment.relation.derivation ?? segment.relation.label, options.locale ?? 'en');
        setText(label, `${relationGlyph(segment.relation)} ${truncate(expression || segment.relation.changeType || 'lineage', 28)}`);
      },
    );

    keyedChildren(
      assetsLayer,
      'g[data-role="asset"]',
      'g',
      input.spec.assets,
      (asset) => asset.id,
      (group, asset, _index, entering) => {
        const rect = layout.get(asset.id)!;
        const selected = options.selectedId === asset.id;
        const icon = resolver.resolve(asset.iconId ?? (asset.type === 'table' ? 'generic.table' : 'generic.database'));
        setAttributes(group, {
          'data-role': 'asset',
          'data-asset-id': asset.id,
          'data-asset-type': asset.type ?? 'asset',
          'data-entering': entering ? 'true' : undefined,
          role: 'group',
          'aria-label': `${resolveLocalizedText(asset.label, options.locale ?? 'en')} asset and columns`,
        });
        setSvgTransform(group, rect.x, rect.y, this.reducedMotion, this.durationMs);
        const assetControl = ensureChild(group, 'g[data-role="asset-control"]', 'g', {
          'data-role': 'asset-control',
        });
        makeSelectable(assetControl, asset.id, `${resolveLocalizedText(asset.label, options.locale ?? 'en')} asset`, options);
        const background = ensureChild(assetControl, 'rect[data-role="background"]', 'rect', {
          'data-role': 'background',
          width: rect.width,
          height: rect.height,
          rx: surface.theme.radius,
          fill: selected ? surface.theme.accentSubtle : surface.theme.surface,
          stroke: selected ? surface.theme.accent : surface.theme.border,
          'stroke-width': selected ? 2.4 : 1.2,
        });
        background.setAttribute('aria-hidden', 'true');
        const header = ensureChild(assetControl, 'rect[data-role="header"]', 'rect', {
          'data-role': 'header',
          width: rect.width,
          height: 38,
          rx: surface.theme.radius,
          fill: surface.theme.surfaceRaised,
          stroke: 'none',
        });
        header.setAttribute('aria-hidden', 'true');
        const iconText = ensureChild(assetControl, 'text[data-role="icon"]', 'text', {
          'data-role': 'icon',
          'data-icon-id': icon.resolvedId,
          'data-icon-fallback': String(icon.usedFallback),
          x: 11,
          y: 24,
          fill: surface.theme.accent,
          'font-size': 11,
          'font-weight': 700,
        });
        setText(iconText, icon.glyph ?? '□');
        const label = ensureChild(assetControl, 'text[data-role="label"]', 'text', {
          'data-role': 'label',
          x: 38,
          y: 18,
          fill: surface.theme.ink,
          'font-size': 11,
          'font-weight': 700,
        });
        setText(label, truncate(resolveLocalizedText(asset.label, options.locale ?? 'en'), 20));
        const type = ensureChild(assetControl, 'text[data-role="type"]', 'text', {
          'data-role': 'type',
          x: 38,
          y: 31,
          fill: surface.theme.mutedInk,
          'font-size': 8,
        });
        setText(type, `${(asset.type ?? 'asset').toUpperCase()}${asset.layer ? ` · ${asset.layer}` : ''}`);
        const columns = asset.columns ?? [];
        keyedChildren(
          group,
          'g[data-role="column"]',
          'g',
          columns,
          (column) => column.id,
          (columnGroup, column, columnIndex) => {
            const portId = getLineagePortId({ assetId: asset.id, columnId: column.id });
            const y = 42 + columnIndex * 25;
            const columnSelected = options.selectedId === portId;
            setAttributes(columnGroup, {
              'data-role': 'column',
              'data-column-id': column.id,
              'data-port-id': portId,
              transform: `translate(0 ${y})`,
            });
            makeSelectable(columnGroup, portId, `${resolveLocalizedText(column.label, options.locale ?? 'en')} column in ${asset.id}`, options);
            const row = ensureChild(columnGroup, 'rect', 'rect', {
              x: 4,
              y: 0,
              width: rect.width - 8,
              height: 23,
              rx: 3,
              fill: columnSelected ? surface.theme.accentSubtle : 'transparent',
              stroke: columnSelected ? surface.theme.accent : 'transparent',
            });
            row.setAttribute('aria-hidden', 'true');
            const role = ensureChild(columnGroup, 'text[data-role="role"]', 'text', {
              'data-role': 'role',
              x: 9,
              y: 16,
              fill: column.role === 'key' ? surface.theme.accent : surface.theme.mutedInk,
              'font-size': 9,
              'font-weight': 700,
            });
            setText(role, column.role === 'key' ? 'KEY' : column.role === 'derived' ? 'ƒ' : '·');
            const columnLabel = ensureChild(columnGroup, 'text[data-role="label"]', 'text', {
              'data-role': 'label',
              x: 36,
              y: 16,
              fill: surface.theme.ink,
              'font-family': surface.theme.monoFontFamily,
              'font-size': 9.5,
            });
            setText(columnLabel, truncate(resolveLocalizedText(column.label, options.locale ?? 'en'), 19));
            const inputPort = ensureChild(columnGroup, 'circle[data-role="input-port"]', 'circle', {
              'data-role': 'input-port',
              'data-port-id': portId,
              cx: 0,
              cy: 12,
              r: 4,
              fill: surface.theme.surface,
              stroke: surface.theme.lineage,
              'stroke-width': 1.4,
            });
            inputPort.setAttribute('aria-hidden', 'true');
            const outputPort = ensureChild(columnGroup, 'circle[data-role="output-port"]', 'circle', {
              'data-role': 'output-port',
              'data-port-id': portId,
              cx: rect.width,
              cy: 12,
              r: 4,
              fill: surface.theme.surface,
              stroke: surface.theme.lineage,
              'stroke-width': 1.4,
            });
            outputPort.setAttribute('aria-hidden', 'true');
          },
        );
      },
    );
  }
}

export const lineageRendererRegistration: RendererRegistration<LineageRendererInput> = {
  id: 'lineage.model',
  family: 'lineage',
  description: 'Asset and column-level lineage with stable endpoint IDs and derivation labels.',
  create: () => new LineageRenderer(),
};

export function registerLineageRenderers(registry: { register<Input>(registration: RendererRegistration<Input>): unknown }): void {
  registry.register(lineageRendererRegistration);
}
