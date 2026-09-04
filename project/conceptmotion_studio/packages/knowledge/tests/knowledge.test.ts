import { describe, expect, it } from 'vitest';
import {
  assertValidKnowledgeDataset,
  computeFreshnessState,
  isLocalizedText,
  parseKnowledgeDataset,
  resolveChangeImpact,
  resolveChangeImpacts,
  resolveLocalizedText,
  serializeKnowledgeDataset,
  validateKnowledgeDataset,
  type ChangeEvent,
  type KnowledgeDataset,
  type KnowledgeEntry
} from '../src/index';

const entries: readonly KnowledgeEntry[] = [
  {
    id: 'entry-z', slug: 'runtime-z', title: 'Runtime Z',
    featureIds: ['fabric.runtime'], sourceIds: ['learn-runtime'],
    figureIds: ['figure-b', 'figure-a', 'figure-a'], challengeIds: ['challenge-b'], verifiedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'entry-a', slug: 'runtime-a', title: { en: 'Runtime A', no: 'Kjøretid A' },
    featureIds: ['fabric.runtime'], sourceIds: ['learn-runtime'],
    figureIds: ['figure-c'], challengeIds: ['challenge-a', 'challenge-a'], verifiedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'entry-other', slug: 'other', title: 'Other', featureIds: ['fabric.other'], sourceIds: ['learn-runtime']
  }
];

const change: ChangeEvent = {
  id: 'change-runtime-2',
  sourceId: 'learn-runtime',
  detectedAt: '2026-09-01T00:00:00Z',
  title: 'Runtime behavior updated',
  kind: 'version',
  severity: 'review',
  featureIds: ['fabric.runtime', 'fabric.runtime']
};

const dataset: KnowledgeDataset = {
  sources: [{
    id: 'learn-runtime', title: 'Fabric runtime documentation',
    url: 'https://learn.microsoft.com/fabric/runtime', authority: 'official', vendor: 'Microsoft',
    productIds: ['fabric'], lastVerifiedAt: '2026-08-01T00:00:00Z'
  }],
  features: [
    { id: 'fabric.runtime', label: 'Fabric runtime', productId: 'fabric', status: 'ga', version: '2.0', sourceIds: ['learn-runtime'] },
    { id: 'fabric.other', label: 'Other feature', productId: 'fabric', sourceIds: ['learn-runtime'] }
  ],
  entries,
  changes: [change]
};

describe('@datapass/knowledge contracts', () => {
  it('requires at least one non-whitespace localized string', () => {
    expect(isLocalizedText('   ')).toBe(false);
    expect(isLocalizedText({ en: '', no: '   ' })).toBe(false);
    expect(isLocalizedText({ en: 'Knowledge', no: '' })).toBe(true);
    expect(resolveLocalizedText({ en: '  ', no: 'Kunnskap' }, 'en')).toBe('Kunnskap');
    expect(resolveLocalizedText('   ')).toBe('');
  });

  it('validates local source/feature/entry/change relationships', () => {
    expect(validateKnowledgeDataset(dataset).valid).toBe(true);
    expect(assertValidKnowledgeDataset(dataset)).toBe(dataset);
  });

  it('returns structured paths for broken references', () => {
    const invalid: KnowledgeDataset = {
      ...dataset,
      entries: [{ ...entries[0], sourceIds: ['missing-source'], featureIds: ['missing-feature'] }]
    };
    const validation = validateKnowledgeDataset(invalid);
    expect(validation.valid).toBe(false);
    expect(validation.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'knowledge.reference.source.unknown', path: 'entries[0].sourceIds[0]' }),
      expect.objectContaining({ code: 'knowledge.reference.feature.unknown', path: 'entries[0].featureIds[0]' })
    ]));
  });

  it('resolves impact only by stable feature ids with sorted, deduplicated outputs', () => {
    const impact = resolveChangeImpact(change, entries);
    expect(impact).toEqual({
      changeEventId: 'change-runtime-2',
      knowledgeEntryIds: ['entry-a', 'entry-z'],
      figureIds: ['figure-a', 'figure-b', 'figure-c'],
      challengeIds: ['challenge-a', 'challenge-b'],
      state: 'unreviewed'
    });
    expect(resolveChangeImpacts([change, change], entries)).toEqual([impact]);
  });

  it('computes needs-review before age-based freshness', () => {
    expect(computeFreshnessState(entries[0], [change], { now: '2026-09-04T00:00:00Z' })).toBe('needs-review');
    expect(computeFreshnessState(entries[0], [change], {
      now: '2026-09-04T00:00:00Z', reviewedChangeEventIds: [change.id]
    })).toBe('current');
    expect(computeFreshnessState(entries[0], [], { now: '2027-09-04T00:00:00Z', staleAfterDays: 180 })).toBe('stale');
    expect(computeFreshnessState(entries[2], [])).toBe('unknown');
  });

  it('round-trips deterministic validated JSON and locale fallback', () => {
    const serialized = serializeKnowledgeDataset(dataset, 0);
    expect(parseKnowledgeDataset(serialized)).toEqual(dataset);
    expect(serializeKnowledgeDataset(parseKnowledgeDataset(serialized), 0)).toBe(serialized);
    expect(resolveLocalizedText(entries[1].title, 'no')).toBe('Kjøretid A');
    expect(resolveLocalizedText({ en: 'English only' }, 'no')).toBe('English only');
  });
});
