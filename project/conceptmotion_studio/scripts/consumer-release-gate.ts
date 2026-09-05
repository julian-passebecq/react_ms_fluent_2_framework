/** Official external release sequence; copied verbatim into generated consumers. */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bootstrapFramework } from './bootstrap-framework.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const pnpm = process.env.npm_execpath;
if (!existsSync(path.join(root, 'pnpm-lock.yaml'))) throw new Error('Missing consumer pnpm-lock.yaml. Bootstrap, run pnpm install once, and commit the resulting consumer lockfile before release.');
if (!pnpm || !/pnpm\.(?:c?js|mjs)$/.test(pnpm) || !existsSync(pnpm)) throw new Error('Run the release gate through pnpm release:gate.');
if (manifest.packageManager !== 'pnpm@11.19.0') throw new Error('Use the supported pnpm@11.19.0 consumer toolchain.');
const version = spawnSync(process.execPath, [pnpm, '--version'], { encoding: 'utf8', windowsHide: true });
if (version.status !== 0 || version.stdout.trim() !== '11.19.0') throw new Error('The release gate requires pnpm 11.19.0.');
for (const name of ['typecheck', 'validate:content', 'test:unit', 'build', 'test:browser']) {
  if (!manifest.scripts?.[name]) throw new Error(`Consumer release script is missing: ${name}`);
}
console.log(bootstrapFramework(root, true));
for (const args of [
  ['install', '--frozen-lockfile'],
  ['run', 'typecheck'],
  ['run', 'validate:content'],
  ['run', 'test:unit'],
  ['run', 'build'],
  ['run', 'test:browser'],
]) {
  console.log(`\nRelease: pnpm ${args.join(' ')}`);
  const result = spawnSync(process.execPath, [pnpm, ...args], { cwd: root, stdio: 'inherit', windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
// Build/import scripts may not modify the pinned framework either.
console.log(bootstrapFramework(root, true));
console.log('Consumer release passed against the production bundle at 1440px and 390px.');
