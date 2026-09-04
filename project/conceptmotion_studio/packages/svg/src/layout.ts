import type { EntityId } from '@conceptmotion/core';

import { round } from './dom.js';
import type { Point, PositionedEntity } from './types.js';

export type LayoutDirection = 'lr' | 'rl' | 'tb' | 'bt';

export interface LayoutNode {
  id: EntityId;
  preferredRank?: number;
  width?: number;
  height?: number;
}

export interface LayoutEdge {
  from: EntityId;
  to: EntityId;
}

export interface LayeredLayoutOptions {
  direction?: LayoutDirection;
  width: number;
  height: number;
  nodeWidth?: number;
  nodeHeight?: number;
  padding?: number;
  rankGap?: number;
  laneGap?: number;
}

function calculateRanks(nodes: readonly LayoutNode[], edges: readonly LayoutEdge[]): Map<EntityId, number> {
  const ids = new Set(nodes.map((node) => node.id));
  const incoming = new Map<EntityId, number>();
  const outgoing = new Map<EntityId, EntityId[]>();
  nodes.forEach((node) => {
    incoming.set(node.id, 0);
    outgoing.set(node.id, []);
  });
  edges
    .filter((edge) => ids.has(edge.from) && ids.has(edge.to))
    .sort((left, right) => `${left.from}:${left.to}`.localeCompare(`${right.from}:${right.to}`))
    .forEach((edge) => {
      incoming.set(edge.to, (incoming.get(edge.to) ?? 0) + 1);
      outgoing.get(edge.from)?.push(edge.to);
    });

  const ranks = new Map<EntityId, number>();
  const queue = nodes
    .filter((node) => incoming.get(node.id) === 0)
    .map((node) => node.id)
    .sort((left, right) => left.localeCompare(right));
  while (queue.length > 0) {
    const id = queue.shift()!;
    const rank = ranks.get(id) ?? 0;
    for (const target of outgoing.get(id) ?? []) {
      ranks.set(target, Math.max(ranks.get(target) ?? 0, rank + 1));
      incoming.set(target, (incoming.get(target) ?? 1) - 1);
      if (incoming.get(target) === 0) {
        queue.push(target);
        queue.sort((left, right) => left.localeCompare(right));
      }
    }
  }

  // Cycles remain deterministic and are placed after their strongest known predecessor.
  nodes
    .slice()
    .sort((left, right) => left.id.localeCompare(right.id))
    .forEach((node, index) => {
      if (!ranks.has(node.id)) ranks.set(node.id, node.preferredRank ?? index);
      if (node.preferredRank !== undefined) ranks.set(node.id, node.preferredRank);
    });
  return ranks;
}

export function layoutLayeredGraph(
  nodes: readonly LayoutNode[],
  edges: readonly LayoutEdge[],
  options: LayeredLayoutOptions,
): Map<EntityId, PositionedEntity> {
  const direction = options.direction ?? 'lr';
  const nodeWidth = options.nodeWidth ?? 152;
  const nodeHeight = options.nodeHeight ?? 68;
  const padding = options.padding ?? 24;
  const ranks = calculateRanks(nodes, edges);
  const byRank = new Map<number, LayoutNode[]>();
  nodes.forEach((node) => {
    const rank = ranks.get(node.id) ?? 0;
    const lane = byRank.get(rank) ?? [];
    lane.push(node);
    byRank.set(rank, lane);
  });
  byRank.forEach((lane) => lane.sort((left, right) => left.id.localeCompare(right.id)));
  const rankValues = [...byRank.keys()].sort((left, right) => left - right);
  const maxRank = Math.max(0, rankValues.length - 1);
  const horizontal = direction === 'lr' || direction === 'rl';
  const majorAvailable = (horizontal ? options.width : options.height) - padding * 2;
  const result = new Map<EntityId, PositionedEntity>();

  rankValues.forEach((rank, rankIndex) => {
    const lane = byRank.get(rank)!;
    const visualRank = direction === 'rl' || direction === 'bt' ? maxRank - rankIndex : rankIndex;
    const major = padding + (maxRank === 0 ? majorAvailable / 2 : (majorAvailable * visualRank) / maxRank);
    lane.forEach((node, laneIndex) => {
      const width = node.width ?? nodeWidth;
      const height = node.height ?? nodeHeight;
      const minorAvailable = (horizontal ? options.height : options.width) - padding * 2;
      const minor = padding + (minorAvailable * (laneIndex + 1)) / (lane.length + 1);
      const x = horizontal ? major - width / 2 : minor - width / 2;
      const y = horizontal ? minor - height / 2 : major - height / 2;
      result.set(node.id, { id: node.id, x: round(x), y: round(y), width, height });
    });
  });
  return result;
}

export function edgeAnchor(rect: PositionedEntity, side: 'left' | 'right' | 'top' | 'bottom'): Point {
  if (side === 'left') return { x: rect.x, y: rect.y + rect.height / 2 };
  if (side === 'right') return { x: rect.x + rect.width, y: rect.y + rect.height / 2 };
  if (side === 'top') return { x: rect.x + rect.width / 2, y: rect.y };
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height };
}

export function routeOrthogonal(
  source: Point,
  target: Point,
  direction: LayoutDirection = 'lr',
): string {
  if (direction === 'tb' || direction === 'bt') {
    const middleY = round((source.y + target.y) / 2);
    return `M${round(source.x)},${round(source.y)} L${round(source.x)},${middleY} L${round(target.x)},${middleY} L${round(target.x)},${round(target.y)}`;
  }
  const middleX = round((source.x + target.x) / 2);
  return `M${round(source.x)},${round(source.y)} L${middleX},${round(source.y)} L${middleX},${round(target.y)} L${round(target.x)},${round(target.y)}`;
}
