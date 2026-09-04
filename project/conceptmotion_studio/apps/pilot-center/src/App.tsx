import { Badge, Button } from '@fluentui/react-components';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { AppShell, MetricStrip, PageHeader, SideNav, TopBar } from '@datapass/ui';
import { resolveLocalizedText } from '@datapass/content';
import { createGuardedStorageAdapter } from '@datapass/progress';
import { projectRegistry } from '../../../content/projects';
import { PILOT_STORAGE_KEY, loadPilotState, orderedNotes, serializePilotBackup, validatePilotState, type PilotState } from './state';

const sections = { overview: 'Overview', projects: 'Projects', ideas: 'Idea Board', tools: 'Tools', backups: 'Backups' } as const;
const Projects = lazy(() => import('./Projects').then((module) => ({ default: module.Projects })));
const IdeasBoard = lazy(() => import('./IdeasBoard').then((module) => ({ default: module.IdeasBoard })));
const Backups = lazy(() => import('./Backups').then((module) => ({ default: module.Backups })));
type Section = keyof typeof sections;
function readSection(): Section {
  const route = window.location.hash.replace(/^#\/?/, '');
  return route in sections ? route as Section : 'overview';
}
const projectIds = new Set(projectRegistry.map((project) => project.id));

export function App() {
  const storage = useMemo(() => {
    try { return createGuardedStorageAdapter(window.localStorage); } catch { return createGuardedStorageAdapter(undefined); }
  }, []);
  const [loaded] = useState(() => loadPilotState(storage, projectIds));
  const [state, setState] = useState(loaded.state);
  const [protectedRaw, setProtectedRaw] = useState(loaded.protectedRaw);
  const [message, setMessage] = useState(loaded.warning);
  const [section, setSection] = useState<Section>(readSection);
  useEffect(() => {
    const update = () => { setSection(readSection()); requestAnimationFrame(() => document.getElementById('datapass-main-content')?.focus()); };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  const commit = (next: PilotState, restore = false): boolean => {
    try {
      const valid = validatePilotState(next, projectIds);
      setState(valid);
      if (protectedRaw !== null && !restore) { setMessage(loaded.warning); return true; }
      const persisted = storage.write(PILOT_STORAGE_KEY, serializePilotBackup(valid, projectIds));
      if (restore && persisted) setProtectedRaw(null);
      setMessage(persisted ? 'Saved on this device.' : 'Browser storage is unavailable. Changes are in memory; download a backup before leaving.');
      return true;
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : String(cause)); return false; }
  };
  const activeIdeas = orderedNotes(state.notes).filter((note) => note.status !== 'done');
  const nextActions = state.overlays.filter((overlay) => overlay.nextAction);
  return <AppShell className="pilot-app" mainLabel="Pilot Center workspace"
    topBar={<TopBar brand="Pilot Center" subtitle="Personal workspace" actions={<Badge appearance="outline">Device-local · no sync</Badge>} />}
    sideNav={<SideNav title="WORKSPACE" label="Pilot navigation" footer={<p>Public projects. Private working notes.</p>}>{Object.entries(sections).map(([id, label]) => <a key={id} href={`#/${id}`} aria-current={section === id ? 'page' : undefined}>{label}</a>)}</SideNav>}>
    <div className="pilot-stack" data-testid="pilot-center">
      <PageHeader title={sections[section]} eyebrow="PILOT CENTER" description={section === 'overview' ? 'Choose the next useful step.' : undefined} />
      {message ? <div role="status" className={message === 'Saved on this device.' ? 'pilot-save-status' : 'pilot-notice'}>{message}</div> : null}
      {section === 'overview' ? <>
        <MetricStrip metrics={[
          { id: 'projects', label: 'Public projects', value: projectRegistry.length },
          { id: 'building', label: 'Building', value: projectRegistry.filter((project) => (state.overlays.find((overlay) => overlay.projectId === project.id)?.status ?? project.status) === 'building').length },
          { id: 'ideas', label: 'Open ideas', value: activeIdeas.length },
          { id: 'next', label: 'Project next actions', value: nextActions.length },
        ]} />
        <div className="pilot-overview-grid">
          <section className="pilot-panel"><h2>Next actions</h2>{nextActions.length ? <ul className="pilot-action-list">{nextActions.map((overlay) => <li key={overlay.projectId}><strong>{resolveLocalizedText(projectRegistry.find((project) => project.id === overlay.projectId)!.title)}</strong><p>{overlay.nextAction}</p></li>)}</ul> : <p>Add a next action in a project’s inspector to keep the work moving.</p>}<a href="#/projects">Open projects</a></section>
          <section className="pilot-panel"><h2>Focus queue</h2>{activeIdeas.length ? <ol className="pilot-action-list">{activeIdeas.slice(0, 5).map((note) => <li key={note.id}><strong>{note.title}</strong><p>{note.priority} · {note.status}</p></li>)}</ol> : <p>No open ideas yet. Capture something small enough to act on.</p>}<a href="#/ideas">Open Idea Board</a></section>
        </div>
        <div className="pilot-panel"><h2>Shared public registry</h2><p>Project status is declared, not monitored. Website links and source-repository links are distinguished in each project inspector.</p><a href="http://127.0.0.1:4173/#/projects">Open public Project Hub</a></div>
      </> : null}
      <Suspense fallback={<p role="status">Opening workspace…</p>}>
      {section === 'projects' ? <Projects projects={projectRegistry} overlays={state.overlays} onOverlay={(overlay) => commit({ ...state, overlays: [...state.overlays.filter((item) => item.projectId !== overlay.projectId), overlay] })} /> : null}
      {section === 'ideas' ? <IdeasBoard projects={projectRegistry} notes={state.notes} onChange={(notes) => commit({ ...state, notes })} /> : null}
      {section === 'backups' ? <Backups state={state} projects={projectRegistry} ids={projectIds} protectedRaw={protectedRaw} onRestore={(next) => commit(next, true)} /> : null}
      </Suspense>
      {section === 'tools' ? <section className="pilot-panel pilot-stack"><h2>Visual tools</h2><div className="pilot-tool-grid">
        <a href="http://127.0.0.1:4173/#/visual-sandbox"><strong>Visual Sandbox</strong><span>Edit semantic specs and preview production figures.</span></a>
        <a href="http://127.0.0.1:4173/#/workbench"><strong>ConceptMotion Studio</strong><span>Explore semantic scenes and explainers.</span></a>
        <a href={projectRegistry.find((project) => project.id === 'project.d3-visual-studio')!.url} target="_blank" rel="noreferrer"><strong>D3 Visual Studio</strong><span>Open the existing D3 sandbox.</span></a>
      </div><p className="pilot-secondary">Studio links use the local development address on port 4173. Start Studio before opening them.</p><Button onClick={() => { window.location.hash = '/projects'; }}>Browse project links</Button></section> : null}
    </div>
  </AppShell>;
}
