import { Badge, Button, Field, Input, Select, Textarea } from '@fluentui/react-components';
import { useMemo, useState } from 'react';
import { resolveLocalizedText, type ProjectRecord, type ProjectRegistry } from '@datapass/content';
import { FigurePlayer } from '@datapass/figure';
import { EntityCard, EntityTable, TagList } from '@datapass/ui';
import { projectCategories, projectCategory, projectGalaxyFigure, type ProjectCategory } from './projectDiagram';
import { PROJECT_STATUSES, type LocalProjectMetadata } from './state';

function ProjectInspector({ project, overlay, onSave }: { project: ProjectRecord; overlay?: LocalProjectMetadata; onSave: (value: LocalProjectMetadata) => boolean }) {
  const [draft, setDraft] = useState<LocalProjectMetadata>(() => overlay ?? { projectId: project.id });
  return <aside className="pilot-panel pilot-inspector" aria-label="Project inspector" data-testid="pilot-project-inspector">
    <h2>{resolveLocalizedText(project.title)}</h2>
    <p>{project.summary ? resolveLocalizedText(project.summary) : ''}</p>
    <p>{project.kind} · <Badge appearance="outline">{overlay?.status ?? project.status}</Badge></p>
    <h3>Technologies</h3><TagList tags={(project.technologies ?? []).map((technology) => ({ id: technology }))} />
    <h3>Features</h3><TagList tags={(project.features ?? []).map((feature) => ({ id: feature }))} />
    <div className="pilot-actions"><a href={project.url} target="_blank" rel="noreferrer">{project.url.startsWith('https://github.com/') ? 'Open project source' : 'Visit website'}</a>{overlay?.privateRepository ? <a href={overlay.privateRepository} target="_blank" rel="noreferrer">Open private repository</a> : null}</div>
    <form className="pilot-form" onSubmit={(event) => {
      event.preventDefault();
      onSave({ ...draft, nextAction: draft.nextAction?.trim() || undefined, annotation: draft.annotation?.trim() || undefined, privateRepository: draft.privateRepository?.trim() || undefined });
    }}>
      <h3>Local project notes</h3>
      <Field label="Next action"><Input value={draft.nextAction ?? ''} maxLength={400} onChange={(_, data) => setDraft((current) => ({ ...current, nextAction: data.value }))} /></Field>
      <Field label="Local project status"><Select value={draft.status ?? ''} onChange={(_, data) => setDraft((current) => ({ ...current, status: data.value ? data.value as LocalProjectMetadata['status'] : undefined }))}><option value="">Use registry: {project.status}</option>{PROJECT_STATUSES.map((status) => <option key={status}>{status}</option>)}</Select></Field>
      <Field label="Local annotation"><Textarea value={draft.annotation ?? ''} resize="vertical" onChange={(_, data) => setDraft((current) => ({ ...current, annotation: data.value }))} /></Field>
      <Field label="Private repository URL (device only)"><Input type="url" value={draft.privateRepository ?? ''} onChange={(_, data) => setDraft((current) => ({ ...current, privateRepository: data.value }))} /></Field>
      <Button appearance="primary" type="submit">Save project notes</Button>
      <small>Local annotations never change the public registry. Private links are included only in your downloaded backup.</small>
    </form>
  </aside>;
}

