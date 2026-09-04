import type { ChangeEvent, ImpactRef, ImpactState, KnowledgeEntry } from './contracts';

function sortedUnique(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

export interface ResolveChangeImpactOptions {
  readonly state?: ImpactState;
}

export function resolveChangeImpact(
  change: ChangeEvent,
  entries: readonly KnowledgeEntry[],
  options: ResolveChangeImpactOptions = {}
): ImpactRef {
  const changedFeatures = new Set(change.featureIds);
  const impactedEntries = [...new Map(
    entries
      .filter((entry) => (entry.featureIds ?? []).some((featureId) => changedFeatures.has(featureId)))
      .map((entry) => [entry.id, entry])
  ).values()].sort((left, right) => left.id.localeCompare(right.id));
  const knowledgeEntryIds = impactedEntries.map((entry) => entry.id);
  const figureIds = sortedUnique(impactedEntries.flatMap((entry) => entry.figureIds ?? []));
  const challengeIds = sortedUnique(impactedEntries.flatMap((entry) => entry.challengeIds ?? []));
  return {
    changeEventId: change.id,
    knowledgeEntryIds,
    figureIds,
    challengeIds,
    state: options.state ?? (knowledgeEntryIds.length > 0 ? 'unreviewed' : 'no-change-needed')
  };
}

export function resolveChangeImpacts(
  changes: readonly ChangeEvent[],
  entries: readonly KnowledgeEntry[]
): readonly ImpactRef[] {
  return [...new Map(changes.map((change) => [change.id, change])).values()]
    .sort((left, right) => left.id.localeCompare(right.id))
    .map((change) => resolveChangeImpact(change, entries));
}
