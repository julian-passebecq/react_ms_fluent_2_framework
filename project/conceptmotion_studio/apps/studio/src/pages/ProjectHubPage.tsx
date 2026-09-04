import { Badge, Button, Caption1, Text } from '@fluentui/react-components';
import {
  AppsListDetail24Regular,
  Braces24Regular,
  DataTrending24Regular,
  GridDots24Regular,
} from '@fluentui/react-icons';
import type { ProjectRecord, ProjectStatus } from '@datapass/content';
import {
  CatalogView,
  DetailDrawer,
  EntityCard,
  EntityTable,
  FacetFilter,
  FreshnessStamp,
  MetricStrip,
  OfficialLink,
  PageHeader,
  SortControl,
  StatusBadge,
  TagList,
  VersionBadge,
  ViewToggle,
  filterAndSortCatalogItems,
  setCatalogFacetValues,
  setCatalogQuery,
  setCatalogSort,
  setCatalogView,
  useCatalogUrlState,
  useLocale,
  type CatalogUrlConfig,
  type EntityTableColumn,
  type StatusTone,
} from '@datapass/ui';
import { useMemo, useState } from 'react';
import {
  PROJECT_REGISTRY_VERSION,
  projectRegistry,
  projectRegistryEntryNotes,
} from '../data/projectRegistry';
import './ProjectHubPage.css';

const projectHubUrlConfig: CatalogUrlConfig = {
  allowedFacets: ['kind', 'status'],
  allowedSorts: ['recommended', 'title', 'status'],
  defaultSort: 'recommended',
  defaultView: 'cards',
};

const projectIconRegistry = {
  'project.portfolio': AppsListDetail24Regular,
  'project.visualization': DataTrending24Regular,
  'project.framework': Braces24Regular,
} as const;

const statusTone: Record<ProjectStatus, StatusTone> = {
  active: 'success',
  experimental: 'informative',
  legacy: 'warning',
  archived: 'neutral',
};

const copy = {
  en: {
    eyebrow: 'DATAPASS PROJECT REGISTRY · LOCAL FIXTURE',
    title: 'Project Hub',
    description: 'Explore canonical Datapass destinations through the reusable Catalog primitives. Search, facets, sorting and view mode are stored in the URL.',
    noMonitoring: 'Registry status only · no live monitoring',
    sourceNote: 'This source-controlled snapshot records declared registry status, not website uptime. “Reviewed” means the registry entry was checked against the V2 handoff or workspace baseline.',
    search: 'Search projects, features and technologies',
    clearSearch: 'Clear project search',
    filters: 'Project filters',
    results: 'Project registry results',
    noResults: 'No projects match this URL-backed view. Clear search or filters to restore the registry.',
    kind: 'Project type',
    status: 'Registry status',
    clear: 'Clear',
    sort: 'Sort projects',
    recommended: 'Recommended',
    titleSort: 'Title A–Z',
    statusSort: 'Status',
    view: 'Project view',
    cards: 'Cards',
    table: 'Table',
    projects: 'Projects',
    active: 'Active records',
    featured: 'Featured',
    destinations: 'Public sites',
    direct: 'Direct HTTPS destinations',
    statusDetail: 'Local registry value',
    featuredDetail: 'Curated in the V2 handoff',
    website: 'Visit website',
    source: 'View source',
    details: 'Details',
    close: 'Close project details',
    reviewed: 'Registry reviewed',
    identity: 'Stable ID',
    type: 'Type',
    technologies: 'Technologies',
    features: 'Features',
    locales: 'Locales',
    provenance: 'Registry provenance',
    statusMeaning: 'Status meaning',
    repository: 'Repository',
    projectTable: 'Project Registry table',
    result: (count: number) => `${count} project${count === 1 ? '' : 's'}`,
  },
  no: {
    eyebrow: 'DATAPASS PROSJEKTREGISTER · LOKAL FIXTURE',
    title: 'Prosjekthub',
    description: 'Utforsk kanoniske Datapass-mål med de gjenbrukbare katalogkomponentene. Søk, fasetter, sortering og visning lagres i URL-en.',
    noMonitoring: 'Kun registerstatus · ingen live-overvåking',
    sourceNote: 'Dette kildekontrollerte øyeblikksbildet viser oppgitt registerstatus, ikke nettstedets oppetid. «Gjennomgått» betyr kontrollert mot V2-overleveringen eller arbeidsområdets baseline.',
    search: 'Søk i prosjekter, funksjoner og teknologier',
    clearSearch: 'Tøm prosjektsøk',
    filters: 'Prosjektfiltre',
    results: 'Resultater fra prosjektregisteret',
    noResults: 'Ingen prosjekter samsvarer med denne URL-baserte visningen. Tøm søk eller filtre for å gjenopprette registeret.',
    kind: 'Prosjekttype',
    status: 'Registerstatus',
    clear: 'Tøm',
    sort: 'Sorter prosjekter',
    recommended: 'Anbefalt',
    titleSort: 'Tittel A–Å',
    statusSort: 'Status',
    view: 'Prosjektvisning',
    cards: 'Kort',
    table: 'Tabell',
    projects: 'Prosjekter',
    active: 'Aktive poster',
    featured: 'Fremhevet',
    destinations: 'Offentlige nettsteder',
    direct: 'Direkte HTTPS-mål',
    statusDetail: 'Lokal registerverdi',
    featuredDetail: 'Kurert i V2-overleveringen',
    website: 'Besøk nettsted',
    source: 'Se kildekode',
    details: 'Detaljer',
    close: 'Lukk prosjektdetaljer',
    reviewed: 'Register gjennomgått',
    identity: 'Stabil ID',
    type: 'Type',
    technologies: 'Teknologier',
    features: 'Funksjoner',
    locales: 'Språk',
    provenance: 'Registerproveniens',
    statusMeaning: 'Betydning av status',
    repository: 'Kodelager',
    projectTable: 'Tabell for prosjektregister',
    result: (count: number) => `${count} prosjekt${count === 1 ? '' : 'er'}`,
  },
} as const;

