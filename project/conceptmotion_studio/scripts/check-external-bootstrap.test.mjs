// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { bootstrapFramework, readFrameworkPin, VENDOR_DIRECTORY } from './bootstrap-framework.ts';

const root = mkdtempSync(path.join(os.tmpdir(), 'datapass-bootstrap-test-'));
const source = path.join(root, 'source');
const prefix = 'project/conceptmotion_studio';
const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const run = (cwd, ...args) => execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8', windowsHide: true }).trim();
const write = (directory, name, value) => {
  const file = path.join(directory, name);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, typeof value === 'string' ? value : JSON.stringify(value));
};
let commit;
let counter = 0;
function consumer(overrides = {}, dependencies = { '@datapass/ui': 'workspace:*' }) {
  const directory = path.join(root, `consumer-${counter++}`);
  write(directory, 'datapass.json', { version: 1, repository: source, commit, ...overrides });
  write(directory, 'package.json', { name: 'outside', dependencies });
  return directory;
}
beforeAll(() => {
  write(source, `${prefix}/consumer-source.json`, { version: 1, packages: {
    '@datapass/ui': { directory: 'packages/ui', files: ['package.json', 'src/'] },
    '@datapass/content': { directory: 'packages/content', files: ['package.json', 'src/'] },
  } });
  write(source, `${prefix}/packages/ui/package.json`, { name: '@datapass/ui', dependencies: { '@datapass/content': 'workspace:*' } });
  write(source, `${prefix}/packages/ui/src/index.ts`, 'export const ui = "original";\n');
  write(source, `${prefix}/packages/content/package.json`, { name: '@datapass/content' });
  write(source, `${prefix}/packages/content/src/index.ts`, 'export const content = "original";\n');
  write(source, `${prefix}/apps/unused/main.ts`, 'excluded app');
  write(source, `${prefix}/content/projects.private.local.json`, 'excluded private data');
  write(source, 'reference_material/history.txt', 'excluded historical material');
  write(source, 'root-secret.txt', 'excluded root file');
  run(source, 'init', '--quiet', '--template=');
  run(source, 'config', 'core.autocrlf', 'false');
  run(source, 'add', '.');
  run(source, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--quiet', '-m', 'Immutable fixture');
  commit = run(source, 'rev-parse', 'HEAD');
});
afterAll(() => {
  if (path.dirname(root) !== os.tmpdir() || !path.basename(root).startsWith('datapass-bootstrap-test-')) throw new Error('Unsafe fixture cleanup.');
  rmSync(root, { recursive: true, force: true });
});

describe('exact-commit selective source bootstrap', () => {
  it('materializes only the dependency closure, idempotently, with no source rewriting', () => {
    const directory = consumer();
    expect(bootstrapFramework(directory)).toEqual({ commit, files: 5 });
    expect(bootstrapFramework(directory, true)).toEqual({ commit, files: 5 });
    expect(bootstrapFramework(directory)).toEqual({ commit, files: 5 });
    const vendor = path.join(directory, VENDOR_DIRECTORY);
    expect(run(vendor, 'rev-parse', 'HEAD')).toBe(commit);
    expect(readFileSync(path.join(vendor, prefix, 'packages/ui/src/index.ts'), 'utf8')).toBe('export const ui = "original";\n');
    for (const forbidden of ['reference_material', 'root-secret.txt', `${prefix}/apps`, `${prefix}/content`]) expect(existsSync(path.join(vendor, forbidden))).toBe(false);
    expect(existsSync(path.join(directory, 'node_modules'))).toBe(false);
    write(vendor, `${prefix}/packages/ui/node_modules/.pnpm-linked`, 'normal package-manager materialization');
    expect(bootstrapFramework(directory, true).commit).toBe(commit);
  });

  it('verifies selected source bytes even if Git is told to assume them unchanged', () => {
    const directory = consumer();
    bootstrapFramework(directory);
    const vendor = path.join(directory, VENDOR_DIRECTORY);
    const filename = `${prefix}/packages/ui/src/index.ts`;
    run(vendor, 'update-index', '--assume-unchanged', filename);
    write(vendor, filename, 'export const ui = "patched";');
    expect(() => bootstrapFramework(directory, true)).toThrow('Modified framework source');
    expect(() => bootstrapFramework(directory)).toThrow('Modified framework source');
  });

  it('rejects missing, injected and changed-pin source without overwriting consumer work', () => {
    const directory = consumer();
    expect(() => bootstrapFramework(directory, true)).toThrow('missing');
    bootstrapFramework(directory);
    const vendor = path.join(directory, VENDOR_DIRECTORY);
    write(vendor, 'surprise.txt', 'preserve this file');
    expect(() => bootstrapFramework(directory, true)).toThrow('Unexpected file');
    expect(readFileSync(path.join(vendor, 'surprise.txt'), 'utf8')).toBe('preserve this file');
    rmSync(path.join(vendor, 'surprise.txt'));
    rmSync(path.join(vendor, prefix, 'packages/ui/src/index.ts'));
    expect(() => bootstrapFramework(directory, true)).toThrow('Missing framework source');
  });

  it('rejects a different checked-out commit even with identical source blobs', () => {
    const directory = consumer();
    bootstrapFramework(directory);
    const vendor = path.join(directory, VENDOR_DIRECTORY);
    const tree = run(vendor, 'rev-parse', 'HEAD^{tree}');
    const other = run(vendor, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit-tree', tree, '-m', 'Different identity');
    run(vendor, 'update-ref', 'HEAD', other);
    expect(() => bootstrapFramework(directory, true)).toThrow('HEAD differs');
  });

  it('rejects moving refs, credentials, unknown packages and incompatible dependency wiring', () => {
    for (const value of ['main', 'ce8353e', 'A'.repeat(40), '']) expect(() => readFrameworkPin(consumer({ commit: value }))).toThrow('exact');
    expect(() => readFrameworkPin(consumer({ repository: 'https://user:secret@example.invalid/repo' }))).toThrow('without credentials');
    expect(() => readFrameworkPin(consumer({ repository: '' }))).toThrow('repository');
    expect(readFrameworkPin(consumer({ repository: 'https://github.com/owner/repo.git' })).commit).toBe(commit);
    expect(() => bootstrapFramework(consumer({}, { '@datapass/unknown': 'workspace:*' }))).toThrow('Unsupported framework package');
    expect(() => bootstrapFramework(consumer({}, { '@datapass/ui': '*' }))).toThrow('workspace:*');
    expect(() => bootstrapFramework(consumer({}, {}))).toThrow('at least one');
  });

  it('runs the real external scaffold CLI and refuses invalid modes or overwrites', () => {
    const target = path.join(root, 'generated-cli');
    const command = [path.join(workspace, 'node_modules/tsx/dist/cli.mjs'), path.join(workspace, 'scripts/scaffold-app.ts')];
    const args = ['--mode', 'external', '--name', 'outside-cli', '--preset', 'portfolio-hub', '--output', target, '--commit', commit];
    const invoke = values => execFileSync(process.execPath, [...command, ...values], { cwd: workspace, encoding: 'utf8', windowsHide: true, stdio: 'pipe' });
    expect(invoke(args)).toContain('scaffolded');
    expect(readFileSync(path.join(target, 'scripts/bootstrap-framework.ts'), 'utf8')).toBe(readFileSync(path.join(workspace, 'scripts/bootstrap-framework.ts'), 'utf8'));
    expect(JSON.parse(readFileSync(path.join(target, 'tsconfig.json'), 'utf8'))).not.toHaveProperty('extends');
    expect(() => invoke(args)).toThrow();
    for (const values of [args.slice(0, -2), [...args, '--mode', 'external'], ['--name', 'outside-cli', '--preset', 'catalog', '--mode', 'unknown']]) expect(() => invoke(values)).toThrow();
    expect(() => invoke([...args.slice(0, 7), workspace, ...args.slice(8)])).toThrow();
  });

  it('refuses release without a consumer-owned lockfile, before any install or build', () => {
    const directory = consumer();
    write(directory, 'package.json', { name: 'missing-lock', type: 'module', packageManager: 'pnpm@11.19.0' });
    for (const name of ['bootstrap-framework.ts', 'consumer-release-gate.ts']) write(directory, `scripts/${name}`, readFileSync(path.join(workspace, 'scripts', name), 'utf8'));
    expect(() => execFileSync(process.execPath, ['--experimental-strip-types', path.join(directory, 'scripts/consumer-release-gate.ts')], { encoding: 'utf8', windowsHide: true, stdio: 'pipe' })).toThrow('Missing consumer pnpm-lock.yaml');
    expect(existsSync(path.join(directory, 'node_modules'))).toBe(false);
    expect(existsSync(path.join(directory, 'vendor'))).toBe(false);
  });
});
