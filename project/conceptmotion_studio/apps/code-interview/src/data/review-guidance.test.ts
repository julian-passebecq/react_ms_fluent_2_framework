import { describe, expect, it } from 'vitest';
import { interviewDomains } from './domains';
import { interviewReasoningKey, interviewReviewGuidance } from './review-guidance';
import { buildInterviewSession, interviewQuestions } from './sessions';
import { createEmptyProgressState } from '@datapass/progress';

describe('local interview discussion policy', () => {
  it('offers curated strong-answer and trade-off prompts for all nine existing domains', () => {
    const guidance = interviewReviewGuidance(interviewDomains.map(domain => domain.id));
    expect(guidance).toHaveLength(9);
    for (const domain of guidance) {
      expect(domain.strongAnswer).toHaveLength(2);
      expect(domain.tradeOffs).toHaveLength(2);
      expect(domain.steps).toHaveLength(4);
    }
    expect(interviewReviewGuidance(['sql', 'unknown', 'sql']).map(domain => domain.id)).toEqual(['sql']);
  });
  it('uses the existing notes envelope without extending question or grading identities', () => {
    const session = buildInterviewSession('quick', 'sql', createEmptyProgressState());
    expect(interviewReasoningKey(session.assessment.id)).toBe('interview.quick.sql.reasoning');
    expect(session.assessment.questionIds).toHaveLength(4);
    expect(interviewQuestions).toHaveLength(36);
    expect(session.assessment.questionIds).not.toContain(interviewReasoningKey(session.assessment.id));
  });
});
