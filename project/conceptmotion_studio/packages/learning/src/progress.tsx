import { Badge, ProgressBar, Text } from '@fluentui/react-components';
import type { ProgressStateV2 } from '@datapass/progress';
import { useId, type ReactNode } from 'react';
import type { LearningLocale } from './localization';
import { ContentDetails } from '@datapass/ui';

export interface ProgressSummaryScope {
  readonly lessonIds?: readonly string[];
  readonly challengeIds?: readonly string[];
  readonly assessmentIds?: readonly string[];
}

export interface ProgressSummarySnapshot {
  readonly completedLessons: number;
  readonly totalLessons: number;
  readonly masteredChallenges: number;
  readonly totalChallenges: number;
  readonly submittedAttempts: number;
  readonly bestAssessmentPercent?: number;
  readonly reviewItems: number;
}

function scopeIds(record: Readonly<Record<string, unknown>>, ids: readonly string[] | undefined): readonly string[] {
  return ids ? [...new Set(ids)] : Object.keys(record).sort();
}

export function summarizeProgress(
  state: ProgressStateV2,
  scope: ProgressSummaryScope = {},
): ProgressSummarySnapshot {
  const lessonIds = scopeIds(state.lessons, scope.lessonIds);
  const challengeIds = scopeIds(state.challenges, scope.challengeIds);
  const assessmentIds = scopeIds(state.assessments, scope.assessmentIds);
  const submittedAttempts = assessmentIds.flatMap((id) => state.assessments[id]?.attempts ?? [])
    .filter((attempt) => attempt.status === 'submitted');
  const scores = submittedAttempts.flatMap((attempt) => attempt.score ? [attempt.score.percent] : []);

  return {
    completedLessons: lessonIds.filter((id) => state.lessons[id]?.completed === true).length,
    totalLessons: lessonIds.length,
    masteredChallenges: challengeIds.filter((id) => state.challenges[id]?.mastered === true).length,
    totalChallenges: challengeIds.length,
    submittedAttempts: submittedAttempts.length,
    ...(scores.length ? { bestAssessmentPercent: Math.max(...scores) } : {}),
    reviewItems: challengeIds.filter((id) => {
      const progress = state.challenges[id];
      return progress?.review === true || progress?.flagged === true;
    }).length,
  };
}

const labels = {
  en: {
    title: 'Learning progress', lessons: 'Lessons', mastered: 'Mastered', attempts: 'Submitted attempts',
    best: 'Best assessment', review: 'Review queue', empty: 'No assessment submitted',
  },
  no: {
    title: 'Læringsprogresjon', lessons: 'Leksjoner', mastered: 'Mestret', attempts: 'Leveringer',
    best: 'Beste vurdering', review: 'Repetisjonskø', empty: 'Ingen vurdering levert',
  },
} as const;

export interface ProgressSummaryProps extends ProgressSummaryScope {
  readonly state: ProgressStateV2;
  readonly locale?: LearningLocale;
  readonly title?: ReactNode;
  readonly className?: string;
  readonly metadataMode?: 'consumer' | 'developer';
}

export function ProgressSummary({
  state,
  lessonIds,
  challengeIds,
  assessmentIds,
  locale = 'en',
  title,
  className,
  metadataMode = 'consumer',
}: ProgressSummaryProps) {
  const titleId = useId();
  const snapshot = summarizeProgress(state, { lessonIds, challengeIds, assessmentIds });
  const copy = locale === 'no' ? labels.no : labels.en;
  const lessonFraction = snapshot.totalLessons === 0 ? 0 : snapshot.completedLessons / snapshot.totalLessons;

  return (
    <section
      className={className ? `dp-progress-summary ${className}` : 'dp-progress-summary'}
      aria-labelledby={titleId}
    >
      <header>
        <h2 id={titleId}>{title ?? copy.title}</h2>
        <Badge appearance="outline">On this device</Badge>
      </header>
      {snapshot.totalLessons > 0 && <div className="dp-progress-summary__lesson-progress">
        <div><span>{copy.lessons}</span><strong>{snapshot.completedLessons} / {snapshot.totalLessons}</strong></div>
        <ProgressBar value={lessonFraction} aria-label={`${copy.lessons}: ${snapshot.completedLessons} of ${snapshot.totalLessons}`} />
      </div>}
      <dl className="dp-progress-summary__metrics">
        {snapshot.totalChallenges > 0 && <div><dt>{copy.mastered}</dt><dd>{snapshot.masteredChallenges} / {snapshot.totalChallenges}</dd></div>}
        <div><dt>{copy.attempts}</dt><dd>{snapshot.submittedAttempts}</dd></div>
        <div><dt>{copy.best}</dt><dd>{snapshot.bestAssessmentPercent === undefined ? copy.empty : `${snapshot.bestAssessmentPercent}%`}</dd></div>
        <div><dt>{copy.review}</dt><dd>{snapshot.reviewItems}</dd></div>
      </dl>
      <ContentDetails summary="Progress details" open={metadataMode === 'developer' ? true : undefined}>
        <Text size={200}>Local · schema v{state.schemaVersion}. Stored through the shared versioned progress contract.</Text>
      </ContentDetails>
    </section>
  );
}
