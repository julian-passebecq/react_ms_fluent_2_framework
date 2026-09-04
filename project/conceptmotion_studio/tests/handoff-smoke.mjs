import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalog, categories } from '../src/data/catalog.js';
import { scenes } from '../src/data/scenes.js';
import { crossLanguageActions, languages, sheets } from '../src/data/cheatsheets.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const handoff = readJson('handoff.json');
const pkg = readJson('package.json');

const expected = {
  catalog_concepts: catalog.length,
  domains: categories.length,
  live_scenes: Object.keys(scenes).length,
  printable_sheets: sheets.length,
  cross_language_actions: crossLanguageActions.length,
  language_lenses: languages.length
};
for (const [key, value] of Object.entries(expected)) {
  if (handoff.counts?.[key] !== value) throw new Error(`handoff count ${key} is stale: ${handoff.counts?.[key]} != ${value}`);
}
if (handoff.version !== pkg.version) throw new Error(`handoff/package version mismatch: ${handoff.version} != ${pkg.version}`);

const rendererSource = fs.readFileSync(path.join(root, 'src/renderers/index.js'), 'utf8');
const rendererCount = [...rendererSource.matchAll(/^function render[A-Za-z0-9_]+/gm)].length;
if (handoff.counts?.renderer_families !== rendererCount) throw new Error(`handoff renderer count is stale: ${handoff.counts?.renderer_families} != ${rendererCount}`);

const required = [
  'README.md','AGENTS.md','CODEX_HANDOFF.md','AUDIT.md','ROADMAP.md','QA_REPORT.md','REPO_BOOTSTRAP.md',
  'docs/ARCHITECTURE.md','docs/AUTHORING_CONTRACT.md','docs/CONTENT_COVERAGE.md',
  'research/SOURCE_AUDIT.md','research/visual-references.md','research/user-reference-notes.md','research/MOVING_VIDEO_SPEC.md',
  'scene.schema.json',
  'schemas/cloud-diagram.schema.json','schemas/data-model.schema.json','schemas/lineage.schema.json',
  'docs/generators/GENERATOR_CONTRACTS.md','src/lib/generatorSpecs.js','src/data/generatorExamples.js'
];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`handoff file missing: ${file}`);
}

const media = [];
for (const dir of ['research','docs']) {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    if (entry.isFile() && /\.(png|jpe?g|webp|gif|mp4|mov)$/i.test(entry.name)) media.push(`${dir}/${entry.name}`);
  }
}
if (media.length) throw new Error(`raw reference media should not be bundled in handoff docs: ${media.join(', ')}`);

console.log(`handoff smoke: v${pkg.version} · ${rendererCount} renderers · ${required.length} required docs · source media excluded`);
