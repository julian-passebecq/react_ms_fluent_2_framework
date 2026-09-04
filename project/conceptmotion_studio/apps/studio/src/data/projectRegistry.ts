import {
  validateProjectRecord,
  type ContentValidationIssue,
  type ProjectRecord,
  type ProjectRegistry,
} from '@datapass/content';

export const PROJECT_REGISTRY_VERSION = '2' as const;
export const PROJECT_REGISTRY_REVIEWED_AT = '2026-09-04T00:00:00Z';

export interface ProjectRegistryEntryNote {
  readonly destination: 'website' | 'source';
  readonly provenance: 'v2-handoff-template' | 'workspace-baseline';
  readonly statusMeaning: string;
}

/**
 * Canonical, source-controlled project destinations for the Studio Project Hub.
 * `status` is registry metadata, not a live availability signal.
 */
const records = [
  {
    id: 'project.portfolio',
    title: 'Datapass Portfolio',
    summary: 'Public portfolio destination listed by the V2 handoff, covering experience, portfolio work and certifications.',
    url: 'https://datapassj.com/',
    status: 'active',
    kind: 'portfolio',
    iconId: 'project.portfolio',
    features: ['experience', 'portfolio', 'certifications'],
    technologies: ['web'],
    locales: ['en'],
    featured: true,
    order: 10,
    verifiedAt: PROJECT_REGISTRY_REVIEWED_AT,
  },
  {
    id: 'project.d3-visual-studio',
    title: 'D3 Visual Studio',
    summary: 'Public visualization sandbox listed by the V2 handoff for D3 and editorial chart exploration.',
    url: 'https://d3ecosite.netlify.app/sandbox/',
    status: 'active',
    kind: 'visualization-studio',
    iconId: 'project.visualization',
    features: ['D3', 'editorial charts', 'generator'],
    technologies: ['D3', 'web'],
    locales: ['en'],
    featured: true,
    order: 20,
    verifiedAt: PROJECT_REGISTRY_REVIEWED_AT,
  },
  {
    id: 'project.datapass-visual-platform',
    title: 'Datapass Visual Platform',
    summary: 'The source repository for this local Foundation V2 workspace. This record links to source; it does not claim a hosted Studio deployment.',
    url: 'https://github.com/julian-passebecq/react_ms_fluent_2_framework',
    repository: 'https://github.com/julian-passebecq/react_ms_fluent_2_framework',
    status: 'experimental',
    kind: 'framework',
    iconId: 'project.framework',
    features: ['visual learning', 'source-aware documentation', 'app scaffold'],
    technologies: ['React', 'TypeScript', 'Fluent UI v9'],
    locales: ['en', 'no'],
    featured: false,
    order: 30,
    verifiedAt: PROJECT_REGISTRY_REVIEWED_AT,
  },
] as const satisfies ProjectRegistry;

function validateRegistry(projects: readonly ProjectRecord[]): readonly ContentValidationIssue[] {
  const ids = new Set<string>();
  const issues = projects.flatMap((project, index) => {
    const result = validateProjectRecord(project, `projects[${index}]`);
    const duplicateIssue: ContentValidationIssue[] = ids.has(project.id)
      ? [{
        code: 'content.project.id.duplicate',
        path: `projects[${index}].id`,
        message: `Duplicate project id: ${project.id}.`,
        severity: 'error',
      }]
      : [];
    ids.add(project.id);
    return [...result.issues, ...duplicateIssue];
  });
  return issues;
}

export const projectRegistryValidationIssues = validateRegistry(records);

if (projectRegistryValidationIssues.some((issue) => issue.severity === 'error')) {
  const detail = projectRegistryValidationIssues.map((issue) => `${issue.path}: ${issue.message}`).join('; ');
  throw new Error(`Invalid Studio Project Registry: ${detail}`);
}

export const projectRegistry: ProjectRegistry = records;

export const projectRegistryEntryNotes: Readonly<Record<ProjectRecord['id'], ProjectRegistryEntryNote>> = {
  'project.portfolio': {
    destination: 'website',
    provenance: 'v2-handoff-template',
    statusMeaning: 'Active in the local V2 handoff registry; availability is not monitored.',
  },
  'project.d3-visual-studio': {
    destination: 'website',
    provenance: 'v2-handoff-template',
    statusMeaning: 'Active in the local V2 handoff registry; availability is not monitored.',
  },
  'project.datapass-visual-platform': {
    destination: 'source',
    provenance: 'workspace-baseline',
    statusMeaning: 'Experimental Foundation V2 work in the source-controlled local workspace.',
  },
};

