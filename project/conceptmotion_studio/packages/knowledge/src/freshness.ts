import type { ChangeEvent, FreshnessState, KnowledgeEntry } from './contracts';

export interface FreshnessOptions {
  readonly now?: string | number | Date;
  readonly staleAfterDays?: number;
  readonly reviewedChangeEventIds?: readonly string[];
}

function timestamp(value: string | number | Date | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = value instanceof Date ? value.getTime() : typeof value === 'number' ? value : Date.parse(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function computeFreshnessState(
  entry: KnowledgeEntry,
  changes: readonly ChangeEvent[] = [],
  options: FreshnessOptions = {}
): FreshnessState {
  const verifiedAt = timestamp(entry.verifiedAt);
  const reviewed = new Set(options.reviewedChangeEventIds ?? []);
  const featureIds = new Set(entry.featureIds ?? []);
  const hasUnreviewedRelevantChange = changes.some((change) => {
    if (reviewed.has(change.id) || !change.featureIds.some((featureId) => featureIds.has(featureId))) return false;
    const detectedAt = timestamp(change.detectedAt);
    return detectedAt !== undefined && (verifiedAt === undefined || detectedAt > verifiedAt);
  });
  if (hasUnreviewedRelevantChange) return 'needs-review';
  if (verifiedAt === undefined) return 'unknown';
  const now = timestamp(options.now ?? Date.now());
  if (now === undefined) return 'unknown';
  const staleAfterDays = options.staleAfterDays ?? 180;
  if (!Number.isFinite(staleAfterDays) || staleAfterDays < 0) throw new Error('staleAfterDays must be a non-negative finite number.');
  const ageDays = (now - verifiedAt) / 86_400_000;
  return ageDays > staleAfterDays ? 'stale' : 'current';
}
