import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.resolve(appRoot, '..', '..', 'dist');
const manifestPath = path.join(outputRoot, '.vite', 'manifest.json');

if (!fs.existsSync(manifestPath)) {
  throw new Error(`Studio build manifest is missing: ${manifestPath}. Run the Studio production build first.`);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const keys = Object.keys(manifest);

function findModule(suffix) {
  const normalized = suffix.replaceAll('\\', '/');
  const match = keys.find((key) => key.replaceAll('\\', '/').endsWith(normalized));
  if (!match) throw new Error(`Build manifest does not contain ${suffix}.`);
  return match;
}

function closure(startKeys, includeDynamic = false) {
  const result = new Set();
  const pending = [...startKeys];
  while (pending.length) {
    const key = pending.pop();
    if (!key || result.has(key)) continue;
    result.add(key);
    const entry = manifest[key];
    pending.push(...(entry?.imports ?? []));
    if (includeDynamic) pending.push(...(entry?.dynamicImports ?? []));
  }
  return result;
}

function isMonaco(key) {
  const entry = manifest[key] ?? {};
  return [key, entry.src, entry.file]
    .filter(Boolean)
    .some((value) => /(?:monaco-editor|MonacoSurfaces|\/monaco(?:-|\.|\/))/i.test(value));
}

function assertNoMonaco(label, graph) {
  const matches = [...graph].filter(isMonaco);
  if (matches.length) throw new Error(`${label} statically reaches Monaco: ${matches.join(', ')}`);
}

function assertDynamicallyReachesMonaco(label, key) {
  const staticGraph = closure([key]);
  assertNoMonaco(label, staticGraph);
  const lazyTargets = [...staticGraph].flatMap((staticKey) => manifest[staticKey]?.dynamicImports ?? []);
  const dynamicMatches = [...closure(lazyTargets)].filter(isMonaco);
  if (!dynamicMatches.length) throw new Error(`${label} has no lazy path to Monaco.`);
  return dynamicMatches;
}

function bytes(graph) {
  return [...graph].reduce((total, key) => {
    const file = manifest[key]?.file;
    if (!file || !file.endsWith('.js')) return total;
    return total + fs.statSync(path.join(outputRoot, file)).size;
  }, 0);
}

function editorClosure(startKeys) {
  const result = new Set();
  const pending = [...startKeys];
  while (pending.length) {
    const key = pending.pop();
    if (!key || result.has(key)) continue;
    result.add(key);
    const entry = manifest[key];
    pending.push(...(entry?.imports ?? []));
    if (isMonaco(key)) pending.push(...(entry?.dynamicImports ?? []));
  }
  return result;
}

const entryKeys = keys.filter((key) => manifest[key]?.isEntry);
if (!entryKeys.length) throw new Error('Studio build manifest has no application entry.');

const initialGraph = closure(entryKeys);
assertNoMonaco('Catalog initial route graph', initialGraph);

const knowledgeKey = findModule('src/pages/KnowledgePage.tsx');
const workflowKey = findModule('src/pages/WorkflowPage.tsx');
const challengeKey = findModule('src/pages/ChallengePage.tsx');

assertNoMonaco('Knowledge route graph', closure([knowledgeKey]));
const workflowMonaco = assertDynamicallyReachesMonaco('Workflow route graph', workflowKey);
const challengeMonaco = assertDynamicallyReachesMonaco('Challenge route graph', challengeKey);

const editorRouteStaticGraph = new Set([
  ...closure([workflowKey]),
  ...closure([challengeKey]),
]);
const monacoKeys = editorClosure([...workflowMonaco, ...challengeMonaco]);
for (const key of editorRouteStaticGraph) monacoKeys.delete(key);
const report = {
  schemaVersion: 1,
  assertions: {
    catalogInitialExcludesMonaco: true,
    knowledgeExcludesMonaco: true,
    workflowLoadsMonacoDynamically: true,
    challengeLoadsMonacoDynamically: true,
  },
  initialStaticBytes: bytes(initialGraph),
  knowledgeStaticBytes: bytes(closure([knowledgeKey])),
  workflowStaticBytes: bytes(closure([workflowKey])),
  challengeStaticBytes: bytes(closure([challengeKey])),
  editorLazyBytes: bytes(monacoKeys),
  monacoFiles: [...monacoKeys].map((key) => manifest[key]?.file).filter(Boolean).sort(),
};

const reportPath = path.join(path.resolve(appRoot, '..', '..'), 'qa', 'v4-studio-bundle.json');
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log('lazy bundle boundary: Catalog and Knowledge exclude Monaco; Challenge and Workflow reach it only dynamically');
console.log(JSON.stringify(report, null, 2));
console.log(`bundle evidence: ${path.relative(path.resolve(appRoot, '..', '..'), reportPath).replaceAll('\\', '/')}`);
