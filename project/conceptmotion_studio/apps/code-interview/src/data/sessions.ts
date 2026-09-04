import type { AssessmentSpec, QuestionSpec } from '@datapass/content';
import type { AssessmentAttempt, ProgressStateV2 } from '@datapass/progress';
import { practiceItemById } from '../../../../content/practice';
import { figureForPracticeId } from '../../../../content/visuals';
import { interviewDomains, interviewModes, type InterviewMode } from './domains';

export const interviewQuestions: QuestionSpec[] = interviewDomains.flatMap(domain => {
  const item = practiceItemById(domain.practiceId);
  if (!item) throw new Error(`Interview source practice item missing: ${domain.practiceId}`);
  const variant = item.variants.find(v => v.language === domain.id) ?? item.variants[0];
  const prefix = `interview.${domain.id}`;
  const base = { domain: domain.id, conceptIds: [domain.practiceId], sourceIds: ['source.leetcodedataeng'], difficulty: 'intermediate' as const };
  const figure = figureForPracticeId(domain.practiceId);
  return [
    { ...base, id: `${prefix}.concept`, type: 'single-choice', prompt: { en: `${domain.title}: which mental model is accurate?` }, options: [{ id: 'accurate', label: { en: domain.concept } }, { id: 'misconception', label: { en: domain.wrong } }], correctOptionId: 'accurate', explanation: { en: item.concept }, ...(figure ? { figureId: figure.id } : {}) },
    { ...base, id: `${prefix}.syntax`, type: 'code-choice', prompt: { en: `Which reference completes “${item.title}”?` }, language: variant.monacoLanguage, options: [{ id: 'unfinished', label: { en: 'Option A' }, code: variant.starter }, { id: 'reference', label: { en: 'Option B' }, code: variant.solution }], correctOptionId: 'reference', explanation: { en: variant.explanation ?? `${domain.concept} This checks a code choice; it does not execute or judge your own code.` } },
    { ...base, id: `${prefix}.application`, type: 'ordering', prompt: { en: `Put the ${domain.title} reasoning steps in order.` }, items: [...domain.steps].reverse().map((label, i) => ({ id: `step-${3 - i}`, label: { en: label } })), correctOrderIds: domain.steps.map((_, i) => `step-${i}`), explanation: { en: domain.steps.join(' → ') } },
    { ...base, id: `${prefix}.scenario`, type: 'single-choice', prompt: { en: `A teammate asks for a production-safe ${domain.title} approach. What do you recommend?` }, options: [{ id: 'risky', label: { en: domain.risky } }, { id: 'safe', label: { en: domain.scenario } }], correctOptionId: 'safe', explanation: { en: `${domain.scenario} ${item.pitfall}` } },
  ] satisfies QuestionSpec[];
});
function attemptTimestamp(attempt: AssessmentAttempt): number {
  for (const date of [attempt.submittedAt, attempt.startedAt]) {
    const timestamp = date ? Date.parse(date) : NaN;
    if (Number.isFinite(timestamp)) return timestamp;
  }
  // Early local V3 attempts predate explicit dates but have a millisecond ID suffix.
  const legacy = /:attempt:(\d{13})$/u.exec(attempt.id);
  return legacy ? Number(legacy[1]) : 0;
}

/** Latest graded submission wins across session modes; storage order is not chronology. */
export function interviewReviewIds(progress: ProgressStateV2): ReadonlySet<string> {
  const latest = new Map<string, { correct: boolean; timestamp: number; identity: string }>();
  for (const assessment of Object.values(progress.assessments)) for (const attempt of assessment.attempts) {
    if (attempt.status !== 'submitted') continue;
    const timestamp = attemptTimestamp(attempt);
    const identity = `${attempt.assessmentId}\u0000${attempt.id}`;
    for (const answer of Object.values(attempt.answers)) {
      if (typeof answer.correct !== 'boolean') continue;
      const previous = latest.get(answer.questionId);
      // Stable identity resolves tied or undated imported attempts deterministically.
      if (!previous || timestamp > previous.timestamp || (timestamp === previous.timestamp && identity > previous.identity)) {
        latest.set(answer.questionId, { correct: answer.correct, timestamp, identity });
      }
    }
  }
  const review = new Set([...latest].filter(([, answer]) => !answer.correct).map(([id]) => id));
  Object.entries(progress.challenges).forEach(([id, status]) => { if (status.flagged) review.add(id); });
  return review;
}

export function buildInterviewSession(mode: InterviewMode, domainId: string, progress: ProgressStateV2): { assessment: AssessmentSpec; questions: QuestionSpec[]; practiceId: string } {
  const start = Math.max(0, interviewDomains.findIndex(domain => domain.id === domainId));
  const count = mode === 'mock' ? 3 : mode === 'focused' ? 2 : 1;
  const selected = Array.from({ length: count }, (_, i) => interviewDomains[(start + i) % interviewDomains.length].id);
  const review = interviewReviewIds(progress);
  const questions = interviewQuestions.filter(question => mode === 'review' ? review.has(question.id) : selected.includes(question.domain as typeof selected[number]));
  const configuration = interviewModes.find(candidate => candidate.id === mode)!;
  return { assessment: { id: `interview.${mode}.${domainId}`, title: { en: `${configuration.title} — ${interviewDomains[start].title}` }, mode: mode === 'mock' ? 'mock-exam' : 'interview', questionIds: questions.map(question => question.id), ...(configuration.seconds ? { durationSeconds: configuration.seconds } : {}), passingScore: 75 }, questions, practiceId: interviewDomains[start].practiceId };
}
