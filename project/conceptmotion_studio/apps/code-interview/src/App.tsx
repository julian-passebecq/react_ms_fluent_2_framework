import { lazy, Suspense, useState } from 'react';
import { AppShell, EntityCard, LanguageToggle, PageHeader, TopBar } from '@datapass/ui';
import { Button, Field, Select } from '@fluentui/react-components';
import { usePracticeWorkspace } from '@datapass/learning';
import { interviewDomains, interviewModes, type InterviewMode } from './data/domains';
const SessionPage = lazy(() => import('./pages/SessionPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
export default function App() {
  const [domain, setDomain] = useState('sql');
  const [mode, setMode] = useState<InterviewMode | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [sessionId, setSessionId] = useState(0);
  const workspace = usePracticeWorkspace('datapass:code-interview:v3');
  return <AppShell className="dp-consumer" mainLabel="Code Interview" topBar={<TopBar brand="Code Interview" subtitle="Think clearly. Explain your trade-offs." localeControl={<LanguageToggle />} navigation={<><Button onClick={() => { setMode(null); setShowProgress(false); }}>Sessions</Button><Button onClick={() => { setMode(null); setShowProgress(true); }}>Progress</Button></>} />}>
    {workspace.warning && <p role="alert">{workspace.warning}</p>}
    <Suspense fallback={<p role="status">Preparing interview…</p>}>
      {showProgress ? <ProgressPage workspace={workspace} /> : mode ? <SessionPage key={sessionId} mode={mode} domain={domain} workspace={workspace} onBack={() => setMode(null)} />
        : <><PageHeader eyebrow="INTERVIEW PRACTICE" title="Practice the conversation, not just the answer." description="Explain your approach, answer focused questions, then review the strengths and trade-offs in your reasoning." /><Field className="interview-domain" label="Domain pack"><Select aria-label="Domain pack" value={domain} onChange={event => setDomain(event.target.value)}>{interviewDomains.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</Select></Field><div className="interview-modes">{interviewModes.map(item => <EntityCard key={item.id} entityId={item.id} title={item.title} description={item.description} eyebrow={item.id === 'review' ? 'LOCAL REVIEW' : 'SESSION'} onSelect={() => { setSessionId(current => current + 1); setMode(item.id); }} />)}</div><p className="interview-boundary">Personal rehearsal, not certification. Scores reflect selected answers; discussion notes and code drafts are ungraded.</p></>}
    </Suspense>
  </AppShell>;
}
