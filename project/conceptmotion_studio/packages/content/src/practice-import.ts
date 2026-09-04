import type { ChallengeDifficulty, ChallengeLanguage, ChallengeVariant, PracticeCatalog, PracticeCheatSheet, PracticeItem, PracticeTrack } from './challenge';
import type { JsonValue } from './json';
import { assertValidChallenge } from './challenge-validation';

export interface TrainerSourceItem {
  id: string; title: string; track: string; level: string; language?: string;
  concept: string; why?: string; task: string; context?: string; hints: string[]; pitfall: string;
  sourcePack?: string; officialSources?: JsonValue;
  materializedVariants: { id: string; label: string; language: string; starter: string; solution: string; explanation?: string; note?: string }[];
  original: JsonValue;
  collection: string;
}
export interface TrainerSnapshot {
  source: { repository: string; revision: string };
  items: TrainerSourceItem[];
  tracks: PracticeTrack[];
  cheatSheets: PracticeCheatSheet[];
}
const levels: Record<string, ChallengeDifficulty> = { Beginner: 'Easy', Intermediate: 'Medium', Expert: 'Hard' };
const languages = new Set(['python', 'pandas', 'pyspark', 'sql', 'tsql', 'duckdb', 'bigquery', 'dax', 'csharp', 'powershell', 'bash', 'shell', 'yaml', 'dockerfile', 'plaintext']);
function variant(source: TrainerSourceItem, v: TrainerSourceItem['materializedVariants'][number]): ChallengeVariant {
  const semantic = ['pyspark', 'pandas'].includes(source.track) && v.id === 'default' ? source.track : languages.has(v.id) ? v.id : v.language;
  if (!languages.has(semantic)) throw new Error(`Unsupported practice language ${semantic} for ${source.id}.`);
  return { id: v.id, language: semantic as ChallengeLanguage, label: v.label,
    monacoLanguage: ['yaml', 'dockerfile', 'dax'].includes(v.language) ? 'plaintext' : v.language,
    starter: v.starter, solution: v.solution,
    ...(v.explanation ? { explanation: v.explanation } : {}), ...(v.note ? { note: v.note } : {}) };
}
/** Pure, order-stable import: no filesystem, clocks, network, renderer, or code execution. */
export function importTrainerSnapshot(snapshot: TrainerSnapshot): PracticeCatalog {
  if (!/^[a-f0-9]{40}$/u.test(snapshot.source.revision)) throw new Error('Source revision must be a pinned full Git SHA.');
  const seen = new Set<string>();
  const tracks = new Map(snapshot.tracks.map(track => [track.id, track]));
  const items = snapshot.items.map((source): PracticeItem => {
    if (seen.has(source.id)) throw new Error(`Duplicate practice ID: ${source.id}.`);
    seen.add(source.id);
    const track = tracks.get(source.track);
    if (!track) throw new Error(`Unknown track ${source.track}.`);
    const difficulty = levels[source.level];
    if (!difficulty) throw new Error(`Unknown source level ${source.level}.`);
    return assertValidChallenge({ id: source.id, title: source.title, domain: track.name, trackId: source.track,
      difficulty, tags: [source.track, source.collection], summary: source.task,
      schema: source.context ?? '', input: '', example: '', expectedOutput: 'Reference solution and explanation only; no execution or correctness claim.',
      concept: source.concept, why: source.why ?? '', pitfall: source.pitfall, hints: [...source.hints],
      variants: source.materializedVariants.map(v => variant(source, v)), execution: 'none',
      source: { ...snapshot.source, itemId: source.id, collection: source.collection,
        ...(source.sourcePack ? { sourcePack: source.sourcePack } : {}), ...(source.officialSources ? { officialSources: source.officialSources } : {}) },
      sourceRecord: source.original });
  });
  return { schemaVersion: 1, source: { ...snapshot.source }, items, tracks: snapshot.tracks.map(t => ({ ...t })), cheatSheets: snapshot.cheatSheets.map(s => ({ ...s })) };
}

/** Build-time publication boundary. Raw source records stay in the non-bundled audit corpus. */
export function createPublicPracticeCatalog(catalog: PracticeCatalog, sourceId: string, privateRepositories: readonly string[]): PracticeCatalog {
  if (!/^source:[a-z0-9-]+$/u.test(sourceId)) throw new Error('Public practice source ID must be opaque and stable.');
  const privateReferences = privateRepositories.map(repository => {
    const escaped = repository.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
    return { repository, url: new RegExp(`https?:\\/\\/(?:www\\.)?(?:github\\.com|raw\\.githubusercontent\\.com)\\/${escaped}(?:[^\\s"'<>]*)?`, 'giu') };
  });
  function redact(value: unknown): unknown {
    if (typeof value === 'string') return privateReferences.reduce((text, reference) => text.replace(reference.url, sourceId).split(reference.repository).join(sourceId), value);
    if (Array.isArray(value)) return value.map(redact);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, redact(child)]));
    return value;
  }
  const projection: PracticeCatalog = {
    ...catalog, source: { repository: sourceId, revision: catalog.source.revision },
    items: catalog.items.map(item => ({ ...item, source: { ...item.source, repository: sourceId }, sourceRecord: { itemId: item.id, provenance: 'Full source records and third-party notices are retained in the non-bundled migration corpus.' } })),
  };
  return redact(projection) as PracticeCatalog;
}
