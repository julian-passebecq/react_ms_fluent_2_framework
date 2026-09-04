import { useEffect, useMemo, useRef, useState } from 'react';
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
import { ChallengePage } from './pages/ChallengePage';
import { ExplainersPage } from './pages/ExplainersPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { WorkbenchPage } from './pages/WorkbenchPage';
import { WorkflowPage } from './pages/WorkflowPage';

export type ViewId = 'catalog' | 'workbench' | 'explainers' | 'workflow' | 'challenge' | 'knowledge';

const views: Array<{ id: ViewId; label: { en: string; no: string }; icon: typeof AppsListDetail24Regular }> = [
  { id: 'catalog', label: { en: 'Catalog', no: 'Katalog' }, icon: AppsListDetail24Regular },
  { id: 'workbench', label: { en: 'Workbench', no: 'Arbeidsflate' }, icon: PanelLeft24Regular },
  { id: 'explainers', label: { en: 'Explainers', no: 'Forklaringer' }, icon: DataTrending24Regular },
  { id: 'workflow', label: { en: 'Workflow', no: 'Arbeidsflyt' }, icon: Flow24Regular },
  { id: 'challenge', label: { en: 'Challenge', no: 'Oppgave' }, icon: Code24Regular },
  { id: 'knowledge', label: { en: 'Knowledge Atlas', no: 'Kunnskapsatlas' }, icon: BookOpen24Regular },
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
            <Text weight="semibold">Foundation v1.1</Text>
            <Caption1 block>Semantic specs · local fixtures</Caption1>
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
      <ErrorBoundary key={view}>
        {view === 'catalog' && <CatalogPage onNavigate={navigate} />}
        {view === 'workbench' && <WorkbenchPage />}
        {view === 'explainers' && <ExplainersPage />}
        {view === 'workflow' && <WorkflowPage />}
        {view === 'challenge' && <ChallengePage />}
        {view === 'knowledge' && <KnowledgePage />}
      </ErrorBoundary>
    </AppShell>
  );
}
