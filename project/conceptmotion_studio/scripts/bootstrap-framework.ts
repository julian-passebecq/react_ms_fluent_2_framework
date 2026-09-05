/** Copied verbatim by the external scaffold. Runs before install, with Node only. */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_ROOT = 'project/conceptmotion_studio';
const SOURCE_MANIFEST = `${SOURCE_ROOT}/consumer-source.json`;
export const VENDOR_DIRECTORY = 'vendor/datapass-platform';

interface Pin { version: 1; repository: string; commit: string }
interface PackageManifest {
  name: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}
interface Distribution { version: 1; packages: Record<string, { directory: string; files: string[] }> }
interface SourceFile { name: string; hash: string }

function git(directory: string, args: string[], input?: string): string {
  return execFileSync('git', ['-C', directory, ...args], {
    encoding: 'utf8', windowsHide: true, input, maxBuffer: 16 * 1024 * 1024,
    // Never inherit an enclosing worktree/index from a caller's Git tooling.
    env: Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^GIT_(DIR|WORK_TREE|INDEX_FILE|OBJECT_DIRECTORY|ALTERNATE_OBJECT_DIRECTORIES)$/i.test(key))),
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

export function readFrameworkPin(root: string): Pin {
  const pin = JSON.parse(readFileSync(path.join(root, 'datapass.json'), 'utf8')) as Pin;
  if (pin.version !== 1 || !/^[a-f0-9]{40}$/.test(pin.commit)) throw new Error('datapass.json requires version 1 and an exact lowercase 40-character commit SHA.');
  if (typeof pin.repository !== 'string' || !pin.repository) throw new Error('datapass.json requires a repository.');
  // Absolute paths are supported for an offline Git mirror / the isolated fixture.
  if (!path.isAbsolute(pin.repository)) {
    const url = new URL(pin.repository);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('Use an HTTPS repository URL without credentials, or an absolute local Git mirror path.');
  }
  return pin;
}

function requestedPackages(root: string): string[] {
  const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')) as PackageManifest;
  const packages = Object.entries({ ...manifest.dependencies, ...manifest.devDependencies })
    .filter(([name]) => name.startsWith('@datapass/') || name.startsWith('@conceptmotion/'));
  if (!packages.length) throw new Error('Declare at least one Datapass/ConceptMotion dependency in the consumer package.json.');
  for (const [name, version] of packages) if (version !== 'workspace:*') throw new Error(`${name} must use workspace:* with the supported source bootstrap.`);
  return packages.map(([name]) => name).sort();
}

function selectFiles(directory: string, pin: Pin, requested: string[]): SourceFile[] {
  const distribution = JSON.parse(git(directory, ['show', `${pin.commit}:${SOURCE_MANIFEST}`])) as Distribution;
  if (distribution.version !== 1 || !distribution.packages) throw new Error('This commit does not expose consumer-source version 1.');
  const selected = new Set<string>();
  const paths = new Set([SOURCE_MANIFEST]);
  function visit(name: string): void {
    if (selected.has(name)) return;
    const entry = distribution.packages[name];
    if (!entry || !/^(packages\/[a-z][a-z-]*|content)$/.test(entry.directory) || !Array.isArray(entry.files)) throw new Error(`Unsupported framework package: ${name}`);
    selected.add(name);
    for (const relative of entry.files) {
      if (!/^[a-zA-Z0-9_./-]+$/.test(relative) || relative.startsWith('/') || relative.split('/').includes('..') || /private|snapshot/i.test(relative)) throw new Error(`Unsafe distribution path for ${name}`);
      paths.add(`${SOURCE_ROOT}/${entry.directory}/${relative}`);
    }
    const manifest = JSON.parse(git(directory, ['show', `${pin.commit}:${SOURCE_ROOT}/${entry.directory}/package.json`])) as PackageManifest;
    if (manifest.name !== name || !entry.files.includes('package.json')) throw new Error(`Distribution manifest mismatch for ${name}`);
    for (const [dependency, version] of Object.entries({ ...manifest.dependencies, ...manifest.optionalDependencies, ...manifest.peerDependencies })) {
      if (version.startsWith('workspace:')) visit(dependency);
    }
  }
  requested.forEach(visit);
  const records = git(directory, ['ls-tree', '-rz', pin.commit, '--', ...[...paths].sort()]).split('\0').filter(Boolean);
  const files = records.map((record): SourceFile => {
    const match = /^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/.exec(record);
    if (!match) throw new Error('Distribution must contain ordinary Git files, not symlinks or submodules.');
    return { name: match[3], hash: match[2] };
  });
  for (const allowed of paths) {
    if (!files.some(({ name }) => allowed.endsWith('/') ? name.startsWith(allowed) : name === allowed)) throw new Error(`Missing distribution file: ${allowed}`);
  }
  return files.sort((left, right) => left.name.localeCompare(right.name));
}

function checkOrdinaryDirectory(directory: string): void {
  if (existsSync(directory) && (!lstatSync(directory).isDirectory() || lstatSync(directory).isSymbolicLink())) throw new Error(`Expected a real directory: ${directory}`);
}

function verifyCheckout(directory: string, pin: Pin, files: SourceFile[]): void {
  checkOrdinaryDirectory(directory);
  checkOrdinaryDirectory(path.join(directory, '.git'));
  if (git(directory, ['rev-parse', 'HEAD']).trim() !== pin.commit) throw new Error('Framework HEAD differs from datapass.json. Move the generated vendor directory aside, then bootstrap the new pin.');
  const expected = new Map(files.map((file) => [file.name, file.hash]));
  function walk(current: string, prefix = ''): void {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if ((!prefix && entry.name === '.git') || entry.name === 'node_modules') continue;
      const name = `${prefix}${entry.name}`;
      const filename = path.join(current, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Unexpected symlink in framework source: ${name}`);
      if (entry.isDirectory()) { walk(filename, `${name}/`); continue; }
      const hash = expected.get(name);
      if (!hash) throw new Error(`Unexpected file in framework source: ${name}`);
      const bytes = readFileSync(filename);
      const actual = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
      if (actual !== hash) throw new Error(`Modified framework source: ${name}. Consumers must not patch vendor files.`);
      expected.delete(name);
    }
  }
  walk(directory);
  if (expected.size) throw new Error(`Missing framework source: ${[...expected.keys()][0]}`);
}

/** Idempotent. Verification checks Git identity AND every allowed byte, without repair. */
export function bootstrapFramework(root: string, verifyOnly = false): { commit: string; files: number } {
  root = path.resolve(root);
  const pin = readFrameworkPin(root);
  const requested = requestedPackages(root);
  const parent = path.join(root, 'vendor');
  const target = path.join(root, VENDOR_DIRECTORY);
  checkOrdinaryDirectory(parent);
  checkOrdinaryDirectory(target);
  if (!existsSync(target)) {
    if (verifyOnly) throw new Error('Framework source is missing. Run pnpm framework:bootstrap first.');
    mkdirSync(parent, { recursive: true });
    const staging = mkdtempSync(path.join(parent, '.datapass-bootstrap-'));
    try {
      git(staging, ['init', '--quiet', '--template=']);
      git(staging, ['config', 'core.autocrlf', 'false']);
      git(staging, ['remote', 'add', 'origin', pin.repository]);
      git(staging, ['config', 'remote.origin.promisor', 'true']);
      git(staging, ['config', 'remote.origin.partialclonefilter', 'blob:none']);
      git(staging, ['fetch', '--quiet', '--depth=1', '--filter=blob:none', 'origin', pin.commit]);
      if (git(staging, ['rev-parse', 'FETCH_HEAD']).trim() !== pin.commit) throw new Error('Fetched framework commit differs from the requested pin.');
      const files = selectFiles(staging, pin, requested);
      git(staging, ['sparse-checkout', 'init', '--no-cone']);
      git(staging, ['sparse-checkout', 'set', '--no-cone', '--stdin'], files.map(({ name }) => `/${name}`).join('\n') + '\n');
      git(staging, ['checkout', '--quiet', '--detach', pin.commit]);
      verifyCheckout(staging, pin, files);
      renameSync(staging, target);
    } finally {
      // Delete only this call's freshly allocated staging directory, never vendor/user data.
      if (path.dirname(path.resolve(staging)) !== parent || !path.basename(staging).startsWith('.datapass-bootstrap-')) throw new Error('Unsafe bootstrap cleanup target.');
      rmSync(staging, { recursive: true, force: true });
    }
  }
  const files = selectFiles(target, pin, requested);
  verifyCheckout(target, pin, files);
  return { commit: pin.commit, files: files.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.slice(2).some((arg) => arg !== '--verify')) throw new Error('Usage: node --experimental-strip-types scripts/bootstrap-framework.ts [--verify]');
  const result = bootstrapFramework(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), process.argv.includes('--verify'));
  console.log(`Framework ${result.commit}: verified ${result.files} immutable source files.`);
}
