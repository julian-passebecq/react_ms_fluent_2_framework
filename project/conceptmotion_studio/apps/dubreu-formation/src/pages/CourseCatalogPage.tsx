import { Badge, Button, Text } from '@fluentui/react-components';
import { ArrowRight20Regular } from '@fluentui/react-icons';
import { ProgressSummary } from '@datapass/learning';
import { EntityCard, MetricStrip, PageHeader, useLocale } from '@datapass/ui';
import type { ProgressStateV2 } from '@datapass/progress';
import { courses, lessons } from '../data/contentCatalog';

export interface CourseCatalogPageProps {
  progress: ProgressStateV2;
  onOpenLesson(lessonId: string): void;
  onOpenPractice(): void;
}

const labels = {
  en: {
    eyebrow: 'DUBREU FORMATION · V2 REFERENCE CONSUMER',
    title: 'Learn from a structured path, not notebook chrome',
    description: 'Original representative fixtures validate reusable course, Figure, editor, assessment and progress contracts. The private Dubreu corpus was not supplied or imported.',
    routes: 'Reference paths',
    lessons: 'Representative lessons',
    execution: 'In-site runtimes',
    executionDetail: 'Display, edit and compare only',
    open: 'Open lesson',
    practice: 'Practice & review',
    practiceSummary: 'Answer an original QCM, inspect immediate feedback, and retain a versioned local attempt.',
    begin: 'Begin practice',
    fixture: 'Original local fixture',
  },
  no: {
    eyebrow: 'DUBREU FORMATION · V2 REFERANSEKONSUMENT',
    title: 'Lær fra en strukturert sti, ikke rå notatbokvisning',
    description: 'Originale representative fixtures validerer gjenbrukbare kontrakter. Det private Dubreu-materialet ble ikke levert eller importert.',
    routes: 'Referansestier',
    lessons: 'Representative leksjoner',
    execution: 'Kjøretider på nettstedet',
    executionDetail: 'Kun visning, redigering og sammenligning',
    open: 'Åpne leksjon',
    practice: 'Øving og repetisjon',
    practiceSummary: 'Svar på en original QCM, se direkte tilbakemelding og behold et versjonert lokalt forsøk.',
    begin: 'Start øving',
    fixture: 'Original lokal fixture',
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
        metadata={<><Badge appearance="tint" color="informative">FOUNDATION V2</Badge><Badge appearance="outline">{copy.fixture}</Badge></>}
      />
      <MetricStrip
        label={locale === 'no' ? 'Katalogsammendrag' : 'Course catalog summary'}
        metrics={[
          { id: 'paths', label: copy.routes, value: courses.length + 1, tone: 'informative' },
          { id: 'lessons', label: copy.lessons, value: lessons.length, tone: 'success' },
          { id: 'runtimes', label: copy.execution, value: 0, detail: copy.executionDetail },
        ]}
      />
      <ProgressSummary
        state={progress}
        lessonIds={lessons.map((lesson) => lesson.id)}
        assessmentIds={['assessment.dubreu.sql-practice']}
        locale={locale}
        title={locale === 'no' ? 'Din lokale fremdrift' : 'Your local progress'}
      />
      <section aria-labelledby="formation-paths-title">
        <div className="formation-section-heading">
          <div><span className="formation-eyebrow">COURSE CATALOG</span><h2 id="formation-paths-title">{copy.routes}</h2></div>
          <Text size={200}>{copy.executionDetail}</Text>
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
            metadata={<Badge appearance="outline">QCM · schema v2</Badge>}
            tags={[{ id: 'practice.sql', label: 'SQL' }, { id: 'practice.pyspark', label: 'runtime boundary' }]}
            actions={<Button appearance="primary" icon={<ArrowRight20Regular />} iconPosition="after" onClick={onOpenPractice}>{copy.begin}</Button>}
          />
        </div>
      </section>
    </div>
  );
}
