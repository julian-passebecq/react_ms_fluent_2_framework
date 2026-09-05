import { describe, expect, it } from 'vitest';
import { transformWithOxc } from 'vite';
import { APP_PRESETS, generateExternalAppFiles } from '../src/index';

const tools = { bootstrapSource: '// official bootstrap\n', releaseGateSource: '// official gate\n' };
const pin = 'a'.repeat(40);

describe('external app recipes', () => {
  it('keeps all presets standalone and deterministic with consumer-owned release wiring', async () => {
    for (const preset of APP_PRESETS) {
      const options = { name: `outside-${preset}`, preset, frameworkCommit: pin, ...tools };
      const files = generateExternalAppFiles(options);
      expect(files).toEqual(generateExternalAppFiles(options));
      expect(Object.keys(files)).toEqual(Object.keys(files).sort());
      expect(files['scripts/bootstrap-framework.ts']).toBe(tools.bootstrapSource);
      expect(files['scripts/consumer-release-gate.ts']).toBe(tools.releaseGateSource);
      expect(files).not.toHaveProperty('pnpm-lock.yaml');
      expect(JSON.parse(files['datapass.json']).commit).toBe(pin);
      const manifest = JSON.parse(files['package.json']);
      expect(manifest.packageManager).toBe('pnpm@11.19.0');
      expect(manifest.dependencies['@datapass/canonical']).toBe('workspace:*');
      expect(manifest.scripts['release:gate']).toContain('consumer-release-gate.ts');
      expect(manifest.scripts.preview).toContain('--strictPort');
      expect(JSON.parse(files['tsconfig.json'])).not.toHaveProperty('extends');
      expect(files['vite.config.ts']).not.toContain('../../');
      expect(files['.gitignore']).toContain('vendor/');
      expect(files['.gitignore']).not.toContain('pnpm-lock');
      expect(files['.github/workflows/ci.yml']).toContain('pnpm install --frozen-lockfile');
      expect(files['.github/workflows/ci.yml']).toContain('pnpm release:gate');
      expect(files['playwright.config.ts']).toContain('reuseExistingServer: false');
      expect(files['playwright.config.ts']).toContain('width: 1440');
      expect(files['playwright.config.ts']).toContain('width: 390');
      expect(files['tests/browser/primary.spec.ts']).toContain('toBeLessThanOrEqual(1)');
      expect(files['tests/browser/primary.spec.ts']).toContain("page.keyboard.press('Enter')");
      await expect(transformWithOxc(files['src/App.tsx'], 'external/App.tsx')).resolves.toHaveProperty('code');
    }
  });

  it('escapes arbitrary titles without injecting JSX or code', async () => {
    const files = generateExternalAppFiles({ name: 'custom-title', preset: 'portfolio-hub', frameworkCommit: pin, ...tools, title: '  "<& {world} \\ hello\nagain  ' });
    expect(files['src/App.tsx']).toContain('brand={"\\"<& {world} \\\\ hello\\nagain"}');
    await expect(transformWithOxc(files['src/App.tsx'], 'external/App.tsx')).resolves.toHaveProperty('code');
    expect(generateExternalAppFiles({ name: 'blank-title', preset: 'catalog', title: ' ', frameworkCommit: pin, ...tools })['README.md']).toContain('# blank-title');
  });

  it('rejects mutable refs, invalid pins and missing official tooling', () => {
    for (const frameworkCommit of ['main', 'ce8353e', '../escape', 'A'.repeat(40)]) {
      expect(() => generateExternalAppFiles({ name: 'bad-pin', preset: 'catalog', frameworkCommit, ...tools })).toThrow('exact');
    }
    for (const partial of [{ bootstrapSource: '' }, { releaseGateSource: '' }]) {
      expect(() => generateExternalAppFiles({ name: 'missing-tool', preset: 'catalog', frameworkCommit: pin, ...tools, ...partial })).toThrow('official');
    }
  });
});
