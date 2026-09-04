import { describe, expect, it } from 'vitest';
import { appendAssessmentAttempt, createEmptyProgressState, updateChallengeProgress, type AssessmentAttempt } from '@datapass/progress';
import { validateQuestionSpec } from '@datapass/content';
import { buildInterviewSession, interviewQuestions, interviewReviewIds } from './sessions';
const questionId = 'interview.sql.concept';
function attempt(id: string, correct: boolean, submittedAt?: string, assessmentId = 'interview.quick.sql'): AssessmentAttempt {
  return { id, assessmentId, status: 'submitted', ...(submittedAt ? { submittedAt } : {}), answers: { [questionId]: { questionId, value: 'selected', correct } } };
}
describe('separate interview session composition', () => {
  it('authors36 valid questions across9 domains with stable identities', () => {
    expect(interviewQuestions).toHaveLength(36); expect(new Set(interviewQuestions.map(q => q.id)).size).toBe(36);
    for (const question of interviewQuestions) expect(validateQuestionSpec(question).valid, question.id).toBe(true);
  });
  it('creates bounded quick, focused and mock sessions rather than a duplicate catalog', () => {
    const state = createEmptyProgressState();
    expect(buildInterviewSession('quick', 'sql', state).questions).toHaveLength(4);
    expect(buildInterviewSession('focused', 'sql', state).questions).toHaveLength(8);
    expect(buildInterviewSession('mock', 'sql', state).questions).toHaveLength(12);
    expect(buildInterviewSession('domain', 'sql', state).assessment.durationSeconds).toBeUndefined();
    expect(buildInterviewSession('review', 'sql', state).questions).toHaveLength(0);
  });
  it('reviews real flagged questions and ignores unknown ids', () => {
    const state = updateChallengeProgress(createEmptyProgressState(), 'interview.sql.concept', { flagged: true });
    expect(buildInterviewSession('review', 'sql', state).questions.map(q => q.id)).toEqual(['interview.sql.concept']);
  });
  it('removes corrected mistakes using chronological results across modes regardless of storage order', () => {
    const old = attempt('old', false, '2026-09-01T10:00:00Z');
    const corrected = attempt('corrected', true, '2026-09-02T10:00:00Z', 'interview.review.sql');
    const stale = attempt('stale', false, '2026-08-31T10:00:00Z');
    for (const entries of [[old, corrected, stale], [corrected, stale, old], [stale, old, corrected]]) {
      const state = entries.reduce((progress, entry) => appendAssessmentAttempt(progress, entry.assessmentId, entry), createEmptyProgressState());
      expect([...interviewReviewIds(state)]).toEqual([]);
      const flagged = updateChallengeProgress(state, questionId, { flagged: true });
      expect([...interviewReviewIds(flagged)]).toEqual([questionId]);
      expect([...interviewReviewIds(updateChallengeProgress(flagged, questionId, { flagged: false }))]).toEqual([]);
      const regression = attempt('newest', false, '2026-09-03T10:00:00Z');
      expect([...interviewReviewIds(appendAssessmentAttempt(state, regression.assessmentId, regression))]).toEqual([questionId]);
    }
  });
  it('recovers chronology from legacy timestamp IDs and ignores in-progress answers', () => {
    const old = attempt('interview.quick.sql:attempt:1788264000000', false);
    const corrected = attempt('interview.quick.sql:attempt:1788350400000', true);
    const pending = { ...attempt('pending', false, '2026-09-04T10:00:00Z'), status: 'in-progress' as const };
    const state = [corrected, old, pending].reduce((progress, entry) => appendAssessmentAttempt(progress, entry.assessmentId, entry), createEmptyProgressState());
    expect([...interviewReviewIds(state)]).toEqual([]);
  });
  it('uses started dates when submission dates are unavailable and resolves ties deterministically', () => {
    const older = { ...attempt('old', false), startedAt: '2026-09-01T10:00:00Z' };
    const first = { ...attempt('a', false), startedAt: '2026-09-02T10:00:00Z' };
    const last = { ...attempt('z', true), startedAt: '2026-09-02T10:00:00Z' };
    for (const entries of [[older, first, last], [last, first, older]]) {
      const state = entries.reduce((progress, entry) => appendAssessmentAttempt(progress, entry.assessmentId, entry), createEmptyProgressState());
      expect([...interviewReviewIds(state)]).toEqual([]);
    }
  });
});