export function Projects({ projects, overlays, onOverlay }: { projects: ProjectRegistry; overlays: LocalProjectMetadata[]; onOverlay: (overlay: LocalProjectMetadata) => boolean }) {
  const [view, setView] = useState<'cards' | 'table' | 'galaxy'>('cards');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>();
  const [status, setStatus] = useState('');
  const effective = (project: ProjectRecord) => overlays.find((overlay) => overlay.projectId === project.id)?.status ?? project.status;
  const filtered = projects.filter((project) => (!status || effective(project) === status) && [resolveLocalizedText(project.title), project.summary ? resolveLocalizedText(project.summary) : '', ...(project.features ?? []), ...(project.technologies ?? [])].join(' ').toLowerCase().includes(query.toLowerCase()));
  const selected = projects.find((project) => project.id === selectedId);
  const figure = useMemo(() => projectGalaxyFigure(projects, selectedId), [projects, selectedId]);
  return <section className="pilot-stack dp-consumer" data-testid="pilot-projects">
    <div className="pilot-section-heading"><h2 className="dp-visually-hidden">Project collection</h2><span className="pilot-secondary">{projects.length} public records</span><div role="group" aria-label="Project view" className="pilot-actions">{(['cards', 'table', 'galaxy'] as const).map((mode) => <Button key={mode} aria-pressed={view === mode} appearance={view === mode ? 'primary' : 'subtle'} onClick={() => setView(mode)}>{mode === 'cards' ? 'Cards' : mode === 'table' ? 'Table' : 'Galaxy'}</Button>)}</div></div>
    <div className="pilot-panel pilot-filters"><Field label="Search projects"><Input type="search" value={query} onChange={(_, data) => setQuery(data.value)} /></Field><Field label="Filter project status"><Select value={status} onChange={(_, data) => setStatus(data.value)}><option value="">All statuses</option>{PROJECT_STATUSES.map((value) => <option key={value}>{value}</option>)}</Select></Field></div>
    <div className="pilot-project-layout" data-has-selection={Boolean(selected)}>
      <div className="pilot-stack">
        {view === 'galaxy' ? <div className="pilot-galaxy"><div className="pilot-galaxy-legend" aria-label="Galaxy legend"><div><h3>Project categories</h3><ul>{(Object.keys(projectCategories) as ProjectCategory[]).map(category => { const count = projects.filter(project => projectCategory(project.kind) === category).length; return count ? <li key={category} data-category={category}>{projectCategories[category]} <span>{count}</span></li> : null; })}</ul></div><div><h3>Registry status</h3><ul>{[...new Set(projects.map(project => project.status))].sort().map(value => <li key={value}>{value} <span>{projects.filter(project => project.status === value).length}</span></li>)}</ul></div></div><FigurePlayer figure={figure} selectedId={selectedId} presentationSize="expanded" onSelect={(id) => setSelectedId(id === 'project-hub' ? undefined : id)} showInspector={false} /><p className="pilot-secondary">The galaxy shows all {projects.length} public projects and their registry status. Search, filters and local status overrides apply to cards and table.</p><Field label="Select galaxy project"><Select value={selectedId ?? ''} onChange={(_, data) => setSelectedId(data.value || undefined)}><option value="">Project hub</option>{projects.map((project) => <option key={project.id} value={project.id}>{resolveLocalizedText(project.title)}</option>)}</Select></Field></div> : null}
        {view === 'cards' ? <div className="pilot-card-grid">{filtered.map((project) => <EntityCard key={project.id} entityId={project.id} title={resolveLocalizedText(project.title)} description={project.summary ? resolveLocalizedText(project.summary) : undefined} eyebrow={`${effective(project)} · ${project.kind}`} aria-label={`Inspect project: ${resolveLocalizedText(project.title)}`} selected={project.id === selectedId} onSelect={setSelectedId} />)}</div> : null}
        {view === 'table' ? <EntityTable items={filtered} getRowId={(project) => project.id} label="Pilot projects table" columns={[
          { id: 'project', header: 'Project', renderCell: (project) => <Button appearance="subtle" onClick={() => setSelectedId(project.id)}>{resolveLocalizedText(project.title)}</Button> },
          { id: 'status', header: 'Status', renderCell: effective }, { id: 'type', header: 'Type', renderCell: (project) => project.kind },
        ]} /> : null}
        {!filtered.length && view !== 'galaxy' ? <p>No projects match these filters.</p> : null}
      </div>
      {selected ? <ProjectInspector key={`${selected.id}:${JSON.stringify(overlays.find((overlay) => overlay.projectId === selected.id))}`} project={selected} overlay={overlays.find((overlay) => overlay.projectId === selected.id)} onSave={onOverlay} /> : null}
    </div>
  </section>;
}
