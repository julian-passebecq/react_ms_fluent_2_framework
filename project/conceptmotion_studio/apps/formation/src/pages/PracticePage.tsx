import { Badge, Button, MessageBar, MessageBarBody, MessageBarTitle } from '@fluentui/react-components';
import { ArrowLeft20Regular } from '@fluentui/react-icons';
import { AssessmentRunner, ProgressSummary, type AssessmentSubmission } from '@datapass/learning';
import { appendAssessmentAttempt, type ProgressStateV2 } from '@datapass/progress';
import { PageHeader, useLocale } from '@datapass/ui';
import { lessons, questions, sqlFilterFigure, sqlPracticeAssessment } from '../data/contentCatalog';

export interface PracticePageProps {
  progress: ProgressStateV2;
  updateProgress(operation: (current: ProgressStateV2) => ProgressStateV2): void;
  onBack(): void;
  onProgress(): void;
}

export function PracticePage({ progress, updateProgress, onBack, onProgress }: PracticePageProps) {
  const { locale } = useLocale();
  const attemptCount = progress.assessments[sqlPracticeAssessment.id]?.attempts.length ?? 0;
  const attemptId = `${sqlPracticeAssessment.id}:attempt:${attemptCount + 1}`;

  const saveSubmission = (submission: AssessmentSubmission) => {
    updateProgress((current) => appendAssessmentAttempt(current, sqlPracticeAssessment.id, submission.attempt));
  };

  return (
    <div className="formation-page formation-practice" data-testid="formation-practice-page">
      <Button className="formation-back" appearance="subtle" icon={<ArrowLeft20Regular />} onClick={onBack}>
        {locale === 'no' ? 'Til kurskatalogen' : 'Back to course catalog'}
      </Button>
      <PageHeader
        eyebrow="PRACTICE · ORIGINAL REPRESENTATIVE QUESTIONS"
        title={locale === 'no' ? 'Sjekk forståelsen' : 'Check your understanding'}
        description={locale === 'no'
          ? 'Direkte tilbakemelding er aktiv i øvingsmodus. Resultatet lagres lokalt med progresjonsskjema v2.'
          : 'Immediate feedback is enabled in practice mode. The submitted result is stored locally through progress schema v2.'}
        metadata={<><Badge appearance="tint" color="informative">QCM</Badge><Badge appearance="outline">attempt {attemptCount + 1}</Badge></>}
      />
      <MessageBar intent="info">
        <MessageBarBody>
          <MessageBarTitle>No execution and no universal judge</MessageBarTitle>
          These deterministic questions grade declared choices only. They do not execute SQL, Python, PySpark, or notebook code.
        </MessageBarBody>
      </MessageBar>
      <ProgressSummary
        state={progress}
        lessonIds={lessons.map((lesson) => lesson.id)}
        assessmentIds={[sqlPracticeAssessment.id]}
        locale={locale}
      />
      <AssessmentRunner
        key={attemptId}
        assessment={sqlPracticeAssessment}
        questions={questions}
        figures={[sqlFilterFigure]}
        locale={locale}
        attemptId={attemptId}
        onSubmit={saveSubmission}
      />
      <nav className="formation-lesson-footer" aria-label="Practice actions">
        <Button appearance="secondary" onClick={onBack}>{locale === 'no' ? 'Alle kurs' : 'All courses'}</Button>
        <Button appearance="primary" onClick={onProgress}>{locale === 'no' ? 'Se fremdrift' : 'View progress'}</Button>
      </nav>
    </div>
  );
}
