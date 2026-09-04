import { describe, expect, it } from 'vitest';
import { createPublicPracticeCatalog, importTrainerSnapshot, serializeDeterministic, validateChallenge, type TrainerSnapshot } from '@datapass/content';
import snapshot from './source.snapshot.json';
import manifest from './source.manifest.json';
import catalog from './catalog.json';
import { practiceCatalog } from './index';
import { migratedVisuals } from '../visuals';
describe('pinned full trainer corpus', () => {
  it('reconciles all323 identities,500 variants,24 curriculum tracks,10 cheat sheets with no exclusions', () => {
    expect(manifest.collections).toEqual({ curriculum: 211, sql: 60, engine: 24, python: 28 });
    expect(catalog.items).toHaveLength(323);
    expect(new Set(catalog.items.map(item => item.id)).size).toBe(323);
    expect(catalog.items.reduce((total, item) => total + item.variants.length, 0)).toBe(500);
    expect(catalog.tracks.filter(track => track.collection === 'curriculum')).toHaveLength(24);
    expect(catalog.cheatSheets).toHaveLength(10);
    expect(manifest.exclusions).toEqual([]);
    expect(catalog.items.map(item => [item.id, item.title])).toEqual(snapshot.items.map(item => [item.id, item.title]));
  });
  it('regenerates byte-equivalent normalized content and validates every item', () => {
    expect(serializeDeterministic(importTrainerSnapshot(snapshot as unknown as TrainerSnapshot))).toBe(serializeDeterministic(catalog));
    for (const item of catalog.items) expect(validateChallenge(item), item.id).toEqual({ valid: true, issues: [] });
    expect(catalog.items.every(item => item.execution === 'none')).toBe(true);
  });
  it('retains SQL dialect and PySpark reference variants independently', () => {
    expect(catalog.items.find(item => item.id === 'lab-cross-size-brand')!.variants.map(v => v.id)).toEqual(['tsql', 'duckdb', 'bigquery']);
    const engine = catalog.items.find(item => item.id === 'eng-filter-active')!;
    expect(engine.variants.map(v => v.id)).toContain('pyspark');
    expect(engine.sourceRecord).toMatchObject({ variants: { pyspark: { language: 'python' } } });
    expect(manifest.files['THIRD_PARTY_NOTICES.md']).toMatch(/^[a-f0-9]{64}$/u);
  });
  it('links every migrated practice visual to a real preserved source identity', () => {
    const ids = new Set(catalog.items.map(item => item.id));
    for (const entry of migratedVisuals) for (const id of entry.practiceIds) expect(ids.has(id), `${entry.id} -> ${id}`).toBe(true);
  });
  it('publishes only the deterministic privacy-safe projection with all pedagogy and stable IDs', () => {
    const expected = createPublicPracticeCatalog(importTrainerSnapshot(snapshot as unknown as TrainerSnapshot), 'source:practice-corpus', [snapshot.source.repository, 'julian-passebecq/mlweb', 'julian-passebecq/architectureweb']);
    expect(practiceCatalog).toEqual(expected);
    const text = serializeDeterministic(practiceCatalog);
    for (const repository of ['julian-passebecq/leetcodedataeng', 'julian-passebecq/mlweb', 'julian-passebecq/architectureweb']) expect(text).not.toContain(repository);
    expect(practiceCatalog.items.map(item => [item.id, item.title, item.variants])).toEqual(catalog.items.map(item => [item.id, item.title, item.variants]));
    expect(practiceCatalog.source).toEqual({ repository: 'source:practice-corpus', revision: snapshot.source.revision });
    expect(practiceCatalog.items.map(item => item.source.sourcePack)).toEqual(catalog.items.map(item => item.source.sourcePack));
    expect(practiceCatalog.items.every(item => Object.keys(item.sourceRecord as object).length === 2)).toBe(true);
  });
});
