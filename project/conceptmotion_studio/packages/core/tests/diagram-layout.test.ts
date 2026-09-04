import { describe, expect, it } from 'vitest';
import { layeredDiagramLayout, radialDiagramLayout, validateDiagramSpec, type DiagramSpec } from '../src';

const spec: DiagramSpec = { kind: 'diagram', version: '3', id: 'galaxy', title: 'Galaxy', layout: { provider: 'radial', hubId: 'hub' }, nodes: [{ id: 'hub', label: 'Hub' }, ...Array.from({ length: 16 }, (_, i) => ({ id: `p${i}`, label: `Project ${i}`, groupId: i < 3 ? 'g' : undefined }))], edges: Array.from({ length: 16 }, (_, i) => ({ id: `e${i}`, from: { nodeId: 'hub' }, to: { nodeId: `p${i}` } })), groups: [{ id: 'g', label: 'Group' }] };

describe('deterministic DiagramLayoutContract providers', () => {
  for (const provider of [radialDiagramLayout, layeredDiagramLayout]) {
    it(`${provider.id} ignores input array order and remains finite`, () => {
      const a = provider.layout(spec);
      const b = provider.layout({ ...spec, nodes: [...spec.nodes].reverse(), edges: [...spec.edges].reverse() });
      expect(a).toEqual(b);
      expect(a.nodes).toHaveLength(17);
      expect(Object.keys(a.edgeRoutes)).toHaveLength(16);
      for (const n of a.nodes) for (const value of [n.x, n.y, n.width, n.height]) expect(Number.isFinite(value)).toBe(true);
      for (const n of a.nodes) { expect(n.x).toBeGreaterThanOrEqual(0); expect(n.x + n.width).toBeLessThanOrEqual(a.width); expect(n.y + n.height).toBeLessThanOrEqual(a.height); }
      const group = a.groups![0];
      for (const node of a.nodes.filter(n => ['p0', 'p1', 'p2'].includes(n.id))) { expect(node.x).toBeGreaterThan(group.x); expect(node.y + node.height).toBeLessThan(group.y + group.height); }
    });
    it(`${provider.id} handles empty, singleton, cycles and self edges`, () => {
      expect(provider.layout({ ...spec, layout: {}, nodes: [], edges: [], groups: [] }).nodes).toEqual([]);
      expect(provider.layout({ ...spec, nodes: [{ id: 'hub', label: 'Hub' }], edges: [{ id: 'self', from: { nodeId: 'hub' }, to: { nodeId: 'hub' } }], groups: [] }).edgeRoutes.self).toHaveLength(4);
      expect(provider.layout({ ...spec, edges: [...spec.edges, { id: 'back', from: { nodeId: 'p0' }, to: { nodeId: 'hub' } }] }).nodes).toHaveLength(17);
    });
  }
  it('radial rectangles do not overlap, including a dense galaxy', () => {
    const { nodes } = radialDiagramLayout.layout(spec);
    for (const [i, a] of nodes.entries()) for (const b of nodes.slice(i + 1)) expect(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y).toBe(true);
  });
  it('validates missing hubs and unknown providers', () => {
    expect(validateDiagramSpec({ ...spec, layout: { hubId: 'missing' } }).valid).toBe(false);
    expect(validateDiagramSpec({ ...spec, layout: { provider: 'force' } }).valid).toBe(false);
    expect(() => radialDiagramLayout.layout({ ...spec, layout: { hubId: 'missing' } })).toThrow('Invalid diagram');
  });
  it('includes nested descendants in group bounds without mutating source specs', () => {
    const nested: DiagramSpec = { ...spec, groups: [{ id: 'outer', label: 'Outer', childGroupIds: ['g'] }, { id: 'g', label: 'Inner', parentId: 'outer' }] };
    const before = JSON.stringify(nested);
    const result = radialDiagramLayout.layout(nested);
    const outer = result.groups!.find(g => g.id === 'outer')!;
    for (const node of result.nodes.filter(n => ['p0', 'p1', 'p2'].includes(n.id))) {
      expect(node.x).toBeGreaterThan(outer.x);
      expect(node.x + node.width).toBeLessThan(outer.x + outer.width);
    }
    expect(JSON.stringify(nested)).toBe(before);
  });
});
