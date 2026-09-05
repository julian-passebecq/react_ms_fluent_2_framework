import { generateAppFiles, type GenerateAppOptions, type GeneratedAppFiles } from './index.js';

export interface ExternalAppOptions extends GenerateAppOptions {
  frameworkCommit: string;
  /** Authoritative Node-only tools, supplied verbatim by scaffold-app.ts. */
  bootstrapSource: string;
  releaseGateSource: string;
}

/** Standalone repository composition; the internal scaffold output remains unchanged. */
export function generateExternalAppFiles(options: ExternalAppOptions): GeneratedAppFiles {
  if (!/^[a-f0-9]{40}$/.test(options.frameworkCommit)) throw new Error('External scaffolds require an exact 40-character framework commit.');
  if (!options.bootstrapSource.trim() || !options.releaseGateSource.trim()) throw new Error('External scaffolds require the official bootstrap and release tools.');
  const title = options.title?.trim() || options.name;
  const files = { ...generateAppFiles(options) };
  const manifest = JSON.parse(files['package.json']);
  manifest.version = '1.0.0';
  manifest.packageManager = 'pnpm@11.19.0';
  manifest.engines = { node: '>=22.12.0' };
  manifest.dependencies['@datapass/canonical'] = 'workspace:*';
  manifest.devDependencies = {
    ...manifest.devDependencies,
    '@axe-core/playwright': '4.13.0', '@playwright/test': '1.62.1', tsx: '4.23.13',
  };
  manifest.scripts = {
    'framework:bootstrap': 'node --experimental-strip-types scripts/bootstrap-framework.ts',
    'framework:verify': 'node --experimental-strip-types scripts/bootstrap-framework.ts --verify',
    dev: 'vite',
    typecheck: 'tsc --noEmit',
    'validate:content': 'tsx scripts/validate-content.ts',
    'test:unit': 'vitest run',
    test: 'pnpm test:unit',
    build: 'vite build',
    preview: 'vite preview --host 127.0.0.1 --port 4185 --strictPort',
    'test:browser': 'playwright test',
    'release:gate': 'node --experimental-strip-types scripts/consumer-release-gate.ts',
  };
  files['package.json'] = json(manifest);
  files['datapass.json'] = json({ version: 1, repository: 'https://github.com/julian-passebecq/react_ms_fluent_2_framework.git', commit: options.frameworkCommit });
  files['pnpm-workspace.yaml'] = 'packages:\n  - "vendor/datapass-platform/project/conceptmotion_studio/packages/*"\n  - "vendor/datapass-platform/project/conceptmotion_studio/content"\n\nallowBuilds:\n  esbuild: true\n';
  files['.gitignore'] = 'node_modules/\nvendor/\ndist/\nplaywright-report/\ntest-results/\n*.tsbuildinfo\n';
  files['.node-version'] = '24.19.0\n';
  files['scripts/bootstrap-framework.ts'] = options.bootstrapSource;
  files['scripts/consumer-release-gate.ts'] = options.releaseGateSource;
  files['tsconfig.json'] = json({
    compilerOptions: {
      target: 'ES2022', lib: ['ES2022', 'DOM', 'DOM.Iterable'], module: 'ESNext', moduleResolution: 'Bundler',
      jsx: 'react-jsx', strict: true, noEmit: true, skipLibCheck: true,
      esModuleInterop: true, resolveJsonModule: true, allowImportingTsExtensions: true,
      types: ['node', 'vite/client'],
    },
    include: ['src', 'tests', 'scripts', '*.config.ts'],
  });
  files['vite.config.ts'] = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()], base: './', build: { outDir: 'dist', target: 'es2022', sourcemap: true } });
`;
  files['vitest.config.ts'] = `import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'node', include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'] } });
`;
  files['playwright.config.ts'] = playwrightConfig;
  files['tests/browser/primary.spec.ts'] = browserSmoke;
  files['scripts/validate-content.ts'] = `import assert from 'node:assert/strict';
import { validateContentCatalog, validateProjectRecord } from '@datapass/content';
import { projectRegistry } from '@datapass/canonical/projects';
import { content } from '../src/content';
assert.equal(validateContentCatalog(content).valid, true, 'Invalid local content');
for (const project of projectRegistry) assert.equal(validateProjectRecord(project).valid, true, project.id);
console.log('Local content and canonical public projects validate. Extend this script for your authored specs using the existing runtime validators.');
`;
  files['src/content.ts'] = `import type { ContentCatalog } from '@datapass/content';
export const content: ContentCatalog = { version: '2', projects: [] };
`;
  files['src/App.tsx'] = `import { useState } from 'react';
