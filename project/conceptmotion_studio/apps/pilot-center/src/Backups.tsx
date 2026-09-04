import { Button, Field, Select, Textarea } from '@fluentui/react-components';
import { useState } from 'react';
import type { ProjectRegistry } from '@datapass/content';
import { serializePublicProjectRegistry } from './projectDiagram';
import { parsePilotBackup, parsePrivateOverlay, serializePilotBackup, type LocalProjectMetadata, type PilotState } from './state';

export function Backups({ state, projects, ids, protectedRaw, onRestore }: {
  state: PilotState; projects: ProjectRegistry; ids: ReadonlySet<string>; protectedRaw: string | null;
  onRestore: (next: PilotState) => boolean;
}) {
  const [mode, setMode] = useState<'backup' | 'overlay'>('backup');
  const [source, setSource] = useState('');
  const [preview, setPreview] = useState<PilotState | LocalProjectMetadata[]>();
  const [error, setError] = useState('');
  const changeSource = (value: string) => { setSource(value); setPreview(undefined); setError(''); };
  return <section className="pilot-stack" data-testid="pilot-backups">
    <div className="pilot-panel pilot-stack">
      <h2>Local backups</h2><p>Notes and private project metadata live on this browser only. Back them up before clearing browser data or switching devices.</p>
      <p className="pilot-notice">A backup includes your private annotations and repository URLs. Keep the downloaded file private.</p>
      <div className="pilot-actions"><a className="pilot-link-button" href={`data:application/json;charset=utf-8,${encodeURIComponent(serializePilotBackup(state, ids))}`} download="pilot-center.private.backup.json">Download private backup</a>
        {protectedRaw !== null ? <a href={`data:application/json;charset=utf-8,${encodeURIComponent(protectedRaw)}`} download="pilot-center.recovery.txt">Download unreadable stored data</a> : null}
      </div>
      <a href={`data:application/json;charset=utf-8,${encodeURIComponent(serializePublicProjectRegistry(projects))}`} download="projects.public.registry.json">Download public registry only</a>
      <small>The public export contains only source-controlled records, never local notes, next actions, status overrides or private URLs.</small>
    </div>
    <div className="pilot-panel pilot-form">
      <h2>Restore or import</h2>
      <Field label="Import type"><Select value={mode} onChange={(_, data) => { setMode(data.value as typeof mode); setPreview(undefined); setError(''); }}><option value="backup">Full backup — replace local data</option><option value="overlay">Private project overlay — merge annotations</option></Select></Field>
      <Field label="Choose a JSON file"><input aria-label="Choose a JSON file" type="file" accept="application/json,.json" onChange={async (event) => {
        const file = event.currentTarget.files?.[0];
        if (!file) return;
        if (file.size > 1_000_000) { setError('File exceeds the 1 MB limit.'); setPreview(undefined); return; }
        try { changeSource(await file.text()); } catch { setError('This file could not be read.'); setPreview(undefined); }
      }} /></Field>
      <Field label="Import JSON"><Textarea value={source} resize="vertical" rows={8} onChange={(_, data) => changeSource(data.value)} /></Field>
      <Button onClick={() => {
        try { setPreview(mode === 'backup' ? parsePilotBackup(source, ids) : parsePrivateOverlay(source, ids)); setError(''); }
        catch (cause) { setPreview(undefined); setError(cause instanceof Error ? cause.message : String(cause)); }
      }}>Preview import</Button>
      {error ? <p role="alert">{error}</p> : null}
      {preview ? <div className="pilot-notice" data-testid="pilot-import-preview">
        <p>{Array.isArray(preview) ? `Merge ${preview.length} project overlays. Existing ideas are kept.` : `Replace ${state.notes.length} existing ideas and ${state.overlays.length} overlays with ${preview.notes.length} ideas and ${preview.overlays.length} overlays.`}</p>
        <Button appearance="primary" onClick={() => {
          const next = Array.isArray(preview) ? { ...state, overlays: [...state.overlays.filter((old) => !preview.some((incoming) => incoming.projectId === old.projectId)), ...preview] } : preview;
          if (onRestore(next)) { setPreview(undefined); setSource(''); }
        }}>{Array.isArray(preview) ? 'Merge local overlay' : 'Replace local data'}</Button>
      </div> : null}
      <details><summary>Private overlay file format</summary><p>You may keep this file in the gitignored <code>content/projects.private.local.json</code> location. It is read only when you choose it here; no private overlay is part of a build.</p><pre>{'{"schemaVersion":1,"overlays":[{"projectId":"project.formation","nextAction":"Review course flow"}]}'}</pre></details>
    </div>
  </section>;
}
