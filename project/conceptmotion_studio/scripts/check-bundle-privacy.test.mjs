// @vitest-environment node
import { mkdtempSync, mkdirSync, writeFileSync, unlinkSync, rmdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { findPrivateRepositoryUrls, PUBLIC_OUTPUTS, requireBundlePrivacy, scanBundlePrivacy } from './check-bundle-privacy.mjs';

const url = 'https://github.com/julian-passebecq/mlweb/blob/main/scene.ts';
const cleanups = [];
afterEach(() => { while (cleanups.length) cleanups.pop()(); });
function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'datapass-privacy-test-'));
  cleanups.push(() => rmdirSync(root));
  mkdirSync(path.join(root, 'output'));
  cleanups.push(() => rmdirSync(path.join(root, 'output')));
  return {
    root,
    write(name, source) {
      const filename = path.join(root, 'output', name);
      writeFileSync(filename, source);
      cleanups.push(() => unlinkSync(filename));
    },
  };
}

describe('public bundle repository privacy', () => {
  it.each([
    url,
    url.toUpperCase(),
    url.replaceAll('/', '\\/'),
    url.replaceAll('/', '\\u002f').replaceAll('-', '\\x2d'),
    url.replaceAll('/', '&#x2f;').replaceAll(':', '&colon;'),
    encodeURIComponent(url),
    encodeURIComponent(encodeURIComponent(url)),
    encodeURIComponent(url).replaceAll('%', '\\u0025'),
    'git@github.com:julian-passebecq/mlweb.git',
    '//github.com/julian-passebecq/mlweb?tab=readme',
    'https://raw.githubusercontent.com/julian-passebecq/mlweb/main/file.json',
    'https://api.github.com/repos/julian-passebecq/mlweb/contents',
    'https://codeload.github.com/julian-passebecq/mlweb/zip/main',
  ])('detects a private URL, including escaped artifacts: %s', (source) => {
    expect(findPrivateRepositoryUrls(source)).toEqual(['mlweb']);
  });

  it('matches all three exact private repositories without treating source-family names as URLs', () => {
    expect(findPrivateRepositoryUrls(['leetcodedataeng', 'mlweb', 'architectureweb'].map((name) => `https://github.com/julian-passebecq/${name}`).join('\n'))).toEqual(['leetcodedataeng', 'mlweb', 'architectureweb']);
    expect(findPrivateRepositoryUrls(JSON.stringify({ family: 'mlweb', provenance: 'architectureweb leetcodedataeng', repository: 'https://github.com/julian-passebecq/react_ms_fluent_2_framework' }))).toEqual([]);
    expect(findPrivateRepositoryUrls('https://github.com/someone-else/mlweb https://notgithub.com/julian-passebecq/mlweb https://github.com/julian-passebecq/mlweb-public')).toEqual([]);
    expect(findPrivateRepositoryUrls('malformed percent %zz and incomplete %2; V3_PRIVATE_OVERLAY_MUST_NEVER_BUNDLE')).toEqual([]);
  });

  it('scans source maps and non-JS text, reports leaks and ignores binary assets', () => {
    const files = fixture();
    files.write('entry.js', 'console.log("public source family: mlweb")');
    files.write('entry.js.map', JSON.stringify({ version: 3, sourcesContent: [`const source=${JSON.stringify(encodeURIComponent(url))}`] }));
    files.write('index.html', `<a href="https://github.com/julian-passebecq/architectureweb">Reference</a>`);
    files.write('logo.png', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0]));
    const report = scanBundlePrivacy(files.root, ['output']);
    expect(report.passed).toBe(false);
    expect(report.reports).toEqual([{ output: 'output', scannedFiles: 3, skippedBinaryFiles: 1 }]);
    expect(report.violations).toEqual([{ file: 'output/entry.js.map', repository: 'mlweb' }, { file: 'output/index.html', repository: 'architectureweb' }]);
    expect(() => requireBundlePrivacy(files.root, ['output'])).toThrow('entry.js.map: mlweb');
  });

  it('requires built outputs, accepts clean public text and covers all nine deployable outputs', () => {
    const files = fixture();
    expect(() => scanBundlePrivacy(files.root, ['missing'])).toThrow('required build output missing');
    expect(() => scanBundlePrivacy(files.root, ['output'])).toThrow('no textual artifacts');
    files.write('entry.js.map', JSON.stringify({ sources: ['content/mlweb.ts'], sourcesContent: ['public semantic migration'] }));
    expect(requireBundlePrivacy(files.root, ['output']).passed).toBe(true);
    expect(PUBLIC_OUTPUTS).toEqual(['dist', 'dist-formation', 'dist-code-sandbox', 'dist-code-interview', 'dist-algorithm-atlas', 'dist-architecture-atlas', 'dist-pilot-center', 'storybook-static', 'dist-legacy']);
  });
});
