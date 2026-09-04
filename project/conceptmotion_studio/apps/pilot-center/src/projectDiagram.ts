import type { DiagramSpec } from '@conceptmotion/core';
import { resolveLocalizedText, serializeDeterministic, toCanonicalJsonValue, type FigureSpec, type ProjectRegistry } from '@datapass/content';

/** Public export accepts the canonical artifact only, never Pilot state. */
export function serializePublicProjectRegistry(registry: ProjectRegistry): string {
  return `${serializeDeterministic([...registry].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0))}\n`;
}

export function projectRegistryToDiagram(registry: ProjectRegistry): DiagramSpec {
  const projects = [...registry].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  if (new Set(projects.map((project) => project.id)).size !== projects.length || projects.some((project) => project.id === 'project-hub')) throw new Error('Project IDs must be unique and distinct from the hub.');
  return {
    kind: 'diagram', version: '1', id: 'pilot.project-galaxy', title: 'Project Galaxy',
    description: 'One shared project registry, with direct links and local next actions.',
    layout: { provider: 'radial', hubId: 'project-hub' },
    nodes: [{ id: 'project-hub', label: 'Project hub', kind: 'hub', iconId: 'project.framework' }, ...projects.map((project) => ({
      id: project.id, label: resolveLocalizedText(project.title), kind: project.kind, iconId: project.iconId ?? 'project.framework',
      metadata: { status: project.status, kind: project.kind },
    }))],
    edges: projects.map((project) => ({ id: `hub:${project.id}`, from: { nodeId: 'project-hub' }, to: { nodeId: project.id }, flowKind: 'dependency' as const })),
  };
}
export function projectGalaxyFigure(registry: ProjectRegistry): FigureSpec {
  return {
    id: 'figure.pilot.project-galaxy', kind: 'diagram', rendererId: 'diagram.flow', title: 'Project Galaxy',
    takeaway: 'Select a project to inspect its next action and destination.',
    fallbackText: registry.map((project) => `${resolveLocalizedText(project.title)}: ${project.status}`).join('. '),
    profile: 'professional', spec: toCanonicalJsonValue(projectRegistryToDiagram(registry)),
  };
}
