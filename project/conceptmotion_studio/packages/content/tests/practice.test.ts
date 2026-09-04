import { describe, expect, it } from 'vitest';
import { assertValidChallenge, createPublicPracticeCatalog, importTrainerSnapshot, serializeDeterministic, validateChallenge, type TrainerSnapshot } from '../src';
const snapshot: TrainerSnapshot = { source: { repository: 'owner/repo', revision: 'a'.repeat(40) }, tracks: [{ id: 'python', name: 'Python', description: 'Practice', collection: 'curriculum' }], cheatSheets: [], items: [{ id: 'stable-id', title: 'A preserved title', track: 'python', level: 'Beginner', concept: 'One scan', why: 'Bound memory', task: 'Count keys', hints: ['Start with a dictionary'], pitfall: 'Avoid rescanning', collection: 'curriculum', original: { sourcePack: 'fixture' }, materializedVariants: [{ id: 'default', label: 'Python', language: 'python', starter: 'pass', solution: 'count = 1' }] }] };
describe('shared practice contracts and deterministic importer', () => {
  it('preserves stable identity, content, source record and no-execution boundary', () => {
    const catalog = importTrainerSnapshot(snapshot);
    expect(catalog.items[0]).toMatchObject({ id: 'stable-id', title: 'A preserved title', difficulty: 'Easy', execution: 'none', sourceRecord: { sourcePack: 'fixture' }, source: { revision: 'a'.repeat(40), itemId: 'stable-id' } });
    expect(validateChallenge(catalog.items[0]).valid).toBe(true);
    expect(serializeDeterministic(catalog)).toBe(serializeDeterministic(importTrainerSnapshot(snapshot)));
    expect(snapshot.items[0]).not.toHaveProperty('variants');
  });
  it('rejects missing source revision, duplicate identities, unknown tracks and levels', () => {
    expect(() => importTrainerSnapshot({ ...snapshot, source: { ...snapshot.source, revision: 'main' } })).toThrow('pinned');
    expect(() => importTrainerSnapshot({ ...snapshot, items: [...snapshot.items, ...snapshot.items] })).toThrow('Duplicate');
    expect(() => importTrainerSnapshot({ ...snapshot, tracks: [] })).toThrow('Unknown track');
    expect(() => importTrainerSnapshot({ ...snapshot, items: [{ ...snapshot.items[0], level: 'Wizard' }] })).toThrow('Unknown source level');
  });
  it('preserves semantic engine and explicit plaintext fallback for unsupported highlighting', () => {
    const custom = JSON.parse(JSON.stringify(snapshot)) as TrainerSnapshot; custom.items[0].track = 'pyspark'; custom.tracks[0].id = 'pyspark';
    custom.items[0].sourcePack = 'Original pack'; custom.items[0].officialSources = [{ url: 'https://example.com' }];
    custom.items[0].materializedVariants[0].explanation = 'Explain'; custom.items[0].materializedVariants[0].note = 'Reference';
    expect(importTrainerSnapshot(custom).items[0].variants[0].language).toBe('pyspark');
    custom.items[0].materializedVariants = [{ id: 'yaml', label: 'YAML', language: 'yaml', starter: 'key:', solution: 'key: value' }];
    expect(importTrainerSnapshot(custom).items[0].variants[0].monacoLanguage).toBe('plaintext');
    custom.items[0].materializedVariants[0].id = 'unsupported'; custom.items[0].materializedVariants[0].language = 'unsupported';
    expect(() => importTrainerSnapshot(custom)).toThrow('Unsupported practice language');
  });
  it('rejects invalid payloads, duplicate variants and execution claims', () => {
    const valid = importTrainerSnapshot(snapshot).items[0];
    for (const value of [null, [], {}, { ...valid, id: '', difficulty: 'Unknown', tags: [1], hints: null, schema: 1 }, { ...valid, variants: [] }, { ...valid, variants: [null] }, { ...valid, variants: [...valid.variants, ...valid.variants] }, { ...valid, variants: [{ ...valid.variants[0], language: 'unknown' }] }, { ...valid, execution: 'spark' }, { ...valid, action: () => 1 }, { ...valid, nan: NaN }]) expect(validateChallenge(value).valid).toBe(false);
    const cyclic: Record<string, unknown> = { ...valid }; cyclic.self = cyclic;
    expect(validateChallenge(cyclic).valid).toBe(false);
    expect(() => assertValidChallenge({ ...valid, id: '' })).toThrow('id');
  });
  it('removes private references before bundling without mutating raw provenance or public sources', () => {
    const catalog = importTrainerSnapshot(snapshot);
    catalog.items[0].summary = 'Read https://github.com/owner/repo/blob/main/lesson.md and https://example.com/lesson.';
    catalog.items[0].source.officialSources = [{ url: 'https://raw.githubusercontent.com/owner/repo/main/private.md' }, { url: 'https://docs.python.org/3/' }];
    const published = createPublicPracticeCatalog(catalog, 'source:practice-corpus', ['owner/repo']);
    expect(serializeDeterministic(published)).not.toContain('owner/repo');
    expect(published.items[0].summary).toBe('Read source:practice-corpus and https://example.com/lesson.');
    expect(published.items[0].source.officialSources).toEqual([{ url: 'source:practice-corpus' }, { url: 'https://docs.python.org/3/' }]);
    expect(published.items[0].sourceRecord).not.toEqual(catalog.items[0].sourceRecord);
    expect(catalog.items[0].summary).toContain('owner/repo');
    expect(catalog.items[0].sourceRecord).toEqual({ sourcePack: 'fixture' });
    expect(() => createPublicPracticeCatalog(catalog, 'owner/repo', [])).toThrow('opaque');
  });
});
