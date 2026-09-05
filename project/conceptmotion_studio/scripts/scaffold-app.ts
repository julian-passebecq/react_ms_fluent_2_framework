import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { APP_PRESETS, generateAppFiles, generateExternalAppFiles, type AppPreset } from '../packages/scaffold/src/index.js';

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appsRoot = path.join(workspaceRoot, 'apps');
const args = parseArgs(process.argv.slice(2));
const target = args.mode === 'external' ? path.resolve(args.output!) : path.resolve(appsRoot, args.name);

if (args.mode !== 'external' && path.dirname(target) !== appsRoot) throw new Error('Generated app target must stay directly inside apps/.');
const repositoryRoot = path.resolve(workspaceRoot, '../..');
if (args.mode === 'external' && (target === repositoryRoot || target.startsWith(`${repositoryRoot}${path.sep}`))) throw new Error('External mode requires a new directory outside the framework repository.');

const files = args.mode === 'external' ? generateExternalAppFiles({
  ...args, frameworkCommit: args.commit!,
  bootstrapSource: await readFile(path.join(workspaceRoot, 'scripts/bootstrap-framework.ts'), 'utf8'),
  releaseGateSource: await readFile(path.join(workspaceRoot, 'scripts/consumer-release-gate.ts'), 'utf8'),
}) : generateAppFiles(args);
await mkdir(target, { recursive: false });

for (const [relativePath, content] of Object.entries(files)) {
  const destination = path.join(target, relativePath);
  if (!destination.startsWith(`${target}${path.sep}`)) throw new Error(`Unsafe generated path: ${relativePath}`);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, content, { encoding: 'utf8', flag: 'wx' });
}

console.log(`scaffolded ${target} from ${args.preset} (${Object.keys(files).length} files)`);

function parseArgs(values: string[]): { name: string; preset: AppPreset; title?: string; description?: string; mode?: string; output?: string; commit?: string } {
  const options = new Map<string, string>();
  for (let index = 0; index < values.length; index += 2) {
    const key = values[index];
    const value = values[index + 1];
    if (!key || !['--name', '--preset', '--title', '--description', '--mode', '--output', '--commit'].includes(key) || !value || options.has(key.slice(2))) throw new Error('Usage: pnpm scaffold:app --name <kebab-name> --preset <preset> [--mode external --output <new-directory> --commit <exact-sha>]');
    options.set(key.slice(2), value);
  }
  const name = options.get('name');
  const preset = options.get('preset');
  if (!name || !preset || !APP_PRESETS.includes(preset as AppPreset)) {
    throw new Error(`--name and --preset are required; presets: ${APP_PRESETS.join(', ')}`);
  }
  const mode = options.get('mode');
  if (mode && mode !== 'external') throw new Error('The supported optional mode is external.');
  if (mode === 'external' && (!options.get('output') || !options.get('commit'))) throw new Error('External mode requires --output and --commit.');
  if (!mode && (options.has('output') || options.has('commit'))) throw new Error('--output and --commit require --mode external.');
  return { name, preset: preset as AppPreset, title: options.get('title'), description: options.get('description'), mode, output: options.get('output'), commit: options.get('commit') };
}
