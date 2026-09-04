import { describe, expect, it } from 'vitest';
import { layoutDiagram, validateDiagramSpec, validateLineageSpec } from '@conceptmotion/core';
import { architectureDiagram, architectureFigure, lineageFigure, providers, stages, translations, workloadNames, type Workload } from './data';
describe('Architecture Atlas semantic migrations', () => {
  it('migrates all sixteen source variants into both deterministic shared layouts', () => {
    for (const workload of Object.keys(workloadNames) as Workload[]) for (const provider of providers) for (const mode of ['layered', 'radial'] as const) {
      const spec = architectureDiagram(workload, provider, mode);
      expect(validateDiagramSpec(spec).valid).toBe(true);
      expect(spec.nodes.map(n => n.id)).toEqual(stages);
      expect(translations[workload][provider]).toHaveLength(8);
      expect(layoutDiagram(spec)).toEqual(layoutDiagram({ ...spec, nodes: [...spec.nodes].reverse(), edges: [...spec.edges].reverse() }));
      expect(architectureFigure(workload, provider, mode).fallbackText).toContain('Source:');
      expect(JSON.stringify(spec)).not.toMatch(/https:|\.svg|\.png/);
      expect(JSON.stringify(architectureFigure(workload, provider, mode))).not.toMatch(/github\.com|julian-passebecq|26f1ca6e501f68b3bab4217c4d13059a6796134e/);
    }
  });
  it('reuses column-level lineage without adding a SQL parser', () => expect(validateLineageSpec(lineageFigure.spec).valid).toBe(true));
});
