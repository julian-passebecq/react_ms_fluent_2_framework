import { Button, Field, Input, Select, Textarea } from '@fluentui/react-components';
import { useState } from 'react';
import { resolveLocalizedText, type ProjectRegistry } from '@datapass/content';
import { CONTEXTS, DOMAINS, NOTE_STATUSES, PRIORITIES, type IdeaNote } from './state';

export function NoteForm({ note, projects, onSave, onCancel }: {
  note?: IdeaNote; projects: ProjectRegistry; onSave: (note: IdeaNote) => boolean; onCancel: () => void;
}) {
  const [tagText, setTagText] = useState(note?.tags.join(', ') ?? '');
  const [draft, setDraft] = useState<Omit<IdeaNote, 'id' | 'createdAt' | 'updatedAt'>>(() => note ?? ({
    title: '', body: '', domain: 'data-engineering', context: 'project', priority: 'next', status: 'idea', tags: [], pinned: false,
  }));
  const patch = (value: Partial<typeof draft>) => setDraft((current) => ({ ...current, ...value }));
  return <form className="pilot-panel pilot-form" aria-label={note ? 'Edit idea' : 'New idea'} onSubmit={(event) => {
    event.preventDefault();
    const now = new Date().toISOString();
    const cleaned = { ...draft, body: draft.body?.trim() || undefined, url: draft.url?.trim() || undefined, projectId: draft.projectId || undefined, tags: tagText.split(',').map((tag) => tag.trim()).filter(Boolean) };
    onSave({ ...cleaned, id: note?.id ?? `idea.${crypto.randomUUID()}`, createdAt: note?.createdAt ?? now, updatedAt: now });
  }}>
    <h2>{note ? 'Edit idea' : 'Capture an idea'}</h2>
    <Field label="Idea title" required><Input value={draft.title} maxLength={140} required onChange={(_, data) => patch({ title: data.value })} /></Field>
    <Field label="Details"><Textarea value={draft.body ?? ''} maxLength={6000} resize="vertical" onChange={(_, data) => patch({ body: data.value })} /></Field>
    <div className="pilot-form-grid">
      <Field label="Domain"><Select value={draft.domain} onChange={(_, data) => patch({ domain: data.value as IdeaNote['domain'] })}>{DOMAINS.map((value) => <option key={value}>{value}</option>)}</Select></Field>
      <Field label="Context"><Select value={draft.context} onChange={(_, data) => patch({ context: data.value as IdeaNote['context'] })}>{CONTEXTS.map((value) => <option key={value}>{value}</option>)}</Select></Field>
      <Field label="Priority"><Select value={draft.priority} onChange={(_, data) => patch({ priority: data.value as IdeaNote['priority'] })}>{PRIORITIES.map((value) => <option key={value}>{value}</option>)}</Select></Field>
      <Field label="Status"><Select value={draft.status} onChange={(_, data) => patch({ status: data.value as IdeaNote['status'] })}>{NOTE_STATUSES.map((value) => <option key={value}>{value}</option>)}</Select></Field>
    </div>
    <Field label="Related project"><Select value={draft.projectId ?? ''} onChange={(_, data) => patch({ projectId: data.value })}><option value="">No project</option>{projects.map((project) => <option key={project.id} value={project.id}>{resolveLocalizedText(project.title)}</option>)}</Select></Field>
    <Field label="Reference URL"><Input value={draft.url ?? ''} type="url" onChange={(_, data) => patch({ url: data.value })} /></Field>
    <Field label="Tags (comma-separated)"><Input value={tagText} onChange={(_, data) => setTagText(data.value)} /></Field>
    <div className="pilot-actions"><Button type="submit" appearance="primary">Save idea</Button><Button onClick={onCancel}>Cancel</Button></div>
  </form>;
}
