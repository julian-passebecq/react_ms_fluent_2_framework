import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Caption1, Divider, Text } from '@fluentui/react-components';
import {
  BookOpen20Regular,
  ChartMultiple20Regular,
  Code20Regular,
  Database20Regular,
  Sparkle20Regular,
} from '@fluentui/react-icons';
import { AppShell, LanguageToggle, SideNav, TopBar, useLocale } from '@datapass/ui';
import { courses } from './data/contentCatalog';
import { useFormationProgress } from './lib/useFormationProgress';

const CourseCatalogPage = lazy(() => import('./pages/CourseCatalogPage').then((module) => ({ default: module.CourseCatalogPage })));
const LessonPage = lazy(() => import('./pages/LessonPage').then((module) => ({ default: module.LessonPage })));
const PracticePage = lazy(() => import('./pages/PracticePage').then((module) => ({ default: module.PracticePage })));
const ProgressPage = lazy(() => import('./pages/ProgressPage').then((module) => ({ default: module.ProgressPage })));

type FormationRoute =
  | { view: 'catalog' }
  | { view: 'lesson'; lessonId: string }
  | { view: 'practice' }
  | { view: 'progress' };

function routeFromHash(): FormationRoute {
  const [view, id] = window.location.hash.replace(/^#\/?/, '').split('/');
  if (view === 'lesson' && id) return { view: 'lesson', lessonId: decodeURIComponent(id) };
  if (view === 'practice') return { view: 'practice' };
  if (view === 'progress') return { view: 'progress' };
  return { view: 'catalog' };
}

const courseIcons = {
  'course.dubreu.python': Code20Regular,
  'course.dubreu.sql': Database20Regular,
  'course.dubreu.sql-advanced': Database20Regular,
  'course.dubreu.pyspark': Sparkle20Regular,
} as const;

function firstLessonId(courseId: string) {
  return courses.find((course) => course.id === courseId)?.modules[0]?.lessons[0]?.id;
}

export function App() {
  const [route, setRoute] = useState<FormationRoute>(routeFromHash);
  const { locale } = useLocale();
  const progress = useFormationProgress();
  const shouldFocus = useRef(false);

  useEffect(() => {
    const update = () => {
      shouldFocus.current = true;
      setRoute(routeFromHash());
    };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === 'no' ? 'nb' : 'en';
  }, [locale]);

  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    window.requestAnimationFrame(() => {
      document.getElementById('datapass-main-content')?.focus();
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  }, [route]);

  const navigate = (path: string) => {
    shouldFocus.current = true;
    window.location.hash = path;
    setRoute(routeFromHash());
  };

  const title = useMemo(() => {
    if (route.view === 'lesson') {
      const lesson = courses.flatMap((course) => course.modules.flatMap((module) => module.lessons)).find((candidate) => candidate.id === route.lessonId);
      if (lesson) return typeof lesson.title === 'string' ? lesson.title : lesson.title[locale] ?? lesson.title.en;
    }
    if (route.view === 'practice') return locale === 'no' ? 'Øving' : 'Practice';
    if (route.view === 'progress') return locale === 'no' ? 'Fremdrift' : 'Progress';
    return locale === 'no' ? 'Kurskatalog' : 'Course catalog';
  }, [locale, route]);

  const sideNav = (
    <SideNav
      title={locale === 'no' ? 'Kurs' : 'Courses'}
      label={locale === 'no' ? 'Kursnavigasjon' : 'Course navigation'}
      footer={(
        <div className="formation-side-note">
          <Text size={200} weight="semibold">Read · reason · practice</Text>
          <Caption1 block>Build understanding one lesson at a time.</Caption1>
        </div>
      )}
    >
      <div className="formation-nav">
        <Button
          appearance={route.view === 'catalog' ? 'subtle' : 'transparent'}
          className={route.view === 'catalog' ? 'formation-nav__item is-active' : 'formation-nav__item'}
          icon={<BookOpen20Regular />}
          aria-current={route.view === 'catalog' ? 'page' : undefined}
          onClick={() => navigate('/catalog')}
        >
          {locale === 'no' ? 'Kurskatalog' : 'Course catalog'}
        </Button>
        {courses.map((course) => {
          const lessonId = firstLessonId(course.id);
          const Icon = courseIcons[course.id as keyof typeof courseIcons] ?? BookOpen20Regular;
          const active = route.view === 'lesson' && route.lessonId === lessonId;
          const label = typeof course.title === 'string' ? course.title : course.title[locale] ?? course.title.en;
          return (
            <Button
              key={course.id}
              appearance={active ? 'subtle' : 'transparent'}
              className={active ? 'formation-nav__item is-active' : 'formation-nav__item'}
              icon={<Icon />}
              aria-current={active ? 'page' : undefined}
              disabled={!lessonId}
              onClick={() => lessonId && navigate(`/lesson/${encodeURIComponent(lessonId)}`)}
            >
              {label}
            </Button>
          );
        })}
        <Divider />
        <Button
          appearance={route.view === 'practice' ? 'subtle' : 'transparent'}
          className={route.view === 'practice' ? 'formation-nav__item is-active' : 'formation-nav__item'}
          icon={<BookOpen20Regular />}
          aria-current={route.view === 'practice' ? 'page' : undefined}
          onClick={() => navigate('/practice')}
        >
          {locale === 'no' ? 'Øving og QCM' : 'Practice & QCM'}
        </Button>
        <Button
          appearance={route.view === 'progress' ? 'subtle' : 'transparent'}
          className={route.view === 'progress' ? 'formation-nav__item is-active' : 'formation-nav__item'}
          icon={<ChartMultiple20Regular />}
          aria-current={route.view === 'progress' ? 'page' : undefined}
          onClick={() => navigate('/progress')}
        >
          {locale === 'no' ? 'Fremdrift' : 'Progress'}
        </Button>
      </div>
    </SideNav>
  );

  return (
    <AppShell
      className="dp-consumer"
      topBar={(
        <TopBar
          brand="Formation"
          subtitle={title}
          localeControl={<LanguageToggle />}
          actions={<span className="formation-local-label">LOCAL PROGRESS</span>}
          actionsLabel={locale === 'no' ? 'Applikasjonshandlinger' : 'Application actions'}
        />
      )}
      sideNav={sideNav}
      lang={locale === 'no' ? 'nb' : 'en'}
      mainLabel="Formation learning workspace"
      skipLinkLabel={locale === 'no' ? 'Hopp til kursinnhold' : 'Skip to course content'}
    >
      <Suspense fallback={<div role="status" aria-live="polite">{locale === 'no' ? `Laster ${title}…` : `Loading ${title}…`}</div>}>
        {route.view === 'catalog' ? (
          <CourseCatalogPage
            progress={progress.state}
            onOpenLesson={(lessonId) => navigate(`/lesson/${encodeURIComponent(lessonId)}`)}
            onOpenPractice={() => navigate('/practice')}
          />
        ) : null}
        {route.view === 'lesson' ? (
          <LessonPage
            lessonId={route.lessonId}
            progress={progress.state}
            updateProgress={progress.update}
            onBack={() => navigate('/catalog')}
            onPractice={() => navigate('/practice')}
          />
        ) : null}
        {route.view === 'practice' ? (
          <PracticePage
            progress={progress.state}
            updateProgress={progress.update}
            onBack={() => navigate('/catalog')}
            onProgress={() => navigate('/progress')}
          />
        ) : null}
        {route.view === 'progress' ? (
          <ProgressPage
            progress={progress.state}
            persisted={progress.persisted}
            loadSource={progress.loadSource}
            warnings={progress.warnings}
            exportJson={progress.exportJson}
            importJson={progress.importJson}
            reset={progress.reset}
            onBack={() => navigate('/catalog')}
          />
        ) : null}
      </Suspense>
    </AppShell>
  );
}
