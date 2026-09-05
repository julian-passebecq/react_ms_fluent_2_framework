import { reasoningModules } from '../data/reasoning';
import { Badge, Button, Text } from '@fluentui/react-components';
import { ArrowRight20Regular } from '@fluentui/react-icons';
import { ProgressSummary } from '@datapass/learning';
import { ContentDetails, EntityCard, MetricStrip, PageHeader, useLocale } from '@datapass/ui';
import type { ProgressStateV2 } from '@datapass/progress';
import { courses, lessons } from '../data/contentCatalog';

export interface CourseCatalogPageProps {
  progress: ProgressStateV2;
  onOpenLesson(lessonId: string): void;
  onOpenPractice(): void;
}

const labels = {
  en: {
    eyebrow: 'FORMATION',
    title: 'Learn with structure.',
    description: 'Understand Python, SQL and PySpark through worked examples and visual reasoning.',
    routes: 'Learning paths',
    lessons: 'Lessons',
    open: 'Open lesson',
    practice: 'Practice & review',
    practiceSummary: 'Check your understanding, explain your choices, and revisit what needs practice.',
    begin: 'Begin practice',
  },
  no: {
    eyebrow: 'FORMATION',
    title: 'Lær med struktur.',
    description: 'Forstå Python, SQL og PySpark med eksempler og visuelle forklaringer.',
    routes: 'Læringsstier',
    lessons: 'Leksjoner',
    open: 'Åpne leksjon',
    practice: 'Øving og repetisjon',
    practiceSummary: 'Sjekk forståelsen, forklar valgene og repeter det du vil øve på.',
    begin: 'Start øving',
  },
} as const;

export function CourseCatalogPage({ progress, onOpenLesson, onOpenPractice }: CourseCatalogPageProps) {
  const { locale } = useLocale();
  const copy = labels[locale];

  return (
    <div className="formation-page" data-testid="formation-catalog-page">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}

      />
      <MetricStrip
        label={locale === 'no' ? 'Katalogsammendrag' : 'Course catalog summary'}
        metrics={[
          { id: 'paths', label: copy.routes, value: courses.length + 1, tone: 'informative' },
          { id: 'lessons', label: copy.lessons, value: lessons.length, tone: 'success' },
          { id: 'reasoning', label: locale === 'no' ? 'Fordypninger' : 'Thinking modules', value: reasoningModules.length, detail: 'SQL · Python for data engineering' },
        ]}
      />
      <ProgressSummary
        state={progress}
        lessonIds={lessons.map((lesson) => lesson.id)}
        assessmentIds={['assessment.dubreu.sql-practice', ...reasoningModules.map(module => module.assessment.id)]}
        locale={locale}
        title={locale === 'no' ? 'Din lokale fremdrift' : 'Your local progress'}
      />
      <section aria-labelledby="formation-paths-title">
        <div className="formation-section-heading">
          <div><span className="formation-eyebrow">COURSE CATALOG</span><h2 id="formation-paths-title">{copy.routes}</h2></div>
          <Text size={200}>{locale === 'no' ? 'Velg et emne eller en fordypning' : 'Choose a foundation or a thinking module'}</Text>
        </div>
        <div className="formation-course-grid">
          {courses.map((course) => {
            const firstLesson = course.modules.flatMap((module) => module.lessons)[0];
            const lessonCount = course.modules.reduce((count, module) => count + module.lessons.length, 0);
            return (
              <EntityCard
                key={course.id}
                entityId={course.id}
                eyebrow={(course.tags ?? []).join(' · ').toUpperCase()}
                title={typeof course.title === 'string' ? course.title : course.title[locale] ?? course.title.en}
                description={typeof course.summary === 'string' ? course.summary : course.summary?.[locale] ?? course.summary?.en}
                metadata={<Badge appearance="outline">{lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}</Badge>}
                tags={(course.tags ?? []).map((tag) => ({ id: `${course.id}.${tag}`, label: tag }))}
                footer={<div className="formation-module-links">{course.modules.flatMap(module => module.lessons).slice(1).map(lesson => <Button key={lesson.id} appearance="subtle" onClick={() => onOpenLesson(lesson.id)}>{typeof lesson.title === 'string' ? lesson.title : lesson.title.en}</Button>)}</div>}
                actions={firstLesson ? (
                  <Button appearance="primary" icon={<ArrowRight20Regular />} iconPosition="after" onClick={() => onOpenLesson(firstLesson.id)}>
                    {copy.open}
                  </Button>
                ) : undefined}
              />
            );
          })}
          <EntityCard
            entityId="course.dubreu.practice"
            eyebrow="ASSESS · REVIEW"
            title={copy.practice}
            description={copy.practiceSummary}
            metadata={<Badge appearance="outline">Knowledge check</Badge>}
            tags={[{ id: 'practice.sql', label: 'SQL' }, { id: 'practice.pyspark', label: 'PySpark' }]}
            actions={<Button appearance="primary" icon={<ArrowRight20Regular />} iconPosition="after" onClick={onOpenPractice}>{copy.begin}</Button>}
          />
        </div>
      </section>
      <ContentDetails summary="About these lessons"><p>Original Datapass teaching examples and reasoning lessons. Selected lessons include linked technical references. Source records are retained for audit and reproducible imports.</p></ContentDetails>
    </div>
  );
}
