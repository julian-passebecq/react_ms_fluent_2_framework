import { Badge, Button, Field, Input, Select } from '@fluentui/react-components';
import { useState } from 'react';
import { TagList } from '@datapass/ui';
import { resolveLocalizedText, type ProjectRegistry } from '@datapass/content';
import { CONTEXTS, DOMAINS, NOTE_STATUSES, PRIORITIES, orderedNotes, type IdeaNote } from './state';
import { NoteForm } from './NoteForm';

export function IdeasBoard({ notes, projects, onChange }: { notes: IdeaNote[]; projects: ProjectRegistry; onChange: (notes: IdeaNote[]) => boolean }) {
  const [editing, setEditing] = useState<IdeaNote | 'new'>();
  const [deleted, setDeleted] = useState<IdeaNote>();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ status: '', domain: '', context: '', priority: '', projectId: '' });
  const visible = orderedNotes(notes).filter((note) => Object.entries(filters).every(([key, value]) => !value || note[key as keyof typeof filters] === value)
    && [note.title, note.body, ...note.tags].join(' ').toLowerCase().includes(query.toLowerCase()));
  return <section className="pilot-stack" data-testid="pilot-ideas">
    <div className="pilot-section-heading"><h2 className="dp-visually-hidden">Saved ideas</h2><span className="pilot-secondary">{notes.length} saved ideas</span><Button appearance="primary" onClick={() => setEditing('new')}>New idea</Button></div>
    {editing ? <NoteForm key={editing === 'new' ? 'new' : editing.id} note={editing === 'new' ? undefined : editing} projects={projects} onCancel={() => setEditing(undefined)} onSave={(note) => {
      const saved = onChange([...notes.filter((item) => item.id !== note.id), note]);
      if (saved) setEditing(undefined);
      return saved;
    }} /> : null}
    <div className="pilot-panel pilot-stack">
      <Field label="Search ideas"><Input type="search" value={query} onChange={(_, data) => setQuery(data.value)} /></Field>
      <details className="pilot-advanced-filters"><summary>Filter ideas</summary><div className="pilot-filters">
      {([['status', NOTE_STATUSES], ['domain', DOMAINS], ['context', CONTEXTS], ['priority', PRIORITIES]] as const).map(([field, options]) => <Field key={field} label={`Filter ${field}`}><Select value={filters[field]} onChange={(_, data) => setFilters((current) => ({ ...current, [field]: data.value }))}><option value="">All</option>{options.map((value) => <option key={value}>{value}</option>)}</Select></Field>)}
      <Field label="Filter project"><Select value={filters.projectId} onChange={(_, data) => setFilters((current) => ({ ...current, projectId: data.value }))}><option value="">All projects</option>{projects.map((project) => <option key={project.id} value={project.id}>{resolveLocalizedText(project.title)}</option>)}</Select></Field>
      <Button onClick={() => { setQuery(''); setFilters({ status: '', domain: '', context: '', priority: '', projectId: '' }); }}>Clear filters</Button>
      </div></details>
    </div>
    {deleted ? <div className="pilot-notice" role="status">Deleted “{deleted.title}”. <Button onClick={() => { if (onChange([...notes, deleted])) setDeleted(undefined); }}>Undo deletion</Button></div> : null}
    <p className="pilot-secondary">{visible.length} of {notes.length} ideas · pinned first, then priority</p>
    <div className="pilot-note-grid">
      {visible.map((note) => <article key={note.id} className="pilot-note" data-priority={note.priority} data-testid="pilot-note">
        <div className="pilot-actions"><Badge appearance="outline">{note.status}</Badge><span>{note.priority}{note.pinned ? ' · pinned' : ''}</span></div>
        <h3>{note.title}</h3><p>{note.body}</p>
        <p className="pilot-secondary">{note.domain} · {note.context}</p>
        {note.projectId ? <p>{resolveLocalizedText(projects.find((project) => project.id === note.projectId)!.title)}</p> : null}
        {note.url ? <a href={note.url} target="_blank" rel="noreferrer">Open reference</a> : null}
        <TagList tags={note.tags.map((tag) => ({ id: tag }))} />
        <div className="pilot-actions">
          <Button onClick={() => setEditing(note)} aria-label={`Edit idea: ${note.title}`}>Edit</Button>
          <Button aria-pressed={note.pinned} onClick={() => onChange(notes.map((item) => item.id === note.id ? { ...item, pinned: !item.pinned, updatedAt: new Date().toISOString() } : item))}>{note.pinned ? 'Unpin' : 'Pin'}</Button>
          <Button onClick={() => { if (onChange(notes.filter((item) => item.id !== note.id))) setDeleted(note); }} aria-label={`Delete idea: ${note.title}`}>Delete</Button>
        </div>
      </article>)}
    </div>
    {!visible.length ? <div className="pilot-panel"><h3>{notes.length ? 'No matching ideas' : 'Your ideas start here'}</h3><p>{notes.length ? 'Clear a filter or search for another term.' : 'Capture a next step, connect it to a project, and keep it on this device.'}</p></div> : null}
  </section>;
}
