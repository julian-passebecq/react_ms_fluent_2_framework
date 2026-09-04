import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createPublicPracticeCatalog, importTrainerSnapshot, serializeDeterministic, type TrainerSnapshot } from '../packages/content/src/index.js';

const root = new URL('../content/practice/', import.meta.url);
const snapshot = JSON.parse(await readFile(new URL('source.snapshot.json', root), 'utf8')) as TrainerSnapshot;
const imported = importTrainerSnapshot(snapshot);
const published = createPublicPracticeCatalog(imported, 'source:practice-corpus', [snapshot.source.repository, 'julian-passebecq/mlweb', 'julian-passebecq/architectureweb']);
for (const [filename, catalog] of [['catalog.json', imported], ['catalog.public.json', published]] as const) {
  const result = `${serializeDeterministic(catalog, 2)}\n`;
  const output = new URL(filename, root);
  if (process.argv.includes('--check')) {
    if (await readFile(output, 'utf8') !== result) throw new Error(`Practice corpus drift in ${filename}: run pnpm import:practice and review the change.`);
  } else await writeFile(output, result);
}
if (imported.items.length !== 323 || imported.items.reduce((n, i) => n + i.variants.length, 0) !== 500) throw new Error('Pinned source reconciliation failed.');
console.log(`Practice import ${process.argv.includes('--check') ? 'verified' : 'generated'}: 323 items, 500 variants, raw audit and public projection in ${fileURLToPath(root)}.`);
