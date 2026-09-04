import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { APP_PRESETS, generateAppFiles, type AppPreset } from '../packages/scaffold/src/index.js';

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appsRoot = path.join(workspaceRoot, 'apps');
const args = parseArgs(process.argv.slice(2));
const target = path.resolve(appsRoot, args.name);

if (path.dirname(target) !== appsRoot) throw new Error('Generated app target must stay directly inside apps/.');

const files = generateAppFiles(args);
await mkdir(target, { recursive: false });

for (const [relativePath, content] of Object.entries(files)) {
  const destination = path.join(target, relativePath);
  if (!destination.startsWith(`${target}${path.sep}`)) throw new Error(`Unsafe generated path: ${relativePath}`);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, content, { encoding: 'utf8', flag: 'wx' });
}

console.log(`scaffolded apps/${args.name} from ${args.preset} (${Object.keys(files).length} files)`);

function parseArgs(values: string[]): { name: string; preset: AppPreset; title?: string; description?: string } {
  const options = new Map<string, string>();
  for (let index = 0; index < values.length; index += 2) {
    const key = values[index];
    const value = values[index + 1];
    if (!key?.startsWith('--') || !value) throw new Error('Usage: pnpm scaffold:app --name <kebab-name> --preset <preset> [--title <title>]');
    options.set(key.slice(2), value);
  }
  const name = options.get('name');
  const preset = options.get('preset');
  if (!name || !preset || !APP_PRESETS.includes(preset as AppPreset)) {
    throw new Error(`--name and --preset are required; presets: ${APP_PRESETS.join(', ')}`);
  }
  return { name, preset: preset as AppPreset, title: options.get('title'), description: options.get('description') };
}
