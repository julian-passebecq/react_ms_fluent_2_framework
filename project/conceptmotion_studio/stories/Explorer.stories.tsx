import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  CatalogView,
  DetailDrawer,
  EntityCard,
  EntityTable,
  FacetFilter,
  FreshnessStamp,
  MetricStrip,
  PageHeader,
  SortControl,
  TagList,
  ViewToggle,
  type CatalogViewMode,
} from '../packages/ui/src/index';

const meta = {
  title: 'Foundation/Explorer',
  parameters: { docs: { description: { component: 'Approved catalog explorer primitives: shared cards/tables/facets around consumer-owned data and filter policy.' } }, datapass: { guide: 'docs/AUTHORING_DX.md', sourceFiles: ['packages/ui/src/index.ts'] } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

interface GalleryProject {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly kind: 'learning' | 'tooling' | 'reference';
  readonly status: 'GA' | 'Preview';
  readonly verifiedAt: string;
  readonly tags: readonly string[];
}

const projects: readonly GalleryProject[] = [
  {
    id: 'project.conceptmotion-studio',
    title: 'ConceptMotion Studio',
    summary: 'Semantic authoring workbench for stable, meaningful visual transitions.',
    kind: 'tooling',
    status: 'GA',
    verifiedAt: '2026-09-04T10:00:00Z',
    tags: ['TypeScript', 'SVG', 'semantics'],
  },
  {
    id: 'project.dubreu-formation',
    title: 'Formation',
    summary: 'Course-first Python, SQL, and display-only PySpark learning.',
    kind: 'learning',
    status: 'Preview',
    verifiedAt: '2026-09-04T10:00:00Z',
    tags: ['courses', 'notebooks', 'assessment'],
  },
  {
    id: 'project.knowledge-atlas',
    title: 'Knowledge Atlas',
    summary: 'Source-aware product documentation with deterministic change impact.',
    kind: 'reference',
    status: 'Preview',
    verifiedAt: '2026-08-30T10:00:00Z',
    tags: ['sources', 'freshness', 'versions'],
  },
];

interface ExplorerGalleryProps {
  readonly initialView?: CatalogViewMode;
  readonly initialQuery?: string;
  readonly initialSelectedId?: string;
  readonly initialDrawerOpen?: boolean;
}

function ExplorerGallery({
  initialView = 'cards',
  initialQuery = '',
  initialSelectedId,
  initialDrawerOpen = false,
}: ExplorerGalleryProps) {
  const [query, setQuery] = useState(initialQuery);
  const [view, setView] = useState<CatalogViewMode>(initialView);
  const [kinds, setKinds] = useState<readonly string[]>([]);
  const [sort, setSort] = useState('title');
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [drawerOpen, setDrawerOpen] = useState(initialDrawerOpen);

  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = projects.filter((project) => {
      const matchesQuery = !normalizedQuery
        || `${project.title} ${project.summary} ${project.tags.join(' ')}`.toLowerCase().includes(normalizedQuery);
      return matchesQuery && (!kinds.length || kinds.includes(project.kind));
    });
    return [...filtered].sort((left, right) => sort === 'status'
      ? left.status.localeCompare(right.status) || left.title.localeCompare(right.title)
      : left.title.localeCompare(right.title));
  }, [kinds, query, sort]);

  const selected = projects.find((project) => project.id === selectedId);
  const select = (project: GalleryProject) => {
    setSelectedId(project.id);
    setDrawerOpen(true);
  };

  const table = (items: readonly GalleryProject[]) => (
    <EntityTable
      items={items}
      getRowId={(project) => project.id}
      selectedRowId={selectedId}
      onRowSelect={select}
      label="Project registry"
      columns={[
        { id: 'title', header: 'Project', renderCell: (project) => project.title },
        { id: 'kind', header: 'Kind', renderCell: (project) => project.kind },
        { id: 'status', header: 'Status', renderCell: (project) => project.status },
        { id: 'verified', header: 'Freshness', renderCell: (project) => <FreshnessStamp verifiedAt={project.verifiedAt} /> },
      ]}
    />
  );

  return (
    <CatalogView
      items={visible}
      getItemId={(project) => project.id}
      query={query}
      onQueryChange={setQuery}
      view={view}
      header={(
        <PageHeader
          eyebrow="Project hub"
          title="Datapass registry"
          description="One explorer contract supports card, table, filter, selection, and detail views."
        />
      )}
      metrics={(
        <MetricStrip metrics={[
          { id: 'projects', label: 'Projects', value: projects.length },
          { id: 'ga', label: 'GA', value: projects.filter((project) => project.status === 'GA').length, tone: 'success' },
          { id: 'preview', label: 'Preview', value: projects.filter((project) => project.status === 'Preview').length, tone: 'informative' },
        ]} />
      )}
      facets={(
        <FacetFilter
          label="Project kind"
          options={[
            { value: 'learning', label: 'Learning', count: 1 },
            { value: 'tooling', label: 'Tooling', count: 1 },
            { value: 'reference', label: 'Reference', count: 1 },
          ]}
          selectedValues={kinds}
          onChange={setKinds}
        />
      )}
      controls={(
        <div className="gallery-row">
          <SortControl
            value={sort}
            onChange={setSort}
            options={[
              { value: 'title', label: 'Title' },
              { value: 'status', label: 'Status' },
            ]}
          />
          <ViewToggle value={view} onChange={setView} />
        </div>
      )}
      renderCard={(project) => (
        <EntityCard
          entityId={project.id}
          title={project.title}
          description={project.summary}
          eyebrow={`${project.kind} · ${project.status}`}
          media={<div className="gallery-entity-mark" aria-hidden="true">{project.title.slice(0, 2).toUpperCase()}</div>}
          tags={project.tags.map((tag) => ({ id: tag }))}
          footer={<FreshnessStamp verifiedAt={project.verifiedAt} state="current" />}
          selected={project.id === selectedId}
          onSelect={() => select(project)}
        />
      )}
      renderTable={table}
      detail={selected ? (
        <DetailDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          title={selected.title}
          description={selected.summary}
          actions={<button className="gallery-toolbar-button" data-primary="true" type="button">Open project</button>}
        >
          <div className="gallery-stack">
            <FreshnessStamp verifiedAt={selected.verifiedAt} state="current" />
            <TagList tags={selected.tags.map((tag) => ({ id: tag }))} />
            <p>Stable ID: <code>{selected.id}</code></p>
          </div>
        </DetailDrawer>
      ) : undefined}
      emptyState="No projects match the current search and facets."
    />
  );
}

export const ProjectCards: Story = {
  render: () => <ExplorerGallery />,
};

export const ProjectTable: Story = {
  render: () => <ExplorerGallery initialView="table" />,
};

export const SelectedCard: Story = {
  render: () => <ExplorerGallery initialSelectedId="project.dubreu-formation" />,
};

export const DetailDrawerOpen: Story = {
  render: () => (
    <ExplorerGallery
      initialSelectedId="project.knowledge-atlas"
      initialDrawerOpen
    />
  ),
};

export const FilteredEmptyState: Story = {
  render: () => <ExplorerGallery initialQuery="no matching project" />,
};

export const PhoneProjectCards: Story = {
  parameters: {
    viewport: { defaultViewport: 'phone' },
  },
  render: () => <div className="gallery-device-frame"><ExplorerGallery /></div>,
};
