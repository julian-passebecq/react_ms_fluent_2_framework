import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateExternalAppFiles } from '../packages/scaffold/src/index';
import { requireBundlePrivacy } from './check-bundle-privacy.mjs';

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(workspace, '../..');
const requestedPreset = process.argv[2];
if (process.argv.length > 3 || (requestedPreset && requestedPreset !== 'portfolio-hub' && requestedPreset !== 'learning')) throw new Error('Optional targeted proof: pnpm test:external-consumer <portfolio-hub|learning>');
const presets = requestedPreset ? [requestedPreset as 'portfolio-hub' | 'learning'] : ['portfolio-hub', 'learning'] as const;
const temporary = mkdtempSync(path.join(os.tmpdir(), 'datapass-external-proof-'));
const pnpm = process.env.npm_execpath;
if (!pnpm || !existsSync(pnpm)) throw new Error('Run through pnpm test:external-consumer.');
const started = Date.now();
const git = (cwd: string, ...args: string[]) => execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8', windowsHide: true }).trim();
const write = (root: string, name: string, value: string) => {
  const target = path.join(root, name);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, value);
};
function run(root: string, ...args: string[]): void {
  const result = spawnSync(process.execPath, [pnpm!, ...args], { cwd: root, stdio: 'inherit', windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`External consumer failed: pnpm ${args.join(' ')} (exit ${result.status})`);
}

try {
  // CI consumes the exact checked-out commit. Local development snapshots only
  // the declared source distribution so uncommitted implementation can be tested.
  const mode = process.env.CI ? 'commit' : 'working-tree-snapshot';
  let source = repo;
  if (mode === 'working-tree-snapshot') {
    source = path.join(temporary, 'source');
    const distribution = JSON.parse(readFileSync(path.join(workspace, 'consumer-source.json'), 'utf8'));
    for (const entry of Object.values(distribution.packages) as { directory: string; files: string[] }[]) {
      for (const name of entry.files) {
        const relative = `${entry.directory}/${name}`;
        const destination = path.join(source, 'project/conceptmotion_studio', relative);
        mkdirSync(path.dirname(destination), { recursive: true });
        cpSync(path.join(workspace, relative), destination, { recursive: true });
      }
    }
    write(source, 'project/conceptmotion_studio/consumer-source.json', readFileSync(path.join(workspace, 'consumer-source.json'), 'utf8'));
    git(source, 'init', '--quiet', '--template=');
    git(source, 'config', 'core.autocrlf', 'false');
    git(source, 'add', '.');
    git(source, '-c', 'user.name=Datapass fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--quiet', '-m', 'Isolated source distribution proof');
  }
  const commit = git(source, 'rev-parse', 'HEAD');
  const evidence: { preset: string; pin: string; sourceFiles: number; lockBytes: number }[] = [];
  for (const preset of presets) {
    const initial = path.join(temporary, `${preset}-initial`);
    const fresh = path.join(temporary, `${preset}-fresh`);
    const files = { ...generateExternalAppFiles({
      name: `external-${preset}`, preset, frameworkCommit: commit,
      bootstrapSource: readFileSync(path.join(workspace, 'scripts/bootstrap-framework.ts'), 'utf8'),
      releaseGateSource: readFileSync(path.join(workspace, 'scripts/consumer-release-gate.ts'), 'utf8'),
    }) };
    // A local Git mirror changes transport only; exact pin and source verification
    // are identical to the public HTTPS bootstrap used by the generated workflow.
    files['datapass.json'] = JSON.stringify({ version: 1, repository: source, commit }, null, 2) + '\n';
    if (preset === 'learning') {
      delete files['tests/app.smoke.test.tsx'];
      const fixture = path.join(workspace, 'tests/external-consumer');
      function addFixture(directory: string, prefix = ''): void {
        for (const entry of readdirSync(directory, { withFileTypes: true })) {
          const name = prefix + entry.name;
          if (entry.isDirectory()) addFixture(path.join(directory, entry.name), `${name}/`);
          else files[name] = readFileSync(path.join(directory, entry.name), 'utf8');
        }
      }
      addFixture(fixture);
      const manifest = JSON.parse(files['package.json']);
      manifest.dependencies['@conceptmotion/core'] = 'workspace:*';
      files['package.json'] = JSON.stringify(manifest, null, 2) + '\n';
    }
    for (const [name, bytes] of Object.entries(files)) write(initial, name, bytes);
    run(initial, 'framework:bootstrap');
    run(initial, 'install', '--lockfile-only');
    const lock = readFileSync(path.join(initial, 'pnpm-lock.yaml'), 'utf8');
    // A second independent Git repository receives only consumer-authored files
    // and its lockfile, never the first install/vendor/node_modules.
    for (const [name, bytes] of Object.entries(files)) write(fresh, name, bytes);
    write(fresh, 'pnpm-lock.yaml', lock);
    git(fresh, 'init', '--quiet', '--template=');
    git(fresh, 'add', '.');
    git(fresh, '-c', 'user.name=Datapass fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--quiet', '-m', 'Consumer-owned sources and lockfile');
    run(fresh, 'framework:bootstrap');
    run(fresh, 'install', '--frozen-lockfile');
    // Prove frozen mode fails rather than silently resolving a changed manifest.
    const mismatched = JSON.parse(files['package.json']);
    mismatched.dependencies.react = '19.2.7';
    write(fresh, 'package.json', JSON.stringify(mismatched));
    const mismatch = spawnSync(process.execPath, [pnpm!, 'install', '--frozen-lockfile'], { cwd: fresh, encoding: 'utf8', windowsHide: true });
    write(fresh, 'package.json', files['package.json']);
    assert.notEqual(mismatch.status, 0, 'Frozen install accepted a manifest/lock mismatch');
    assert.match(`${mismatch.stdout}${mismatch.stderr}`, /OUTDATED_LOCKFILE/);
    run(fresh, 'release:gate');
    requireBundlePrivacy(fresh, ['dist']);
    assert.equal(readFileSync(path.join(fresh, 'pnpm-lock.yaml'), 'utf8'), lock, 'Frozen release modified the consumer lockfile');
    assert.equal(git(fresh, 'status', '--porcelain'), '', 'Release changed consumer-owned files');
    const vendor = path.join(fresh, 'vendor/datapass-platform');
    assert.equal(existsSync(path.join(vendor, 'project/conceptmotion_studio/apps')), false);
    assert.equal(existsSync(path.join(vendor, 'reference_material')), false);
    const sourceFiles = git(vendor, 'ls-files', '-t').split('\n').filter(line => line.startsWith('H ')).length;
    evidence.push({ preset, pin: commit, sourceFiles, lockBytes: Buffer.byteLength(lock) });
  }
  const report = { mode, frameworkHead: git(repo, 'rev-parse', 'HEAD'), passed: true, durationSeconds: (Date.now() - started) / 1000, consumers: evidence };
  mkdirSync(path.join(workspace, 'qa'), { recursive: true });
  writeFileSync(path.join(workspace, 'qa/v4-external-consumer.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  // Keep failure evidence where the CI artifact uploader can find it.
  const diagnostics = path.join(workspace, 'test-results/external-consumer');
  mkdirSync(diagnostics, { recursive: true });
  for (const entry of readdirSync(temporary, { withFileTypes: true })) {
    if (!entry.name.endsWith('-fresh')) continue;
    for (const name of ['playwright-report', 'test-results', 'pnpm-lock.yaml']) {
      const source = path.join(temporary, entry.name, name);
      if (existsSync(source)) cpSync(source, path.join(diagnostics, entry.name, name), { recursive: true });
    }
  }
  throw error;
} finally {
  if (path.dirname(path.resolve(temporary)) !== path.resolve(os.tmpdir()) || !path.basename(temporary).startsWith('datapass-external-proof-')) throw new Error('Unsafe external proof cleanup target.');
  rmSync(temporary, { recursive: true, force: true });
}
