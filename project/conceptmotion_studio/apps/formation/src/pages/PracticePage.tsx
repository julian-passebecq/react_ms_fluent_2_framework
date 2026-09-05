import { useState } from 'react';
import { Badge, Button } from '@fluentui/react-components';
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
  const [attemptNumber, setAttemptNumber] = useState(attemptCount + 1);
  const [submitted, setSubmitted] = useState(false);
  const attemptId = `${sqlPracticeAssessment.id}:attempt:${attemptNumber}`;

  const saveSubmission = (submission: AssessmentSubmission) => {
    setSubmitted(true);
    updateProgress((current) => appendAssessmentAttempt(current, sqlPracticeAssessment.id, submission.attempt));
  };

  return (
    <div className="formation-page formation-practice" data-testid="formation-practice-page">
      <Button className="formation-back" appearance="subtle" icon={<ArrowLeft20Regular />} onClick={onBack}>
        {locale === 'no' ? 'Til kurskatalogen' : 'Back to course catalog'}
      </Button>
      <PageHeader
        eyebrow="PRACTICE & REVIEW"
        title={locale === 'no' ? 'Sjekk forståelsen' : 'Check your understanding'}
        description={locale === 'no'
          ? 'Prøv et svar, les forklaringen og behold resultatet på denne enheten.'
          : 'Try an answer, read the explanation, and keep your result on this device.'}
        metadata={<><Badge appearance="tint" color="informative">Knowledge check</Badge><Badge appearance="outline">Attempt {attemptNumber}</Badge></>}
      />
      <p>Feedback checks your selected answers. Coding exercises remain separate reference practice.</p>
      <ProgressSummary
        state={progress}
        lessonIds={lessons.map((lesson) => lesson.id)}
        assessmentIds={[sqlPracticeAssessment.id]}
        locale={locale}
      />
      <AssessmentRunner
        headingLevel={2}
        key={attemptId}
        assessment={sqlPracticeAssessment}
        questions={questions}
        figures={[sqlFilterFigure]}
        locale={locale}
        attemptId={attemptId}
        onSubmit={saveSubmission}
      />
      {submitted && <Button className="formation-new-attempt" onClick={() => { setAttemptNumber(attemptCount + 1); setSubmitted(false); }}>Start another attempt</Button>}
      <nav className="formation-lesson-footer" aria-label="Practice actions">
        <Button appearance="secondary" onClick={onBack}>{locale === 'no' ? 'Alle kurs' : 'All courses'}</Button>
        <Button appearance="primary" onClick={onProgress}>{locale === 'no' ? 'Se fremdrift' : 'View progress'}</Button>
      </nav>
    </div>
  );
}
