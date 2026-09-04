import { catalog, categories } from '../src/data/catalog.js';
const ids = new Set();
for (const item of catalog) {
  if (!item.id || !item.title || !item.category || !item.summary) throw new Error(`Invalid catalogue entry ${JSON.stringify(item)}`);
  if (ids.has(item.id)) throw new Error(`Duplicate catalogue id ${item.id}`);
  ids.add(item.id);
  if (!categories.some(c => c.id === item.category)) throw new Error(`Unknown category ${item.category}`);
}
if (catalog.length < 150) throw new Error(`Catalogue unexpectedly small: ${catalog.length}`);
console.log(`catalog smoke: ${catalog.length} concepts / ${categories.length} categories`);
