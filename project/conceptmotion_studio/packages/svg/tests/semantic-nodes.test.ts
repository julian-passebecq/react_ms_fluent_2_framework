import { describe, expect, it } from 'vitest';
import type { DiagramSpec } from '@conceptmotion/core';
import { DiagramRenderer, recommendedSceneViewport } from '../src';

const spec: DiagramSpec = { kind: 'diagram', version: '4', id: 'semantic-nodes', title: 'Nodes', layout: { provider: 'radial', density: 'comfortable', hubId: 'hub' }, groups: [{ id: 'learning', label: 'Learning', kind: 'category', childNodeIds: ['source'] }], nodes: [{ id: 'hub', label: 'Project hub', kind: 'hub', iconId: 'project.framework' }, { id: 'source', label: 'An explicitly labelled data source', kind: 'source', iconId: 'data.source', groupId: 'learning', metadata: { status: 'building' } }, { id: 'unknown', label: 'Future node', iconId: 'future.asset' }], edges: [{ id: 'link', from: { nodeId: 'hub' }, to: { nodeId: 'source' } }] };
describe('opt-in semantic Diagram nodes', () => {
  it('resolves generic icons, safe fallback, category labels and real public statuses', () => {
    const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); const renderer = new DiagramRenderer();
    renderer.mount(host, { spec, activeEdgeIds: ['link'] }, { ...recommendedSceneViewport(spec, 'expanded'), reducedMotion: true });
    expect(host.querySelector('[data-node-id="source"] [data-role="icon"]')?.getAttribute('data-icon-resolved')).toBe('data.source');
    expect(host.querySelector('[data-node-id="source"] [data-role="label"]')?.getAttribute('font-size')).toBe('14');
    expect(host.querySelector('[data-node-id="unknown"] [data-role="icon"]')?.textContent).toBe('?');
    expect(host.querySelector('[data-role="category"]')?.textContent).toBe('Learning');
    expect(host.querySelector('[data-node-id="source"] [data-role="status"]')?.textContent).toBe('BUILDING');
    expect(host.querySelector('[data-node-id="unknown"] [data-role="status"]')?.textContent).toBe('');
    expect(host.querySelectorAll('[data-role="group"], [data-role="port"]')).toHaveLength(0);
    expect(host.querySelector('[data-node-id="hub"] rect')?.getAttribute('fill')).not.toBe(host.querySelector('[data-node-id="source"] rect')?.getAttribute('fill'));
    const before = renderer.freeze(); renderer.update({ spec, activeEdgeIds: ['link'] }); expect(renderer.freeze()).toBe(before);
    renderer.destroy();
  });
  it('switches density on stable nodes and restores legacy labels and ports', () => {
    const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); const renderer = new DiagramRenderer();
    const legacy = { ...spec, layout: { ...spec.layout, density: undefined } };
    renderer.mount(host, { spec: legacy }, { reducedMotion: true });
    const node = host.querySelector('[data-node-id="source"]');
    expect(host.getAttribute('viewBox')).toBe('0 0 960 540');
    expect(host.querySelectorAll('[data-role="port"]')).toHaveLength(6);
    renderer.update({ spec });
    expect(host.querySelector('[data-node-id="source"]')).toBe(node);
    expect(node?.querySelector('[data-role="label"]')?.textContent).toBe('An explicitlylabelled data…');
    renderer.update({ spec: legacy });
    expect(node?.querySelectorAll('tspan')).toHaveLength(0);
    expect(host.querySelectorAll('[data-role="port"]')).toHaveLength(6);
    renderer.update({ spec: { ...spec, layout: { density: 'comfortable' } } });
    expect(node?.querySelector('[data-role="background"]')?.getAttribute('height')).toBe('68');
    expect(node?.querySelector('[data-role="label"]')?.getAttribute('font-size')).toBe('11');
    expect(host.querySelectorAll('[data-semantic-node="true"]')).toHaveLength(0);
    renderer.destroy();
  });
  it('wraps wide fallback-font labels by glyph budget while retaining full semantic names', () => {
    const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); const renderer = new DiagramRenderer();
    const labels = ['Data Factory Pipelines / Git', 'ML / Data Science Web', 'W'.repeat(100_000)];
    const wrapped = { ...spec, groups: [], nodes: labels.map((label, index) => ({ id: index ? `n${index}` : 'hub', label })) };
    renderer.mount(host, { spec: { ...wrapped, edges: [] } }, { reducedMotion: true });
    const lines = (id: string) => [...host.querySelectorAll(`[data-node-id="${id}"] [data-role="label"] tspan`)].map(span => span.textContent);
    expect(lines('hub')).toEqual(['Data Factory', 'Pipelines / Git']);
    expect(lines('n1')).toEqual(['ML / Data', 'Science Web']);
    expect(lines('n2')).toEqual(['WWWWWWWWWW', 'WWWWWWWWW…']);
    for (const [index, label] of labels.entries()) {
      const node = host.querySelector(`[data-node-id="${index ? `n${index}` : 'hub'}"]`)!;
      expect(node.getAttribute('aria-label')).toContain(label);
      expect(node.querySelector('[data-role="label"]')?.getAttribute('font-size')).toBe('14');
    }
    const frozen = renderer.freeze(); renderer.update({ spec: { ...wrapped, edges: [] } }); expect(renderer.freeze()).toBe(frozen);
    renderer.destroy();
  });
});
