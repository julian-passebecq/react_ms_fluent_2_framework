import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Caption1,
  Divider,
  Text,
  Tooltip,
} from '@fluentui/react-components';
import {
  AppsListDetail24Regular,
  BookOpen24Regular,
  Braces24Regular,
  Code24Regular,
  DataTrending24Regular,
  Flow24Regular,
  PanelLeft24Regular,
} from '@fluentui/react-icons';
import {
  AppShell,
  LanguageToggle,
  SideNav,
  TopBar,
  useLocale,
} from '@datapass/ui';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CatalogPage } from './pages/CatalogPage';

const ChallengePage = lazy(() => import('./pages/ChallengePage').then((module) => ({ default: module.ChallengePage })));
const ExplainersPage = lazy(() => import('./pages/ExplainersPage').then((module) => ({ default: module.ExplainersPage })));
const KnowledgePage = lazy(() => import('./pages/KnowledgePage').then((module) => ({ default: module.KnowledgePage })));
const ProjectHubPage = lazy(() => import('./pages/ProjectHubPage').then((module) => ({ default: module.ProjectHubPage })));
const WorkbenchPage = lazy(() => import('./pages/WorkbenchPage').then((module) => ({ default: module.WorkbenchPage })));
const WorkflowPage = lazy(() => import('./pages/WorkflowPage').then((module) => ({ default: module.WorkflowPage })));
const VisualSandboxPage = lazy(() => import('./pages/VisualSandboxPage').then((module) => ({ default: module.VisualSandboxPage })));

export type ViewId = 'catalog' | 'workbench' | 'explainers' | 'workflow' | 'challenge' | 'knowledge' | 'projects' | 'visual-sandbox';

const views: Array<{ id: ViewId; label: { en: string; no: string }; icon: typeof AppsListDetail24Regular }> = [
  { id: 'catalog', label: { en: 'Catalog', no: 'Katalog' }, icon: AppsListDetail24Regular },
  { id: 'workbench', label: { en: 'Workbench', no: 'Arbeidsflate' }, icon: PanelLeft24Regular },
  { id: 'explainers', label: { en: 'Explainers', no: 'Forklaringer' }, icon: DataTrending24Regular },
  { id: 'workflow', label: { en: 'Workflow', no: 'Arbeidsflyt' }, icon: Flow24Regular },
  { id: 'challenge', label: { en: 'Challenge', no: 'Oppgave' }, icon: Code24Regular },
  { id: 'knowledge', label: { en: 'Knowledge Atlas', no: 'Kunnskapsatlas' }, icon: BookOpen24Regular },
  { id: 'projects', label: { en: 'Project Hub', no: 'Prosjekthub' }, icon: AppsListDetail24Regular },
  { id: 'visual-sandbox', label: { en: 'Visual Sandbox', no: 'Visuell sandkasse' }, icon: Braces24Regular },
];

function routeFromHash(): ViewId {
  const route = window.location.hash.replace(/^#\/?/, '').split('/')[0] as ViewId;
  return views.some((view) => view.id === route) ? route : 'catalog';
}

export function App() {
  const [view, setView] = useState<ViewId>(routeFromHash);
  const { locale } = useLocale();
  const shouldFocusView = useRef(false);

  useEffect(() => {
    const onHashChange = () => {
      shouldFocusView.current = true;
      setView(routeFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (!shouldFocusView.current) return;
    shouldFocusView.current = false;
    window.requestAnimationFrame(() => {
      document.getElementById('datapass-main-content')?.focus();
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  }, [view]);

  useEffect(() => {
    document.documentElement.lang = locale === 'no' ? 'nb' : 'en';
  }, [locale]);

  const navigate = (next: ViewId) => {
    shouldFocusView.current = true;
    window.location.hash = `/${next}`;
    setView(next);
  };

  const currentLabel = useMemo(
    () => views.find((item) => item.id === view)?.label[locale] ?? 'Catalog',
    [locale, view],
  );

  const sideNav = (
    <SideNav
      title={locale === 'no' ? 'Arbeidsområder' : 'Workspaces'}
      label={locale === 'no' ? 'Hovednavigasjon' : 'Primary navigation'}
      footer={(
        <div className="foundation-note">
          <Braces24Regular aria-hidden />
          <div>
            <Text weight="semibold">Foundation v2</Text>
            <Caption1 block>V1.1 gates · semantic specs</Caption1>
          </div>
        </div>
      )}
    >
      <div className="studio-nav">
        {views.map((item) => {
          const Icon = item.icon;
          return (
            <Tooltip key={item.id} content={item.label[locale]} relationship="label" positioning="after">
              <Button
                appearance={view === item.id ? 'subtle' : 'transparent'}
                className={view === item.id ? 'studio-nav__item is-active' : 'studio-nav__item'}
                icon={<Icon />}
                aria-current={view === item.id ? 'page' : undefined}
                onClick={() => navigate(item.id)}
                data-testid={`nav-${item.id}`}
              >
                {item.label[locale]}
              </Button>
            </Tooltip>
          );
        })}
      </div>
      <Divider />
      <div className="scope-note">
        <Caption1 block>{locale === 'no' ? 'Ingen kjøring eller live overvåking' : 'No execution or live monitoring'}</Caption1>
      </div>
    </SideNav>
  );

  const topBar = (
    <TopBar
      brand="Datapass Visual Studio"
      subtitle={currentLabel}
      localeControl={<LanguageToggle hidden={view === 'challenge'} />}
      actions={<span className="local-fixture-label">LOCAL · SOURCE-CONTROLLED</span>}
      actionsLabel={locale === 'no' ? 'Applikasjonshandlinger' : 'Application actions'}
    />
  );

  return (
    <AppShell
      topBar={topBar}
      sideNav={sideNav}
      lang={locale === 'no' ? 'nb' : 'en'}
      mainLabel={locale === 'no' ? 'Datapass arbeidsområde' : 'Datapass workspace'}
      skipLinkLabel={locale === 'no' ? 'Hopp til innhold' : 'Skip to content'}
    >
      <Suspense fallback={<div role="status" aria-live="polite">{locale === 'no' ? `Laster ${currentLabel}…` : `Loading ${currentLabel}…`}</div>}>
        <ErrorBoundary key={view}>
          {view === 'catalog' && <CatalogPage onNavigate={navigate} />}
          {view === 'workbench' && <WorkbenchPage />}
          {view === 'explainers' && <ExplainersPage />}
          {view === 'workflow' && <WorkflowPage />}
          {view === 'challenge' && <ChallengePage />}
          {view === 'knowledge' && <KnowledgePage />}
          {view === 'projects' && <ProjectHubPage />}
          {view === 'visual-sandbox' && <VisualSandboxPage />}
        </ErrorBoundary>
      </Suspense>
    </AppShell>
  );
}
