import { validateProjectRecord, type ProjectRegistry } from '@datapass/content';
import records from './projects.registry.json';

export const PROJECT_REGISTRY_VERSION = '3' as const;
export const PROJECT_REGISTRY_REVIEWED_AT = '2026-09-04T00:00:00Z';
export const projectRegistryValidationIssues = records.flatMap((record, index) => validateProjectRecord(record, `projects[${index}]`).issues);
if (new Set(records.map((record) => record.id)).size !== records.length || projectRegistryValidationIssues.length) throw new Error('Invalid canonical public Project Registry');
export const projectRegistry = records as ProjectRegistry;
export const projectRegistryEntryNotes = Object.fromEntries(projectRegistry.map((project) => [project.id, {
  destination: project.url.startsWith('https://github.com/') ? 'source' : 'website',
  provenance: project.id === 'project.datapass-visual-platform' ? 'workspace-baseline' : project.id === 'project.portfolio' || project.id === 'project.d3-visual-studio' ? 'v2-handoff-template' : 'v3-handoff',
  statusMeaning: 'Declared project status; availability is not monitored. Source links do not imply a deployed app.',
}])) as Readonly<Record<string, { destination: 'source' | 'website'; provenance: string; statusMeaning: string }>>;
