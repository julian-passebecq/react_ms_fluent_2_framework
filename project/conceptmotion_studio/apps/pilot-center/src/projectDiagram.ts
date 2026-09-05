import type { DiagramSpec } from '@conceptmotion/core';
import { resolveLocalizedText, serializeDeterministic, toCanonicalJsonValue, type FigureSpec, type ProjectRegistry } from '@datapass/content';

export const projectCategories = { learning: 'Learning', tools: 'Tools', platform: 'Platform', portfolio: 'Portfolio', other: 'Other' } as const;
export type ProjectCategory = keyof typeof projectCategories;
/** Local navigation grouping derived from canonical kind; never a second registry. */
export function projectCategory(kind: string): ProjectCategory {
  if (['learning', 'practice', 'assessment', 'explainer', 'architecture-learning'].includes(kind)) return 'learning';
  if (['visualization-studio', 'personal-tool'].includes(kind)) return 'tools';
  if (kind === 'framework') return 'platform';
  if (kind === 'portfolio') return 'portfolio';
  return 'other';
}

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
    layout: { provider: 'radial', hubId: 'project-hub', density: 'comfortable' },
    groups: (Object.keys(projectCategories) as ProjectCategory[]).filter(category => projects.some(project => projectCategory(project.kind) === category)).map(category => ({ id: `category:${category}`, label: projectCategories[category], kind: 'category', childNodeIds: projects.filter(project => projectCategory(project.kind) === category).map(project => project.id) })),
    nodes: [{ id: 'project-hub', label: 'Project hub', kind: 'hub', iconId: 'project.framework' }, ...projects.map((project) => ({
      id: project.id, label: resolveLocalizedText(project.title), kind: project.kind, groupId: `category:${projectCategory(project.kind)}`, iconId: project.iconId ?? 'project.framework',
      metadata: { status: project.status, kind: project.kind },
    }))],
    edges: projects.map((project) => ({ id: `hub:${project.id}`, from: { nodeId: 'project-hub' }, to: { nodeId: project.id }, flowKind: 'dependency' as const })),
  };
}
export function projectGalaxyFigure(registry: ProjectRegistry, selectedId?: string): FigureSpec {
  const diagram = projectRegistryToDiagram(registry);
  const selected = registry.some(project => project.id === selectedId) ? selectedId : undefined;
  return {
    id: 'figure.pilot.project-galaxy', kind: 'diagram', rendererId: 'diagram.flow', title: 'Project Galaxy',
    takeaway: 'Select a project to inspect its next action and destination.',
    fallbackText: registry.map((project) => `${resolveLocalizedText(project.title)}: ${project.status}`).join('. '),
    profile: 'professional', spec: toCanonicalJsonValue({ ...diagram, frames: [{ id: 'selection', activeNodeIds: selected ? ['project-hub', selected] : ['project-hub'], activeEdgeIds: selected ? [`hub:${selected}`] : [] }] }),
  };
}
