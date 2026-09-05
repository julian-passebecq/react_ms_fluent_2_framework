import { describe, expect, it } from 'vitest';
import { compileWorkflowRunFrame, getLineagePortId, validateDiagramSpec, validateLineageSpec, validateWorkflowSpec } from '@conceptmotion/core';
import { dataPlatformFigures, dataPlatformFigure, salesStarSchema, salesColumnLineage, salesKpiLineage, medallionLineage, lakehouseArchitecture, platformProviders, backfillTopology, backfillWorkflow } from '../../content/data-platform';
import { recommendedSceneViewport, LineageRenderer, freezeSvgElement, type SvgSceneSpec } from '../../packages/svg/src';
import { lineageGeometry } from '../../packages/svg/src/renderers/lineage';
import { validateAuthoredSpec } from '../../scripts/validate-specs';
import { visualExplanationFigure } from '../../content/visuals/explanation-examples';
import distribution from '../../consumer-source.json';

describe('portable data-platform authoring', () => {
  it('distributes a narrow public entrypoint and validates every production contract', () => {
    expect(distribution.packages['@datapass/canonical'].files).toContain('data-platform/index.ts');
    expect(dataPlatformFigures).toHaveLength(12);
    expect(new Set(dataPlatformFigures.map(figure => figure.id)).size).toBe(12);
    expect(() => dataPlatformFigure('missing')).toThrow('Unknown data-platform');
    for (const figure of dataPlatformFigures) {
      expect(validateAuthoredSpec('figure', figure).valid, figure.id).toBe(true);
      const scene = figure.spec as unknown as SvgSceneSpec;
      const valid = scene.kind === 'lineage' ? validateLineageSpec(scene) : scene.kind === 'diagram' ? validateDiagramSpec(scene) : validateWorkflowSpec(scene);
      expect(valid, figure.id).toEqual({ valid: true, issues: [] });
      expect(JSON.stringify(figure.spec)).not.toMatch(/"(?:x|y|width|height|path|selector|offset)":/);
    }
  });
  it('preserves business grain, three many-to-one FK/PK links and cross-figure endpoint identity', () => {
    const fact = salesStarSchema.assets.find(asset => asset.model?.kind === 'fact')!;
    expect(fact.model?.grain).toBe('One row per order line');
    expect(salesStarSchema.assets.filter(asset => asset.model?.kind === 'dimension')).toHaveLength(3);
    expect(salesStarSchema.relations.every(relation => relation.relationship.cardinality === 'many-to-one' && relation.relationship.filterDirection === 'dimension-to-fact')).toBe(true);
    const columnTarget = salesColumnLineage.relations.find(relation => relation.id === 'publish-amount_clean')!.target;
    const measureSource = salesKpiLineage.relations.find(relation => relation.id === 'measure-revenue')!.sources[0];
    expect(getLineagePortId(columnTarget)).toBe(getLineagePortId(measureSource));
    expect(salesColumnLineage.relations.find(relation => relation.id === 'derive-date-key')).toMatchObject({ changeType: 'derive', target: { columnId: 'date_key' } });
  });
  it('changes only vocabulary across provider lenses and preserves context responsibilities', () => {
    const conceptual = lakehouseArchitecture();
    for (const provider of platformProviders) {
      const spec = lakehouseArchitecture(provider);
      expect(spec.nodes.map(node => node.id)).toEqual(conceptual.nodes.map(node => node.id));
      expect(spec.edges).toEqual(conceptual.edges);
      expect(spec.nodes.find(node => node.id === 'govern')?.metadata?.appliesTo).toHaveLength(6);
      expect(validateAuthoredSpec('diagram', spec).valid).toBe(true);
      expect(lakehouseArchitecture(provider)).toEqual(spec);
    }
    expect(() => lakehouseArchitecture('unknown' as never)).toThrow('Unknown platform');
  });
  it('reuses the existing backfill trace while keeping topology free of run state', () => {
    expect(dataPlatformFigure('de-backfill')).toBe(visualExplanationFigure('de-backfill'));
    expect(backfillWorkflow).toBe(visualExplanationFigure('de-backfill').spec);
    expect(backfillTopology).not.toHaveProperty('runs');
    expect(dataPlatformFigure('backfill-workflow-topology').spec).not.toHaveProperty('runs');
    const at = (i: number) => compileWorkflowRunFrame(backfillWorkflow, backfillWorkflow.runs![0].id, i).states;
    expect(at(1)).toMatchObject({ day1: { status: 'running' }, day2: { status: 'running' }, publish: { status: 'pending' } });
    expect(at(2)).toMatchObject({ day2: { status: 'retrying', attempt: 2 }, publish: { status: 'pending' } });
    expect(at(3)).toMatchObject({ day1: { status: 'success' }, day2: { status: 'success' }, publish: { status: 'running' } });
  });
  it('uses deterministic shared layouts and emits visible grain, PK/FK, filters and real column ports', () => {
    for (const spec of [salesStarSchema, salesColumnLineage, salesKpiLineage, medallionLineage]) {
      const geometry = lineageGeometry(spec);
      const viewport = recommendedSceneViewport(spec, 'compact');
      const nodes = [...geometry.nodes.values()];
      for (const node of nodes) {
        expect(node.x).toBeGreaterThanOrEqual(0);
        expect(node.x + node.width).toBeLessThanOrEqual(viewport.width);
        expect(node.y + node.height + 68).toBeLessThanOrEqual(viewport.height);
        for (const other of nodes.filter(n => n.id !== node.id)) {
          expect(Math.min(node.x + node.width, other.x + other.width) > Math.max(node.x, other.x) && Math.min(node.y + node.height, other.y + other.height) > Math.max(node.y, other.y)).toBe(false);
        }
      }
      expect(lineageGeometry({ ...spec, assets: [...spec.assets].reverse(), relations: [...spec.relations].reverse() })).toEqual(geometry);
      const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const renderer = new LineageRenderer();
      renderer.mount(host, { spec }, { ...viewport, reducedMotion: true, onSelect: () => {} });
      const before = freezeSvgElement(host);
      renderer.update({ spec });
      expect(freezeSvgElement(host)).toBe(before);
      expect(host.querySelectorAll('[data-role="asset"]')).toHaveLength(spec.assets.length);
      if (spec === salesStarSchema) {
        expect(host.querySelector('[data-role="grain"]')?.textContent).toContain('One row per order line');
        expect([...host.querySelectorAll('[data-role="role"]')].filter(node => node.textContent === 'FK')).toHaveLength(3);
        expect([...host.querySelectorAll('[data-role="filter-direction"]')].every(node => node.textContent === 'filter ←')).toBe(true);
        const key = host.querySelector('[data-column-id="sales_key"]')!;
        expect(key.getAttribute('aria-pressed')).toBe('false');
        renderer.update({ spec }, { selectedId: getLineagePortId({ assetId: 'gold.fact_sales', columnId: 'sales_key' }) });
        expect(key.getAttribute('aria-pressed')).toBe('true');
        expect(key.getAttribute('aria-label')).toContain('primary key');
      }
      renderer.destroy();
    }
  });
});
