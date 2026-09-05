import { useEffect } from 'react';
import { useReducedMotion } from '@conceptmotion/react';
import { ReasoningLesson } from './ReasoningLesson';
import { Badge, Button, MessageBar, MessageBarBody, MessageBarTitle } from '@fluentui/react-components';
import { ArrowLeft20Regular, Checkmark20Regular } from '@fluentui/react-icons';
import { NotebookLesson } from '@datapass/learning';
import { setChallengeDraft, updateLessonProgress, type ProgressStateV2 } from '@datapass/progress';
import { ContentDetails, PageHeader, useLocale } from '@datapass/ui';
import {
  courses,
  lessonById,
  notebookById,
  runtimeTargetsByIds,
  sqlFilterFigure,
} from '../data/contentCatalog';

export interface LessonPageProps {
  lessonId: string;
  progress: ProgressStateV2;
  updateProgress(operation: (current: ProgressStateV2) => ProgressStateV2): void;
  onBack(): void;
  onPractice(): void;
}

const NOTEBOOK_DRAFTS_ID = 'challenge.dubreu.notebook-drafts';

function courseForLesson(lessonId: string) {
  return courses.find((course) => course.modules.some((module) => module.lessons.some((lesson) => lesson.id === lessonId)));
}

export function LessonPage({ lessonId, progress, updateProgress, onBack, onPractice }: LessonPageProps) {
  const { locale } = useLocale();
  const lesson = lessonById(lessonId);
  const course = lesson ? courseForLesson(lesson.id) : undefined;
  const notebook = notebookById(lesson?.notebookId);
  const reducedMotion = useReducedMotion();
  const drafts = progress.challenges[NOTEBOOK_DRAFTS_ID]?.drafts ?? {};
  const lessonProgress = lesson ? progress.lessons[lesson.id] : undefined;

  useEffect(() => {
    if (!lesson || progress.lessons[lesson.id]) return;
    updateProgress((current) => updateLessonProgress(current, lesson.id, {
      courseId: course?.id,
      status: 'in-progress',
      recentPosition: { sectionId: 'overview', step: 0 },
    }));
  }, [course?.id, lesson, progress.lessons, updateProgress]);

  const localized = (value: string | { en?: string; no?: string } | undefined) => {
    if (typeof value === 'string') return value;
    return value?.[locale] ?? value?.en ?? '';
  };

  if (!lesson || !course) {
    return (
      <div className="formation-page" data-testid="formation-lesson-missing">
        <PageHeader eyebrow="LESSON" title="Lesson not found" description="This lesson is not in the local course catalog." />
        <Button icon={<ArrowLeft20Regular />} onClick={onBack}>Return to course catalog</Button>
      </div>
    );
  }

  const isPySpark = course.id === 'course.dubreu.pyspark';
  const completed = lessonProgress?.completed === true;

  return (
    <div className="formation-page formation-lesson" data-testid="formation-lesson-page" data-lesson-id={lesson.id}>
      <Button className="formation-back" appearance="subtle" icon={<ArrowLeft20Regular />} onClick={onBack}>
        {locale === 'no' ? 'Til kurskatalogen' : 'Back to course catalog'}
      </Button>
      <PageHeader
        eyebrow={`${localized(course.title).toUpperCase()} · STRUCTURED LESSON`}
        title={localized(lesson.title)}
        description={localized(lesson.summary)}
        metadata={<Badge appearance="outline">{isPySpark ? 'PySpark reference' : 'Guided learning'}</Badge>}
        actions={(
          <Button
            appearance={completed ? 'primary' : 'secondary'}
            icon={<Checkmark20Regular />}
            aria-pressed={completed}
            onClick={() => updateProgress((current) => updateLessonProgress(current, lesson.id, { completed: !completed, courseId: course.id }))}
          >
            {completed ? (locale === 'no' ? 'Fullført' : 'Completed') : (locale === 'no' ? 'Merk som fullført' : 'Mark complete')}
          </Button>
        )}
      />

      {lesson.objectives?.length ? (
        <section className="formation-objectives" aria-labelledby="formation-objectives-title">
          <span className="formation-eyebrow">OBJECTIVES</span>
          <h2 id="formation-objectives-title">{locale === 'no' ? 'Dette lærer du' : 'What you will learn'}</h2>
          <ul>{lesson.objectives.map((objective) => <li key={localized(objective)}>{localized(objective)}</li>)}</ul>
        </section>
      ) : null}

      {isPySpark ? (
        <MessageBar intent="warning" data-testid="pyspark-display-only" data-execution="none">
          <MessageBarBody>
            <MessageBarTitle>PySpark is display and explanation only</MessageBarTitle>
            Spark and Jupyter do not run in this site. Code is read-only, and every shown output is saved source evidence rather than a fresh result.
          </MessageBarBody>
        </MessageBar>
      ) : null}

      <ReasoningLesson lessonId={lessonId} progress={progress} updateProgress={updateProgress} />
      {notebook ? (
        <NotebookLesson
          notebook={notebook}
          figures={[sqlFilterFigure]}
          runtimeTargets={runtimeTargetsByIds(lesson.runtimeTargetIds)}
          locale={locale}
          reducedMotion={reducedMotion}
          drafts={drafts}
          onDraftChange={(cellId, value) => updateProgress((current) => setChallengeDraft(current, NOTEBOOK_DRAFTS_ID, cellId, value))}
        />
      ) : null}

      <nav className="formation-lesson-footer" aria-label="Lesson actions">
        <Button appearance="secondary" onClick={onBack}>{locale === 'no' ? 'Alle kurs' : 'All courses'}</Button>
        <Button appearance="primary" onClick={onPractice}>{locale === 'no' ? 'Øv og vurder' : 'Practice and assess'}</Button>
      </nav>
      <ContentDetails summary="Lesson details"><p>Lesson ID: <code>{lesson.id}</code></p><p>Course ID: <code>{course.id}</code></p></ContentDetails>
    </div>
  );
}
