import {
  createEmptyProgressState,
  type ChallengeProgress,
  type ProgressStateV2
} from './types';

export interface LegacyChallengeFlags {
  readonly mastered?: boolean;
  readonly review?: boolean;
  readonly flagged?: boolean;
}

export interface LegacyChallengeSnapshot {
  readonly drafts?: unknown;
  readonly progress?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function stableEntries<T>(record: Readonly<Record<string, T>>): readonly (readonly [string, T])[] {
  return Object.keys(record).sort().map((key) => [key, record[key]] as const);
}

export function parseLegacyProgressJson(source: string | null | undefined): unknown {
  if (source == null || source === '') return undefined;
  try {
    return JSON.parse(source) as unknown;
  } catch {
    return undefined;
  }
}

function splitDraftKey(key: string, knownChallengeIds: readonly string[]): readonly [string, string] {
  const known = [...knownChallengeIds]
    .filter((id) => key === id || key.startsWith(`${id}:`))
    .sort((left, right) => right.length - left.length || (left < right ? -1 : left > right ? 1 : 0))[0];
  if (known) return [known, key === known ? 'default' : key.slice(known.length + 1) || 'default'];
  const separator = key.lastIndexOf(':');
  return separator > 0 && separator < key.length - 1
    ? [key.slice(0, separator), key.slice(separator + 1)]
    : [key, 'default'];
}

export function migrateV11ChallengeState(draftsValue: unknown, progressValue: unknown): ProgressStateV2 {
  const legacyDrafts = isRecord(draftsValue) ? draftsValue : {};
  const legacyProgress = isRecord(progressValue) ? progressValue : {};
  const knownIds = Object.keys(legacyProgress).sort();
  const draftsByChallenge: Record<string, Record<string, string>> = {};

  stableEntries(legacyDrafts).forEach(([draftKey, draft]) => {
    if (typeof draft !== 'string' || !draftKey.trim()) return;
    const [challengeId, variantId] = splitDraftKey(draftKey, knownIds);
    if (!challengeId.trim() || !variantId.trim()) return;
    const existing = draftsByChallenge[challengeId] ?? {};
    existing[variantId] = draft;
    draftsByChallenge[challengeId] = existing;
  });

  const challengeIds = [...new Set([...Object.keys(legacyProgress), ...Object.keys(draftsByChallenge)])].sort();
  const challenges: Record<string, ChallengeProgress> = {};
  for (const id of challengeIds) {
    if (!id.trim()) continue;
    const flags = isRecord(legacyProgress[id]) ? legacyProgress[id] : {};
    const drafts = Object.fromEntries(stableEntries(draftsByChallenge[id] ?? {}));
    const mastered = flags.mastered === true;
    challenges[id] = {
      id,
      status: mastered ? 'completed' : Object.keys(drafts).length > 0 ? 'in-progress' : 'not-started',
      drafts,
      mastered,
      review: flags.review === true,
      flagged: flags.flagged === true
    };
  }

  return { ...createEmptyProgressState(), challenges };
}

export function migrateV11ChallengeJson(draftsJson: string | null | undefined, progressJson: string | null | undefined): ProgressStateV2 {
  return migrateV11ChallengeState(parseLegacyProgressJson(draftsJson), parseLegacyProgressJson(progressJson));
}