function formatToken(value: string): string {
  return value.replace(/-/g, ' ').replace(/(^|\s)\p{L}/gu, (character) => character.toLocaleUpperCase());
}

function safeHttpsUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value).protocol === 'https:' ? value : undefined;
  } catch {
    return undefined;
  }
}

function projectTags(project: ProjectRecord) {
  return [...new Set([...(project.features ?? []), ...(project.technologies ?? [])])]
    .slice(0, 5)
    .map((label) => ({ id: `${project.id}.${label}`, label }));
}

function compareTitle(left: ProjectRecord, right: ProjectRecord): number {
  return left.title.localeCompare(right.title, 'en', { sensitivity: 'base' });
}

function compareRecommended(left: ProjectRecord, right: ProjectRecord): number {
  const featured = Number(Boolean(right.featured)) - Number(Boolean(left.featured));
  if (featured !== 0) return featured;
  return (left.order ?? Number.MAX_SAFE_INTEGER) - (right.order ?? Number.MAX_SAFE_INTEGER) || compareTitle(left, right);
}

function ProjectIcon({ project }: { project: ProjectRecord }) {
  const Icon = project.iconId && project.iconId in projectIconRegistry
    ? projectIconRegistry[project.iconId as keyof typeof projectIconRegistry]
    : GridDots24Regular;
  return <div className="project-hub__icon" aria-hidden="true"><Icon /></div>;
}

