import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { access, mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { build } from 'vite';

import { APP_PRESETS, generateAppFiles } from '../packages/scaffold/src/index.js';

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const testRoot = path.join(workspaceRoot, 'test-results');
const runFile = promisify(execFile);
const tscPath = path.join(workspaceRoot, 'node_modules', 'typescript', 'bin', 'tsc');
await mkdir(testRoot, { recursive: true });
const targets: string[] = [];

try {
  const results: string[] = [];
  for (const preset of APP_PRESETS) {
    const name = `generated-${preset}-proof`;
    const target = await mkdtemp(path.join(testRoot, `scaffold-${preset}-`));
    targets.push(target);
    const options = { name, preset, title: `Generated ${preset} proof` } as const;
    const files = generateAppFiles(options);
    assert.deepEqual(files, generateAppFiles(options), `${preset} scaffold output changed between identical runs`);

    for (const [relativePath, source] of Object.entries(files)) {
      const destination = path.resolve(target, relativePath);
      if (!destination.startsWith(`${target}${path.sep}`)) throw new Error(`Unsafe generated path: ${relativePath}`);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, source, 'utf8');
    }
    await linkGeneratedDependencies(target, files['package.json']);

    const configPath = path.join(target, 'tsconfig.json');
    try {
      await runFile(process.execPath, [
        tscPath,
        '--noEmit',
        '--pretty',
        'false',
        '--tsBuildInfoFile',
        path.join(target, '.tsbuildinfo'),
        '-p',
        configPath,
      ], {
        cwd: target,
        windowsHide: true,
      });
    } catch (error) {
      throw new Error(`${preset} preset failed typecheck:\n${commandFailure(error)}`, { cause: error });
    }

    await build({
      root: target,
      configFile: false,
      logLevel: 'silent',
      plugins: [react()],
      build: { outDir: path.join(target, 'dist'), write: false, target: 'es2022' },
    });

    try {
      const vitestPath = path.join(target, 'node_modules', 'vitest', 'vitest.mjs');
      await runFile(process.execPath, [vitestPath, 'run', '--root', target, '--environment', 'node'], {
        cwd: target,
        windowsHide: true,
      });
    } catch (error) {
      throw new Error(`${preset} preset failed its generated baseline tests:\n${commandFailure(error)}`, { cause: error });
    }

    results.push(`${preset} (${Object.keys(files).length} files)`);
  }

  console.log(`scaffold smoke: ${results.join(' · ')} · deterministic typecheck/build/baseline tests passed`);
} finally {
  for (const target of targets) {
    const resolved = path.resolve(target);
    if (path.dirname(resolved) !== testRoot || !path.basename(resolved).startsWith('scaffold-')) {
      throw new Error(`Refusing to remove unexpected scaffold target: ${resolved}`);
    }
    await rm(resolved, { recursive: true, force: true });
  }
}

async function linkGeneratedDependencies(target: string, packageSource: string): Promise<void> {
  const manifest = JSON.parse(packageSource) as {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  for (const [packageName, version] of Object.entries({ ...manifest.dependencies, ...manifest.devDependencies })) {
    const source = version === 'workspace:*'
      ? path.join(workspaceRoot, 'packages', packageName.slice(packageName.lastIndexOf('/') + 1))
      : await firstExistingPath([
          path.join(workspaceRoot, 'node_modules', ...packageName.split('/')),
          path.join(workspaceRoot, 'node_modules', '.pnpm', 'node_modules', ...packageName.split('/')),
        ]);
    const destination = path.join(target, 'node_modules', ...packageName.split('/'));
    await mkdir(path.dirname(destination), { recursive: true });
    await symlink(source, destination, 'junction');
  }
}

async function firstExistingPath(candidates: string[]): Promise<string> {
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Continue to the next deterministic workspace dependency location.
    }
  }
  throw new Error(`Scaffold smoke dependency is unavailable: ${candidates.join(', ')}`);
}

function commandFailure(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const result = error as Error & { stdout?: string; stderr?: string };
  return [result.stdout, result.stderr, result.message].filter(Boolean).join('\n').trim();
}
