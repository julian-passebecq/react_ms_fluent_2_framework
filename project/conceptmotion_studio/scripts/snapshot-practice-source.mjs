/** Maintainer-only, read-only Git source ingestion. Never evaluates challenge code strings. */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const repository = process.argv[2];
if (!repository) throw new Error('Usage: node --experimental-vm-modules scripts/snapshot-practice-source.mjs <read-only source repository>');
const revision = 'a3bff6aeeb89af5e379b4d8c168b3b1f581fe026';
const destination = fileURLToPath(new URL('../content/practice/', import.meta.url));
const modules = new Map();
const hashes = {};
const context = vm.createContext({});
const extensions = ['algorithmExtensions', 'analyticsEngineeringExtensions', 'seniorityExtensions', 'sourceCourseExtensions', 'storagePerformanceExtensions', 'pipelineTroubleshootingExtensions', 'airflowTroubleshootingExtensions', 'modernLakehouseExtensions', 'airflow3StreamingExtensions', 'dataReliabilityExtensions', 'architectureVisualExtensions'];
const permitted = new Set([...extensions, 'curriculum', 'sqlChallenges', 'sqlDialects', 'engineLab', 'pythonLab', 'cheatSheets', 'learningHubContent'].map(n => `src/${n}.js`));
const readGit = name => execFileSync('git', ['-C', repository, 'show', `${revision}:${name}`], { encoding: 'utf8', maxBuffer: 10_000_000 });
async function load(name) {
  if (!permitted.has(name)) throw new Error(`Source module not on audited data-only allowlist: ${name}`);
  if (modules.has(name)) return modules.get(name);
  const source = readGit(name);
  hashes[name] = createHash('sha256').update(source).digest('hex');
  const module = new vm.SourceTextModule(source, { context, identifier: name });
  modules.set(name, module);
  await module.link((specifier, referer) => {
    if (!specifier.startsWith('.')) throw new Error(`External source imports are forbidden: ${specifier}`);
    const target = path.posix.join(path.posix.dirname(referer.identifier), specifier);
    return load(target.endsWith('.js') ? target : `${target}.js`);
  });
  return module;
}
for (const file of [...extensions, 'curriculum', 'sqlChallenges', 'sqlDialects', 'engineLab', 'pythonLab', 'cheatSheets']) {
  const module = await load(`src/${file}.js`);
  if (module.status !== 'evaluated') await module.evaluate({ timeout: 1000 });
}
const get = name => modules.get(`src/${name}.js`).namespace;
const collections = [
  ['curriculum', get('curriculum').lessons, get('curriculum').tracks],
  ['sql', get('sqlChallenges').sqlChallenges, get('sqlChallenges').sqlChallengeTopics],
  ['engine', get('engineLab').engineChallenges, get('engineLab').engineTopics],
  ['python', get('pythonLab').pythonLabChallenges, get('pythonLab').pythonLabTopics],
];
const items = collections.flatMap(([collection, records]) => records.map(record => {
  const materializedVariants = collection === 'sql'
    ? get('sqlDialects').sqlDialects.map(dialect => {
      const value = get('sqlDialects').getSqlDialectChallenge(record, dialect.id);
      return { id: dialect.id, label: dialect.label, language: 'sql', starter: value.starter, solution: value.solution, explanation: value.solutionExplanation, note: dialect.note };
    }) : collection === 'engine'
      ? Object.keys(record.variants).map(id => { const value = get('engineLab').getEngineVariant(record, id); return { id, label: value.engineLabel, language: value.language, starter: value.starter, solution: value.solution, explanation: value.solutionExplanation }; })
      : [{ id: 'default', label: record.track === 'pyspark' ? 'PySpark' : record.track === 'pandas' ? 'pandas' : record.language, language: record.language, starter: record.starter, solution: record.solution, ...(record.solutionExplanation ? { explanation: record.solutionExplanation } : {}) }];
  return { ...record, collection, materializedVariants, original: record };
}));
const snapshot = {
  source: { repository: 'julian-passebecq/leetcodedataeng', revision }, items,
  tracks: collections.flatMap(([collection,, tracks]) => tracks.map(t => ({ id: t.id, name: t.name, description: t.description ?? '', collection }))),
  cheatSheets: get('cheatSheets').cheatSheets,
};
await mkdir(destination, { recursive: true });
await writeFile(path.join(destination, 'source.snapshot.json'), `${JSON.stringify(snapshot, null, 2)}\n`);
for (const file of ['THIRD_PARTY_NOTICES.md', 'ZILLACODE_APACHE_LICENSE.txt', 'SQL_CHALLENGE_IMPORT.md']) {
  const source = readGit(file); hashes[file] = createHash('sha256').update(source).digest('hex');
  await writeFile(path.join(destination, file), source);
}
const manifest = { source: snapshot.source, files: Object.fromEntries(Object.entries(hashes).sort()), collections: Object.fromEntries(collections.map(([id, records]) => [id, records.length])), distinctItems: new Set(items.map(i => i.id)).size, variants: items.reduce((n, i) => n + i.materializedVariants.length, 0), curriculumTracks: collections[0][2].length, cheatSheets: snapshot.cheatSheets.length, exclusions: [], excludedImplementation: ['legacy React components', 'legacy CSS', 'legacy renderers', 'vendor logo assets'], notices: 'Original source notices retained for attribution context; excluded UI/assets are not redistributed.' };
await writeFile(path.join(destination, 'source.manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Pinned source snapshot: ${items.length} items, ${manifest.variants} variants; source checkout untouched.`);
