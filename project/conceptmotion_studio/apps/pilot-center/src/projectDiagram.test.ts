import { describe, expect, it } from 'vitest';
import { layoutDiagram, validateDiagramSpec } from '@conceptmotion/core';
import { validateFigureSpec } from '@datapass/content';
import { projectRegistry } from '../../../content/projects';
import { projectGalaxyFigure, projectRegistryToDiagram, serializePublicProjectRegistry } from './projectDiagram';
import { emptyPilotState, parsePrivateOverlay } from './state';

describe('shared-registry Project Galaxy adapter', () => {
  it('uses every canonical project ID and the production radial DiagramSpec contract', () => {
    const diagram = projectRegistryToDiagram(projectRegistry);
    expect(diagram.nodes).toHaveLength(projectRegistry.length + 1);
    expect(diagram.nodes.map((node) => node.id)).toEqual(['project-hub', ...projectRegistry.map((project) => project.id).sort()]);
    expect(diagram.layout).toEqual({ provider: 'radial', hubId: 'project-hub' });
    expect(validateDiagramSpec(diagram).valid).toBe(true);
    expect(validateFigureSpec(projectGalaxyFigure(projectRegistry)).valid).toBe(true);
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
