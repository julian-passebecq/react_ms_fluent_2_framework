import { describe, expect, it } from 'vitest';
import { createIconRegistry, layoutDiagram, validateDiagramSpec, validateLineageSpec } from '@conceptmotion/core';
import { architectureDiagram, architectureFigure, lineageFigure, providers, stages, translations, workloadNames, type Workload } from './data';
import { DiagramRenderer, recommendedSceneViewport } from '@conceptmotion/svg';
describe('Architecture Atlas semantic migrations', () => {
  it('migrates all sixteen source variants into both deterministic shared layouts', () => {
    for (const workload of Object.keys(workloadNames) as Workload[]) for (const provider of providers) for (const mode of ['layered', 'radial'] as const) {
      const spec = architectureDiagram(workload, provider, mode);
      expect(validateDiagramSpec(spec).valid).toBe(true);
      expect(spec.nodes.map(n => n.id)).toEqual(stages);
      expect(spec.layout?.density).toBe('comfortable');
      for (const node of spec.nodes) expect(createIconRegistry().resolve(node.iconId!).resolvedId).toBe(`data.${node.id}`);
      expect(spec.frames[3].activeEdgeIds).toEqual(['source-move', 'move-store', 'store-process']);
      expect(translations[workload][provider]).toHaveLength(8);
      expect(layoutDiagram(spec)).toEqual(layoutDiagram({ ...spec, nodes: [...spec.nodes].reverse(), edges: [...spec.edges].reverse() }));
      expect(architectureFigure(workload, provider, mode).fallbackText).toContain('Source:');
      expect(JSON.stringify(spec)).not.toMatch(/https:|\.svg|\.png/);
      expect(JSON.stringify(architectureFigure(workload, provider, mode))).not.toMatch(/github\.com|julian-passebecq|26f1ca6e501f68b3bab4217c4d13059a6796134e/);
    }
  });
  it('reuses column-level lineage without adding a SQL parser', () => expect(validateLineageSpec(lineageFigure.spec).valid).toBe(true));
  it('fits layered and radial graphs at every presentation size with deterministic exports', () => {
    for (const provider of ['layered', 'radial'] as const) {
      const spec = architectureDiagram('medallion', 'fabric', provider);
      const heights: number[] = [];
      for (const size of ['compact', 'regular', 'expanded'] as const) {
        const viewport = recommendedSceneViewport(spec, size); heights.push(viewport.height);
        const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); const renderer = new DiagramRenderer();
        const input = { spec, activeNodeIds: ['process'], activeEdgeIds: spec.frames[3].activeEdgeIds };
        renderer.mount(host, input, { ...viewport, reducedMotion: true });
        const layout = layoutDiagram(spec); const scale = Math.min(viewport.width / layout.width, (viewport.height - 68) / layout.height);
        expect(58 + layout.height * scale).toBeLessThanOrEqual(viewport.height);
        expect(layout.width * scale).toBeLessThanOrEqual(viewport.width + 1e-6);
        const frozen = renderer.freeze(); renderer.update(input); expect(renderer.freeze()).toBe(frozen);
        renderer.destroy();
      }
      expect(heights[0]).toBeLessThanOrEqual(heights[1]); expect(heights[1]).toBeLessThanOrEqual(heights[2]);
      if (provider === 'layered') expect(heights[2]).toBe(320);
      else expect(heights[2]).toBeGreaterThan(640);
    }
  });
});
