import { catalog, categories, priorityRank } from '../src/data/catalog.js';
import { scenes } from '../src/data/scenes.js';
import { crossLanguageActions, languages, sheets } from '../src/data/cheatsheets.js';

const live = new Set(Object.keys(scenes));
const lines = [];
lines.push('# Content coverage report');
lines.push('');
lines.push(`- Catalogue: **${catalog.length}** concepts`);
const recommended = catalog.filter((item) => ['interactive','story'].includes(item.surface));
const liveRecommended = recommended.filter((item) => live.has(item.id));
lines.push(`- Live scenes: **${live.size}**`);
lines.push(`- Recommended interactive/story concepts: **${recommended.length}** (**${liveRecommended.length}** live, **${recommended.length-liveRecommended.length}** planned)`);
lines.push(`- Printable sheets: **${sheets.length}**`);
lines.push(`- Cross-language actions: **${crossLanguageActions.length}** across **${languages.length}** lenses`);
lines.push('');
lines.push('## Domain coverage');
lines.push('');
lines.push('| Domain | Concepts | Live scenes |');
lines.push('| --- | ---: | ---: |');
for (const category of categories) {
  const items = catalog.filter((item) => item.category === category.id);
  lines.push(`| ${category.label} | ${items.length} | ${items.filter((item) => live.has(item.id)).length} |`);
}
lines.push('');
lines.push('## Highest-priority planned interactive/story items');
lines.push('');
const planned = catalog
  .filter((item) => ['interactive','story'].includes(item.surface) && !live.has(item.id))
  .sort((a,b) => (priorityRank[a.priority]-priorityRank[b.priority]) || a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
for (const item of planned) lines.push(`- **${item.title}** — ${item.category}/${item.subcategory} · ${item.priority} · ${item.id}`);
lines.push('');
lines.push('Generated from source data. Re-run `npm run report` after catalogue/scene changes.');

const output = lines.join('\n');
if (process.argv.includes('--stdout')) console.log(output);
else {
  const { writeFile } = await import('node:fs/promises');
  await writeFile(new URL('../docs/CONTENT_COVERAGE.md', import.meta.url), output + '\n', 'utf8');
  console.log(`coverage report: ${catalog.length} concepts · ${live.size} live scenes · ${planned.length} planned interactive/story`);
}
