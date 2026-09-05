import { interviewDomains } from './domains';

type InterviewDomainId = typeof interviewDomains[number]['id'];

/** Consumer-authored discussion prompts, deliberately separate from deterministic grading. */
const tradeOffs: Record<InterviewDomainId, readonly string[]> = {
  sql: ['Explain how the tie-breaker expresses the business rule, not just a convenient sort.', 'Discuss what to do with missing keys and timestamps before choosing one row.'],
  python: ['Balance a straightforward one-pass solution against memory used by distinct keys.', 'Explain whether malformed input should fail, be reported, or be handled explicitly.'],
  pandas: ['Choose the output grain before deciding which detail can be aggregated away.', 'Discuss how missing groups and measures affect the meaning of a result.'],
  pyspark: ['Separate the logical result from the physical plan that must be inspected externally.', 'Discuss duplicate and null-key policies before selecting a join strategy.'],
  'data-engineering': ['Compare larger batches for throughput with smaller batches for bounded recovery.', 'Explain the cost of duplicate protection and the risk of retrying without it.'],
  storage: ['Balance useful pruning against too many small partitions or files.', 'Explain which representative workloads would justify changing the layout.'],
  orchestration: ['Discuss task granularity: isolated retries versus coordination overhead.', 'Explain where transactional guarantees end and orchestration state begins.'],
  architecture: ['Compare latency, cost, recovery, and governance requirements before naming services.', 'Explain which responsibility boundaries simplify change and which add coordination.'],
  'bi-dax': ['Distinguish the meaning of a total from the sum of displayed subgroup values.', 'Explain when a filter should be preserved, replaced, or removed for the business question.'],
};

export function interviewReviewGuidance(domainIds: readonly string[]) {
  return interviewDomains.filter(domain => domainIds.includes(domain.id)).map(domain => ({
    id: domain.id,
    title: domain.title,
    strongAnswer: [domain.concept, domain.scenario],
    steps: domain.steps,
    tradeOffs: tradeOffs[domain.id],
  }));
}

/** Reuses the existing notes envelope without changing assessment, question, or storage IDs. */
export function interviewReasoningKey(assessmentId: string): string {
  return `${assessmentId}.reasoning`;
}