export function ProjectHubPage() {
  const { locale } = useLocale();
  const labels = copy[locale];
  const [urlState, setUrlState] = useCatalogUrlState({ config: projectHubUrlConfig });
  const [selectedProject, setSelectedProject] = useState<ProjectRecord>();

  const projects = useMemo(() => filterAndSortCatalogItems(projectRegistry, urlState, {
    searchText: (project) => [
      project.id,
      project.title,
      project.summary ?? '',
      project.kind,
      project.status,
      ...(project.features ?? []),
      ...(project.technologies ?? []),
    ],
    facetValues: (project, facetId) => facetId === 'kind' ? [project.kind] : facetId === 'status' ? [project.status] : [],
    sortComparators: {
      recommended: compareRecommended,
      title: compareTitle,
      status: (left, right) => left.status.localeCompare(right.status) || compareTitle(left, right),
    },
  }), [urlState]);

  const statuses = useMemo(() => [...new Set(projectRegistry.map((project) => project.status))].sort(), []);
  const kinds = useMemo(() => [...new Set(projectRegistry.map((project) => project.kind))].sort(), []);
  const countFacet = (facet: 'kind' | 'status', value: string) => projectRegistry.filter((project) => project[facet] === value).length;

  const directProjectLink = (project: ProjectRecord) => {
    const href = safeHttpsUrl(project.url);
    if (!href) return null;
    const note = projectRegistryEntryNotes[project.id];
    return (
      <OfficialLink
        href={href}
        aria-label={`${note.destination === 'source' ? labels.source : labels.website}: ${project.title}`}
        externalLabel={locale === 'no' ? 'åpnes i en ny fane' : 'opens in a new tab'}
      >
        {note.destination === 'source' ? labels.source : labels.website}
      </OfficialLink>
    );
  };

  const columns: readonly EntityTableColumn<ProjectRecord>[] = [
    {
      id: 'project',
      header: labels.projects,
      renderCell: (project) => (
        <div className="project-hub__table-project">
          <Text weight="semibold">{project.title}</Text>
          <Caption1>{project.id}</Caption1>
        </div>
      ),
    },
    { id: 'kind', header: labels.type, renderCell: (project) => formatToken(project.kind) },
    {
      id: 'status',
      header: labels.status,
      renderCell: (project) => <StatusBadge label={formatToken(project.status)} tone={statusTone[project.status]} />,
    },
    { id: 'destination', header: labels.destinations, renderCell: directProjectLink },
    {
      id: 'details',
      header: <span className="project-hub__visually-hidden">{labels.details}</span>,
      renderCell: (project) => (
        <Button
          size="small"
          appearance="subtle"
          aria-label={`${labels.details}: ${project.title}`}
          onClick={() => setSelectedProject(project)}
        >
          {labels.details}
        </Button>
      ),
    },
  ];

  const selectedNote = selectedProject ? projectRegistryEntryNotes[selectedProject.id] : undefined;
  const selectedUrl = safeHttpsUrl(selectedProject?.url);
  const selectedRepository = safeHttpsUrl(selectedProject?.repository);

  return (
    <CatalogView
      className="project-hub"
      data-testid="project-hub-page"
      items={projects}
      getItemId={(project) => project.id}
      query={urlState.query}
      onQueryChange={(query) => setUrlState((state) => setCatalogQuery(state, query))}
      view={urlState.view}
      searchLabel={labels.search}
      searchPlaceholder={labels.search}
      clearSearchLabel={labels.clearSearch}
      filtersLabel={labels.filters}
      resultsLabel={labels.results}
      resultCountLabel={labels.result}
      emptyState={labels.noResults}
      header={(
        <PageHeader
          eyebrow={labels.eyebrow}
          title={labels.title}
          description={labels.description}
          metadata={(
            <>
              <VersionBadge version={PROJECT_REGISTRY_VERSION} prefix="Registry contract" />
              <Badge appearance="outline">{labels.noMonitoring}</Badge>
            </>
          )}
        />
      )}
      metrics={(
        <MetricStrip
          label={locale === 'no' ? 'Sammendrag av prosjektregisteret' : 'Project Registry summary'}
          metrics={[
            { id: 'projects', label: labels.projects, value: projectRegistry.length, detail: labels.direct, tone: 'informative' },
            { id: 'active', label: labels.active, value: projectRegistry.filter((project) => project.status === 'active').length, detail: labels.statusDetail, tone: 'success' },
            { id: 'featured', label: labels.featured, value: projectRegistry.filter((project) => project.featured).length, detail: labels.featuredDetail },
            { id: 'destinations', label: labels.destinations, value: projectRegistry.filter((project) => projectRegistryEntryNotes[project.id].destination === 'website').length, detail: labels.noMonitoring },
          ]}
        />
      )}
      controls={(
        <div className="project-hub__controls">
          <SortControl
            label={labels.sort}
            value={urlState.sort}
            options={[
              { value: 'recommended', label: labels.recommended },
              { value: 'title', label: labels.titleSort },
              { value: 'status', label: labels.statusSort },
            ]}
            onChange={(sort) => setUrlState((state) => setCatalogSort(state, sort))}
          />
          <ViewToggle
            label={labels.view}
            value={urlState.view}
            options={[
              { value: 'cards', label: labels.cards },
              { value: 'table', label: labels.table },
            ]}
            onChange={(view) => setUrlState((state) => setCatalogView(state, view))}
          />
        </div>
      )}
      facets={(
        <div className="project-hub__facets">
          <FacetFilter
            label={labels.status}
            clearLabel={labels.clear}
            options={statuses.map((status) => ({ value: status, label: formatToken(status), count: countFacet('status', status) }))}
            selectedValues={urlState.filters.status ?? []}
            onChange={(values) => setUrlState((state) => setCatalogFacetValues(state, 'status', values))}
          />
          <FacetFilter
            label={labels.kind}
            clearLabel={labels.clear}
            options={kinds.map((kind) => ({ value: kind, label: formatToken(kind), count: countFacet('kind', kind) }))}
            selectedValues={urlState.filters.kind ?? []}
            onChange={(values) => setUrlState((state) => setCatalogFacetValues(state, 'kind', values))}
          />
          <p className="project-hub__source-note">{labels.sourceNote}</p>
        </div>
      )}
      renderCard={(project) => (
        <EntityCard
          entityId={project.id}
          selected={selectedProject?.id === project.id}
          title={project.title}
          description={project.summary}
          eyebrow={`${formatToken(project.kind)} · ${formatToken(project.status)}`}
          media={<ProjectIcon project={project} />}
          metadata={(
            <FreshnessStamp
              verifiedAt={project.verifiedAt}
              prefix={labels.reviewed}
              locale={locale === 'no' ? 'nb-NO' : 'en'}
            />
          )}
          tags={projectTags(project)}
          footer={<StatusBadge label={formatToken(project.status)} tone={statusTone[project.status]} />}
          actions={(
            <>
              <Button
                size="small"
                appearance="subtle"
                aria-haspopup="dialog"
                aria-expanded={selectedProject?.id === project.id}
                aria-label={`${labels.details}: ${project.title}`}
                onClick={() => setSelectedProject(project)}
              >
                {labels.details}
              </Button>
              {directProjectLink(project)}
            </>
          )}
        />
      )}
      renderTable={(items) => (
        <EntityTable
          items={items}
          columns={columns}
          getRowId={(project) => project.id}
          selectedRowId={selectedProject?.id}
          label={labels.projectTable}
          emptyState={labels.noResults}
        />
      )}
      detail={(
        <DetailDrawer
          open={Boolean(selectedProject)}
          onOpenChange={(open) => { if (!open) setSelectedProject(undefined); }}
          title={selectedProject?.title ?? labels.details}
          description={selectedProject?.summary}
          closeLabel={labels.close}
          actions={selectedProject && selectedUrl ? (
            <div className="project-hub__drawer-links">
              <OfficialLink href={selectedUrl} externalLabel={locale === 'no' ? 'åpnes i en ny fane' : 'opens in a new tab'}>
                {selectedNote?.destination === 'source' ? labels.source : labels.website}
              </OfficialLink>
              {selectedRepository && selectedRepository !== selectedUrl ? (
                <OfficialLink href={selectedRepository} externalLabel={locale === 'no' ? 'åpnes i en ny fane' : 'opens in a new tab'}>
                  {labels.repository}
                </OfficialLink>
              ) : null}
            </div>
          ) : undefined}
          footer={selectedProject ? (
            <FreshnessStamp
              verifiedAt={selectedProject.verifiedAt}
              prefix={labels.reviewed}
              locale={locale === 'no' ? 'nb-NO' : 'en'}
            />
          ) : undefined}
        >
          {selectedProject && selectedNote ? (
            <dl className="project-hub__facts">
              <div><dt>{labels.identity}</dt><dd><code>{selectedProject.id}</code></dd></div>
              <div><dt>{labels.type}</dt><dd>{formatToken(selectedProject.kind)}</dd></div>
              <div><dt>{labels.status}</dt><dd><StatusBadge label={formatToken(selectedProject.status)} tone={statusTone[selectedProject.status]} /></dd></div>
              <div><dt>{labels.statusMeaning}</dt><dd>{selectedNote.statusMeaning}</dd></div>
              <div><dt>{labels.provenance}</dt><dd>{formatToken(selectedNote.provenance)}</dd></div>
              <div><dt>{labels.features}</dt><dd><TagList tags={(selectedProject.features ?? []).map((feature) => ({ id: `${selectedProject.id}.feature.${feature}`, label: feature }))} /></dd></div>
              <div><dt>{labels.technologies}</dt><dd><TagList tags={(selectedProject.technologies ?? []).map((technology) => ({ id: `${selectedProject.id}.technology.${technology}`, label: technology }))} /></dd></div>
              <div><dt>{labels.locales}</dt><dd>{selectedProject.locales?.join(', ') || '—'}</dd></div>
            </dl>
          ) : null}
        </DetailDrawer>
      )}
    />
  );
}
