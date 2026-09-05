import type { DiagramLayoutContract, DiagramLayoutNode, DiagramLayoutResult, DiagramRoutePoint, DiagramSpec } from './diagram';
import { validateDiagramSpec } from './diagram';

const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
const rounded = (n: number) => Math.round(n * 1000) / 1000;
const nodeWidth = 154;
const nodeHeight = 68;

function bounds(nodes: readonly DiagramLayoutNode[], padding = 32): Omit<DiagramLayoutNode, 'id'> {
  if (!nodes.length) return { x: 0, y: 0, width: padding * 2, height: padding * 2 };
  const x = Math.min(...nodes.map(n => n.x)) - padding;
  const y = Math.min(...nodes.map(n => n.y)) - padding;
  return { x, y, width: Math.max(...nodes.map(n => n.x + n.width)) - x + padding, height: Math.max(...nodes.map(n => n.y + n.height)) - y + padding };
}

/** Intersect the center-to-center line with the source rectangle. */
function anchor(from: DiagramLayoutNode, to: DiagramLayoutNode): DiagramRoutePoint {
  const dx = to.x + to.width / 2 - from.x - from.width / 2;
  const dy = to.y + to.height / 2 - from.y - from.height / 2;
  const ratio = 1 / Math.max(Math.abs(dx) / (from.width / 2), Math.abs(dy) / (from.height / 2), 1);
  return { x: rounded(from.x + from.width / 2 + dx * ratio), y: rounded(from.y + from.height / 2 + dy * ratio) };
}

function finish(spec: DiagramSpec, raw: readonly DiagramLayoutNode[], version: string): DiagramLayoutResult {
  const outer = bounds(raw, 48);
  const nodes = raw.map(n => ({ ...n, x: rounded(n.x - outer.x), y: rounded(n.y - outer.y) }));
  const byId = new Map(nodes.map(n => [n.id, n]));
  const edgeRoutes = Object.fromEntries([...spec.edges].sort((a, b) => compare(a.id, b.id)).map(edge => {
    const a = byId.get(edge.from.nodeId)!;
    const b = byId.get(edge.to.nodeId)!;
    if (a.id === b.id) return [edge.id, [{ x: a.x + a.width, y: a.y + 20 }, { x: a.x + a.width + 20, y: a.y - 20 }, { x: a.x + a.width / 2, y: a.y - 20 }, { x: a.x + a.width / 2, y: a.y }]];
    return [edge.id, [anchor(a, b), anchor(b, a)]];
  }));
  const groupNodes = (id: string, seen = new Set<string>()): DiagramLayoutNode[] => {
    if (seen.has(id)) return [];
    seen.add(id);
    const group = spec.groups?.find(g => g.id === id);
    const ids = new Set([...(group?.childNodeIds ?? []), ...spec.nodes.filter(n => n.groupId === id).map(n => n.id)]);
    const children = new Set([...(group?.childGroupIds ?? []), ...(spec.groups ?? []).filter(g => g.parentId === id).map(g => g.id)]);
    return [...nodes.filter(n => ids.has(n.id)), ...[...children].flatMap(child => groupNodes(child, seen))];
  };
  const groups = [...(spec.groups ?? [])].sort((a, b) => compare(a.id, b.id)).flatMap(group => {
    const children = groupNodes(group.id);
    return children.length ? [{ id: group.id, ...bounds(children, 24) }] : [];
  });
  return { version, width: rounded(outer.width), height: rounded(outer.height), nodes, edgeRoutes, groups };
}

function validatedNodes(spec: DiagramSpec) {
  const result = validateDiagramSpec(spec);
  if (!result.valid) throw new Error(`Invalid diagram layout: ${result.issues.map(i => i.message).join('; ')}`);
  return [...spec.nodes].sort((a, b) => compare(a.groupId ?? '', b.groupId ?? '') || compare(a.id, b.id));
}

/** Stable IDs and grouping determine clockwise order; no random force simulation. */
export const radialDiagramLayout: DiagramLayoutContract = {
  id: 'datapass.radial', version: '1.0.0', deterministic: true,
  layout(spec) {
    const ordered = validatedNodes(spec);
    const width = spec.layout?.density === 'comfortable' ? 208 : nodeWidth;
    const height = spec.layout?.density === 'comfortable' ? 90 : nodeHeight;
    const hubId = spec.layout?.hubId ?? [...ordered].sort((a, b) => compare(a.id, b.id))[0]?.id;
    const spokes = ordered.filter(n => n.id !== hubId);
    // Circumference guarantees enough room for each rectangle, including dense galaxies.
    const radius = Math.max(190, spokes.length * (width + 42) / (2 * Math.PI));
    const nodes = ordered.map(n => {
      const index = spokes.findIndex(s => s.id === n.id);
      const angle = -Math.PI / 2 + (2 * Math.PI * index) / Math.max(1, spokes.length);
      return { id: n.id, x: n.id === hubId ? -width / 2 : radius * Math.cos(angle) - width / 2, y: n.id === hubId ? -height / 2 : radius * Math.sin(angle) - height / 2, width, height };
    });
    return finish(spec, nodes, this.version);
  },
};

/** Lightweight rank provider. Cycles remain deterministic and never start a simulation. */
export const layeredDiagramLayout: DiagramLayoutContract = {
  id: 'datapass.layered', version: '1.0.0', deterministic: true,
  layout(spec) {
    const ordered = validatedNodes(spec);
    const width = spec.layout?.density === 'comfortable' ? 208 : nodeWidth;
    const height = spec.layout?.density === 'comfortable' ? 90 : nodeHeight;
    const ranks = new Map(ordered.map(n => [n.id, n.preferredRank ?? spec.layout?.preferredRanks?.[n.id] ?? 0]));
    const incoming = new Map(ordered.map(n => [n.id, spec.edges.filter(e => e.to.nodeId === n.id).length]));
    const queue = ordered.filter(n => incoming.get(n.id) === 0).map(n => n.id).sort(compare);
    const visited = new Set<string>();
    while (queue.length) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      for (const edge of [...spec.edges].sort((a, b) => compare(a.id, b.id)).filter(e => e.from.nodeId === id)) {
        const child = edge.to.nodeId;
        const pinned = ordered.find(n => n.id === child)?.preferredRank ?? spec.layout?.preferredRanks?.[child];
        if (pinned === undefined) ranks.set(child, Math.max(ranks.get(child)!, ranks.get(id)! + 1));
        incoming.set(child, incoming.get(child)! - 1);
        if (incoming.get(child) === 0) { queue.push(child); queue.sort(compare); }
      }
    }
    const lanes = new Map<number, number>();
    const horizontal = !['tb', 'bt'].includes(spec.layout?.direction ?? 'lr');
    const reverse = ['rl', 'bt'].includes(spec.layout?.direction ?? 'lr');
    const maxRank = Math.max(0, ...ranks.values());
    return finish(spec, ordered.map(n => {
      const rank = ranks.get(n.id)!;
      const lane = lanes.get(rank) ?? 0;
      lanes.set(rank, lane + 1);
      const major = reverse ? maxRank - rank : rank;
      return { id: n.id, x: horizontal ? major * (width + 51) : lane * (width + 51), y: horizontal ? lane * (height + 42) : major * (height + 42), width, height };
    }), this.version);
  },
};

export function layoutDiagram(spec: DiagramSpec): DiagramLayoutResult {
  return (spec.layout?.provider === 'radial' ? radialDiagramLayout : layeredDiagramLayout).layout(spec);
}
