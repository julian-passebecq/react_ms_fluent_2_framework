import { catalog, categories, priorityRank, stats } from '../src/data/catalog.js';
import { crossLanguageActions, languages, sheets } from '../src/data/cheatsheets.js';
import { scenes } from '../src/data/scenes.js';
import { normalizeScene, validateSceneShape } from '../src/lib/scene.js';
import { daxEffectiveFilters, joinResultRows, orderedValues } from '../src/lib/semantics.js';

const allowedPriorities = new Set(Object.keys(priorityRank));
const allowedSurfaces = new Set(['story','interactive','diagram','cheat','paper']);
const rendererRequirements = {
  join: ['left','right'], window: ['columns','rows'], rank: ['rows'], btree: ['values','target'],
  plan: ['nodes','links'], partition: ['buckets','records'], broadcast: ['workers'], pipeline: ['stages'],
  dax: ['dimensions','fact'], star: ['dims','fact'], interval: ['rows','incoming'], idempotency: ['input','target'],
  watermark: ['events'], dag: ['nodes','links'], storage: [], delta: [], binary: ['values','target'], array: ['values'],
  sampling: ['population'], scatter: ['points'], sigmoid: [], decisionTree: [], forest: [], kmeans: ['points'],
  pca: ['points'], matrix: ['values'], layers: ['layers'], git: []
};

const catalogIds = new Set();
for (const item of catalog) {
  if (catalogIds.has(item.id)) throw new Error(`duplicate catalogue id: ${item.id}`);
  catalogIds.add(item.id);
  if (!allowedPriorities.has(item.priority)) throw new Error(`${item.id}: invalid priority ${item.priority}`);
  if (!allowedSurfaces.has(item.surface)) throw new Error(`${item.id}: invalid surface ${item.surface}`);
  if (!Array.isArray(item.roles) || item.roles.length === 0) throw new Error(`${item.id}: roles missing`);
  if (!Array.isArray(item.tags)) throw new Error(`${item.id}: tags missing`);
  if (!categories.some((category) => category.id === item.category)) throw new Error(`${item.id}: unknown category ${item.category}`);
}
if (stats.concepts !== catalog.length) throw new Error('stats.concepts is stale');
if (stats.categories !== categories.length) throw new Error('stats.categories is stale');

for (const [id, rawScene] of Object.entries(scenes)) {
  if (!catalogIds.has(id)) throw new Error(`${id}: live scene is absent from catalogue taxonomy`);
  const scene = validateSceneShape({ id, ...rawScene });
  if (!(scene.renderer in rendererRequirements)) throw new Error(`${id}: renderer ${scene.renderer} is not covered by integrity checks`);
  for (const field of rendererRequirements[scene.renderer]) {
    if (!(field in scene)) throw new Error(`${id}: ${scene.renderer} renderer requires scene.${field}`);
  }
  if (scene.frames.length > 14) throw new Error(`${id}: ${scene.frames.length} frames is too long for a focused storyboard`);
  scene.frames.forEach((frame, index) => {
    if (!frame.caption?.trim()) throw new Error(`${id}: frame ${index} has no caption`);
    if (!frame.operation?.trim()) throw new Error(`${id}: frame ${index} has no operation label`);
    for (const line of frame.codeFocus || []) {
      if (!Number.isInteger(line) || line < 0 || line >= scene.code.length) throw new Error(`${id}: frame ${index} codeFocus ${line} invalid`);
    }
  });
  const normalized = normalizeScene({ ...rawScene, id });
  if (normalized.id !== id) throw new Error(`${id}: normalization changed id`);
}

let invalidV1Rejected = false;
try {
  validateSceneShape({ version:'1', id:'bad', title:'Bad scene', renderer:'window', code:['x'], frames:[{ caption:'Missing operation' }] });
} catch {
  invalidV1Rejected = true;
}
if (!invalidV1Rejected) throw new Error('canonical v1 validation should reject missing data/operation');

const daxFrame = scenes['dax-calculate'].frames[1];
const daxFilters = daxEffectiveFilters(daxFrame);
if ('Channel' in daxFilters || daxFilters.Product !== 'A') throw new Error(`dax-calculate REMOVEFILTERS semantics are wrong: ${JSON.stringify(daxFilters)}`);

const leftJoinOutput = joinResultRows(scenes['sql-left-join'], scenes['sql-left-join'].frames.at(-1));
if (leftJoinOutput.rows.length !== 5) throw new Error(`left join expected 5 result rows, got ${leftJoinOutput.rows.length}`);
if (!leftJoinOutput.rows.some((row) => row.values.includes('NULL'))) throw new Error('left join should expose NULL-extended output rows');

const rightJoinOutput = joinResultRows(scenes['sql-right-join'], scenes['sql-right-join'].frames.at(-1));
if (rightJoinOutput.rows.length !== 4 || !rightJoinOutput.rows.some((row) => row.values[0] === 'NULL')) throw new Error('right join output semantics are wrong');

const fullJoinOutput = joinResultRows(scenes['sql-full-join'], scenes['sql-full-join'].frames.at(-1));
if (fullJoinOutput.rows.length !== 6) throw new Error(`full join expected 6 result rows, got ${fullJoinOutput.rows.length}`);

const semiJoinOutput = joinResultRows(scenes['sql-semi-join'], scenes['sql-semi-join'].frames.at(-1));
if (semiJoinOutput.rows.length !== 2 || semiJoinOutput.columns.length !== scenes['sql-semi-join'].left.columns.length) throw new Error('semi join should project each matching left row once');

const antiJoinOutput = joinResultRows(scenes['sql-anti-join'], scenes['sql-anti-join'].frames.at(-1));
if (antiJoinOutput.rows.map((row) => row.values[0]).join(',') !== 'C2,C5') throw new Error('anti join should keep only C2,C5');

const bubble = scenes['sort-bubble'];
const finalOrder = orderedValues(bubble.values, bubble.frames.at(-1).order);
const sorted = [...bubble.values].sort((a,b)=>a-b);
if (JSON.stringify(finalOrder) !== JSON.stringify(sorted)) throw new Error(`sort-bubble does not finish sorted: ${finalOrder}`);

for (const action of crossLanguageActions) {
  for (const language of languages) {
    if (typeof action.code?.[language] !== 'string' || !action.code[language].trim()) throw new Error(`${action.id}: missing ${language} lens`);
  }
}
const sheetIds = new Set();
for (const sheet of sheets) {
  if (sheetIds.has(sheet.id)) throw new Error(`duplicate sheet id: ${sheet.id}`);
  sheetIds.add(sheet.id);
  if (!sheet.title || !Array.isArray(sheet.sections) || sheet.sections.length === 0) throw new Error(`${sheet.id}: invalid sheet`);
  for (const section of sheet.sections) if (!Array.isArray(section.items) || section.items.length === 0) throw new Error(`${sheet.id}/${section.title}: empty section`);
}

const recommendedItems = catalog.filter((item) => ['interactive','story'].includes(item.surface));
const liveIds = new Set(Object.keys(scenes));
const liveRecommended = recommendedItems.filter((item) => liveIds.has(item.id)).length;
console.log(`data integrity: ${catalog.length} concepts · ${liveIds.size} live scenes total · ${liveRecommended}/${recommendedItems.length} recommended interactive/story concepts live · ${sheets.length} sheets · ${crossLanguageActions.length} cross-language actions`);