import { Button } from '@fluentui/react-components';
import { AppShell, PageHeader, SideNav, TopBar } from '@datapass/ui';
import { projectRegistry } from '@datapass/canonical/projects';

export function App() {
  const [exploring, setExploring] = useState(false);
  return <AppShell topBar={<TopBar brand={${JSON.stringify(title)}} />}
    sideNav={<SideNav title="Sections" label="Primary navigation"><Button onClick={() => setExploring(false)}>Overview</Button></SideNav>}
    mainLabel="Project overview" skipLinkLabel="Skip to content">
    <div className="generated-page">
      <PageHeader title={${JSON.stringify(title)}} description="Explore projects and choose where to start." />
      <section className="generated-surface" aria-label="Explore projects">
        <Button appearance="primary" onClick={() => setExploring(true)}>Explore</Button>
        {exploring && <div><h2>Projects</h2><ul>{projectRegistry.map(project => <li key={project.id}>{project.title}</li>)}</ul></div>}
      </section>
    </div>
  </AppShell>;
}
`;
  files['README.md'] = `# ${title}

Standalone Datapass ${options.preset} starter. Replace starter content and extend the primary-flow test for your product.

Use Node 24.19.0 (CI pin; framework minimum 22.12.0), pnpm 11.19.0 and Git. From this repository:

1. Run \`pnpm framework:bootstrap\` **before** installing dependencies.
2. Run \`pnpm install\` once to create this repository's own \`pnpm-lock.yaml\`. Commit the lockfile, \`datapass.json\` and generated sources. Do not commit vendor or node_modules.
3. Install Chrome with \`pnpm exec playwright install chrome\` (Linux CI uses \`--with-deps\`).
4. Run \`pnpm release:gate\`. It verifies the exact pin and source bytes, installs frozen, typechecks, validates content, runs local tests, builds, and checks the production preview at 1440px/390px with Axe, overflow and keyboard assertions.

Fresh checkout: \`pnpm framework:bootstrap\`, then \`pnpm install --frozen-lockfile\`. The gate refuses a missing lockfile. No framework install or node_modules symlink is needed. Source packages are private source exports, consumed by Vite/TypeScript/tsx, not plain Node JavaScript packages.

Pin upgrades: retain your existing vendor directory until its old pin verifies; move that generated directory outside the repository, change \`datapass.json\` to the new exact commit, bootstrap, run \`pnpm install\`, review the lockfile delta and run the gate. Never edit vendored framework source.

Supported read-only data: \`@datapass/canonical/projects\`, \`/practice\`, \`/visuals\`, \`/visual-availability\`. Import availability separately to keep catalogs free of compiled scene data. Keep source attribution, private overlays device-local, and use the existing semantic validators for new Figures/workflows/diagrams. Local content validation is an explicit application responsibility; the starter only validates its current content.

The generated GitHub Actions workflow runs the real bundle. Compatibility presenters, proxies and static mirrors cannot certify this release.
`;
  files['.github/workflows/ci.yml'] = consumerWorkflow;
  return Object.fromEntries(Object.entries(files).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0));
}

function json(value: unknown): string { return `${JSON.stringify(value, null, 2)}\n`; }

const playwrightConfig = `import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', workers: 1, retries: 0, timeout: 45_000,
  reporter: [['line'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:4185', channel: 'chrome', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: { command: 'pnpm preview', url: 'http://127.0.0.1:4185', reuseExistingServer: false, timeout: 60_000 },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'phone', use: { viewport: { width: 390, height: 844 }, hasTouch: true } },
  ],
});
`;

const browserSmoke = `import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => page.emulateMedia({ reducedMotion: 'reduce' }));

test('primary flow in the production bundle', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  async function audit() {
    // Match V4's existing narrow exception for Fluent/Tabster focus sentinels.
    const results = await new AxeBuilder({ page }).exclude('[data-tabster-dummy]').analyze();
    expect(results.violations.filter(item => item.impact === 'serious' || item.impact === 'critical')).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  }
  await audit();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Explore', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
  await audit();
});
`;

const consumerWorkflow = `name: Consumer release
on: [push, pull_request]
permissions:
  contents: read
jobs:
  release:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 11.19.0
      - uses: actions/setup-node@v4
        with:
          node-version: 24.19.0
          cache: pnpm
          cache-dependency-path: pnpm-lock.yaml
      - run: pnpm framework:bootstrap
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chrome
      - run: pnpm release:gate
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: consumer-browser-evidence
          path: |
            playwright-report
            test-results
`;
