import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PUBLIC_OUTPUTS = [
  'dist', 'dist-formation', 'dist-code-sandbox', 'dist-code-interview',
  'dist-algorithm-atlas', 'dist-architecture-atlas', 'dist-pilot-center',
  'storybook-static', 'dist-legacy',
];
export const PRIVATE_SOURCE_REPOSITORIES = ['leetcodedataeng', 'mlweb', 'architectureweb'];
const binaryExtensions = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.bmp', '.tif', '.tiff',
  '.woff', '.woff2', '.ttf', '.otf', '.eot', '.wasm', '.pdf', '.mp3', '.mp4', '.webm', '.ogg',
]);

/** Decode bounded URL/JSON/HTML escaping; never evaluate emitted JavaScript. */
export function normalizeUrlEscapes(source) {
  let value = source;
  for (let round = 0; round < 6; round += 1) {
    const next = value
      .replace(/\\u\{([\da-f]{1,6})\}|\\u([\da-f]{4})|\\x([\da-f]{2})/gi, (match, braced, unicode, hex) => {
        const code = Number.parseInt(braced ?? unicode ?? hex, 16);
        return code <= 127 ? String.fromCharCode(code) : match;
      })
      .replace(/\\\//g, '/')
      .replace(/&#(?:x([\da-f]+)|(\d+));?/gi, (match, hex, decimal) => {
        const code = Number.parseInt(hex ?? decimal, hex ? 16 : 10);
        return code <= 127 ? String.fromCharCode(code) : match;
      })
      .replace(/&(sol|colon|percnt|period|commat|amp);/gi, (_, name) => ({ sol: '/', colon: ':', percnt: '%', period: '.', commat: '@', amp: '&' })[name.toLowerCase()])
      .replace(/%([\da-f]{2})/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)));
    if (next === value) break;
    value = next;
  }
  return value;
}

/** Family names are valid provenance; only exact private repository URL paths fail. */
export function findPrivateRepositoryUrls(source) {
  const normalized = normalizeUrlEscapes(source);
  return PRIVATE_SOURCE_REPOSITORIES.filter((repository) => {
    const pattern = new RegExp(
      `(?:^|[^a-z0-9.-])(?:github\\.com[/:]|raw\\.githubusercontent\\.com/|api\\.github\\.com/repos/|codeload\\.github\\.com/)julian-passebecq/${repository}(?:\\.git)?(?=$|[^a-z0-9_.-])`,
      'i',
    );
    return pattern.test(normalized);
  });
}

/** Scan every emitted textual artifact, including hidden manifests and source maps. */
export function scanBundlePrivacy(root, outputs = PUBLIC_OUTPUTS) {
  const reports = [];
  const violations = [];
  for (const output of outputs) {
    const directory = path.resolve(root, output);
    if (!statSync(directory, { throwIfNoEntry: false })?.isDirectory()) throw new Error(`Privacy gate: required build output missing: ${output}`);
    const report = { output, scannedFiles: 0, skippedBinaryFiles: 0 };
    const visit = (current) => {
      for (const entry of readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        const target = path.join(current, entry.name);
        if (entry.isSymbolicLink()) throw new Error(`Privacy gate: unexpected symbolic link: ${path.relative(root, target)}`);
        if (entry.isDirectory()) { visit(target); continue; }
        if (!entry.isFile()) continue;
        if (binaryExtensions.has(path.extname(entry.name).toLowerCase())) { report.skippedBinaryFiles += 1; continue; }
        const source = readFileSync(target, 'utf8');
        report.scannedFiles += 1;
        for (const repository of findPrivateRepositoryUrls(source)) {
          violations.push({ file: path.relative(root, target).replaceAll('\\', '/'), repository });
        }
      }
    };
    visit(directory);
    if (report.scannedFiles === 0) throw new Error(`Privacy gate: build output contains no textual artifacts: ${output}`);
    reports.push(report);
  }
  return { schemaVersion: 1, passed: violations.length === 0, reports, violations };
}

export function requireBundlePrivacy(root, outputs = PUBLIC_OUTPUTS) {
  const report = scanBundlePrivacy(root, outputs);
  if (!report.passed) {
    throw new Error(`Private source repository URL leaked into public build:\n${report.violations.map(({ file, repository }) => `- ${file}: ${repository}`).join('\n')}`);
  }
  return report;
}

const filename = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === filename) {
  const root = path.resolve(path.dirname(filename), '..');
  const report = scanBundlePrivacy(root);
  const destination = path.join(root, 'qa/v3-bundle-privacy.json');
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) process.exitCode = 1;
  else console.log(`Public bundle repository privacy: PASS (${report.reports.length} outputs; JS, CSS, HTML, JSON, SVG and source maps included)`);
}
