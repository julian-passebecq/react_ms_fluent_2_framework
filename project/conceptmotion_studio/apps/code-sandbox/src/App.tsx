import { lazy, Suspense, useEffect, useState } from 'react';
import { AppShell, LanguageToggle, PageHeader, TopBar, useLocale } from '@datapass/ui';
import { Button } from '@fluentui/react-components';
import { usePracticeWorkspace } from '@datapass/learning';
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const ChallengePage = lazy(() => import('./pages/ChallengePage'));
const ReferencePage = lazy(() => import('./pages/ReferencePage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));

export default function App() {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || 'practice');
  const workspace = usePracticeWorkspace('datapass:code-sandbox:v3');
  const { locale } = useLocale();
  useEffect(() => { const sync = () => setRoute(window.location.hash.slice(1) || 'practice'); window.addEventListener('hashchange', sync); return () => window.removeEventListener('hashchange', sync); }, []);
  const navigate = (next: string) => { window.location.hash = next; setRoute(next); };
  return <AppShell mainLabel="Code Sandbox" topBar={<TopBar brand="Code Sandbox" subtitle={locale === 'no' ? 'Datateknikk i praksis' : 'Data engineering practice'} localeControl={<LanguageToggle />} navigation={<>{[['learn', 'Learn'], ['practice', 'Practice'], ['cheatsheets', 'Cheat Sheets'], ['progress', 'Progress']].map(([id, label]) => <Button key={id} appearance={route === id ? 'primary' : 'subtle'} onClick={() => navigate(id)}>{label}</Button>)}</>} />}>
    {workspace.warning && <p role="alert">{workspace.warning}</p>}
    <Suspense fallback={<p role="status">Loading practice surface…</p>}>
      {route.startsWith('challenge/') ? <ChallengePage id={decodeURIComponent(route.slice(10))} workspace={workspace} onBack={() => navigate('practice')} />
        : route === 'progress' ? <ProgressPage workspace={workspace} />
          : route === 'learn' || route === 'cheatsheets' ? <ReferencePage mode={route} onPractice={(track?: string) => { window.location.href = `${window.location.pathname}${track ? `?facet.track=${encodeURIComponent(track)}` : ''}#practice`; }} />
            : <><PageHeader eyebrow="PRACTICE WORKSPACE" title="Build fluency, one transformation at a time." description="323 source-preserved exercises. Write from memory, reason visually, then compare with a reference." /><CatalogPage progress={workspace.state.progress} onSelect={id => navigate(`challenge/${encodeURIComponent(id)}`)} /></>}
    </Suspense>
  </AppShell>;
}
