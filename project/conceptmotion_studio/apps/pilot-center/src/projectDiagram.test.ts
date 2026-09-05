import { describe, expect, it } from 'vitest';
import { createIconRegistry, layoutDiagram, validateDiagramSpec } from '@conceptmotion/core';
import { validateFigureSpec } from '@datapass/content';
import { projectRegistry } from '../../../content/projects';
import { projectCategory, projectGalaxyFigure, projectRegistryToDiagram, serializePublicProjectRegistry } from './projectDiagram';
import { emptyPilotState, parsePrivateOverlay } from './state';

describe('shared-registry Project Galaxy adapter', () => {
  it('uses every canonical project ID and the production radial DiagramSpec contract', () => {
    const diagram = projectRegistryToDiagram(projectRegistry);
    expect(diagram.nodes).toHaveLength(projectRegistry.length + 1);
    expect(diagram.nodes.map((node) => node.id)).toEqual(['project-hub', ...projectRegistry.map((project) => project.id).sort()]);
    expect(diagram.layout).toEqual({ provider: 'radial', hubId: 'project-hub', density: 'comfortable' });
    expect(validateDiagramSpec(diagram).valid).toBe(true);
    expect(validateFigureSpec(projectGalaxyFigure(projectRegistry)).valid).toBe(true);
  });
  it('derives contiguous, disjoint categories and public statuses from the canonical registry', () => {
    const diagram = projectRegistryToDiagram(projectRegistry);
    expect(diagram.groups?.map(group => group.label)).toEqual(['Learning', 'Tools', 'Platform', 'Portfolio']);
    expect(diagram.groups?.map(group => group.childNodeIds?.length)).toEqual([6, 2, 1, 1]);
    expect(diagram.groups?.flatMap(group => group.childNodeIds ?? []).sort()).toEqual(projectRegistry.map(project => project.id).sort());
    const icons = createIconRegistry();
    for (const project of projectRegistry) {
      const node = diagram.nodes.find(node => node.id === project.id)!;
      expect(node.groupId).toBe(`category:${projectCategory(project.kind)}`);
      expect(node.metadata).toEqual({ status: project.status, kind: project.kind });
      expect(icons.resolve(node.iconId!).resolvedId).not.toBe('generic.unknown');
    }
    expect(projectCategory('future-kind')).toBe('other');
    const figure = projectGalaxyFigure(projectRegistry, 'project.formation');
    expect((figure.spec as { frames: unknown[] }).frames).toEqual([{ id: 'selection', activeNodeIds: ['project-hub', 'project.formation'], activeEdgeIds: ['hub:project.formation'] }]);
    expect(JSON.stringify(projectGalaxyFigure(projectRegistry, 'not-a-project'))).not.toContain('not-a-project');
  });
  it('compiles input permutations to identical semantic specs and deterministic finite geometry', () => {
    const diagram = projectRegistryToDiagram(projectRegistry);
    expect(projectRegistryToDiagram([...projectRegistry].reverse())).toEqual(diagram);
    const layout = layoutDiagram(diagram);
    expect(layout).toEqual(layoutDiagram(diagram));
    expect(layout.nodes.every((node) => [node.x, node.y, node.width, node.height].every(Number.isFinite))).toBe(true);
    expect(() => projectRegistryToDiagram([projectRegistry[0], projectRegistry[0]])).toThrow(/unique/);
  });
  it('keeps private overlays and annotations out of public registry and galaxy exports', () => {
    const ids = new Set(projectRegistry.map((project) => project.id));
    const local = { ...emptyPilotState(), overlays: parsePrivateOverlay('{"schemaVersion":1,"overlays":[{"projectId":"project.formation","annotation":"PRIVATE_MARKER","privateRepository":"https://example.test/secret-marker"}]}', ids) };
    expect(local.overlays[0].annotation).toBe('PRIVATE_MARKER');
    const publicExport = serializePublicProjectRegistry(projectRegistry);
    const galaxy = JSON.stringify(projectGalaxyFigure(projectRegistry));
    for (const output of [publicExport, galaxy]) {
      expect(output).not.toContain('PRIVATE_MARKER');
      expect(output).not.toContain('secret-marker');
    }
    expect(JSON.parse(publicExport)).toHaveLength(projectRegistry.length);
  });
});
