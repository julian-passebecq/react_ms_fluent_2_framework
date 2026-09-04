import type { AppPreset, AppRecipe, Locale } from '@datapass/content';

export const APP_PRESETS = ['knowledge', 'learning', 'catalog', 'portfolio-hub'] as const satisfies readonly AppPreset[];

export type { AppPreset } from '@datapass/content';

export interface ScaffoldRecipe extends AppRecipe {
  description: string;
  workspacePackages: string[];
  locales: Locale[];
  editorPolicy: 'none' | 'lazy';
}

export interface GenerateAppOptions {
  name: string;
  preset: AppPreset;
  title?: string;
  description?: string;
}

export type GeneratedAppFiles = Readonly<Record<string, string>>;

const PRESET_PACKAGES: Record<AppPreset, string[]> = {
  knowledge: ['@datapass/content', '@datapass/knowledge', '@datapass/ui'],
  learning: ['@datapass/code', '@datapass/content', '@datapass/figure', '@datapass/learning', '@datapass/progress', '@datapass/ui'],
  catalog: ['@datapass/content', '@datapass/ui'],
  'portfolio-hub': ['@datapass/content', '@datapass/ui'],
};

const PRESET_ROUTES: Record<AppPreset, string[]> = {
  knowledge: ['/', '/knowledge'],
  learning: ['/', '/lesson', '/practice', '/progress'],
  catalog: ['/', '/catalog'],
  'portfolio-hub': ['/', '/projects'],
};

export function createAppRecipe(preset: AppPreset, name = `${preset}-app`): ScaffoldRecipe {
  const validatedName = validateAppName(name);
  const title = titleFromName(validatedName);
  const workspacePackages = [...PRESET_PACKAGES[preset]];
  return {
    id: `recipe.${slugify(validatedName)}`,
    name: validatedName,
    packageName: `@datapass/${validatedName}`,
    title: { en: title, no: title },
    preset,
    description: descriptionForPreset(preset),
    workspacePackages,
    locales: preset === 'learning' || preset === 'knowledge' ? ['en', 'no'] : ['en'],
    editorPolicy: preset === 'learning' ? 'lazy' : 'none',
    routes: [...PRESET_ROUTES[preset]],
    features: workspacePackages.map((packageName) => packageName.replace(/^@[^/]+\//, '')),
    includeEditor: preset === 'learning',
  };
}

export function generateAppFiles(options: GenerateAppOptions): GeneratedAppFiles {
  const name = validateAppName(options.name);
  const recipe = createAppRecipe(options.preset, name);
  const title = options.title?.trim() || titleFromName(name);
  const description = options.description?.trim() || recipe.description;
  const dependencies = Object.fromEntries([
    ...recipe.workspacePackages.map((packageName) => [packageName, 'workspace:*'] as const),
    ['@fluentui/react-components', '9.74.7'],
    ['@fluentui/react-icons', '2.0.339'],
    ['react', '19.2.8'],
    ['react-dom', '19.2.8'],
  ].sort(([left], [right]) => left.localeCompare(right)));

  const files: Record<string, string> = {
    'README.md': `# ${title}\n\nGenerated from the \`${recipe.preset}\` Datapass app recipe. Replace the placeholder copy with source-backed content; keep shared packages as the implementation boundary.\n`,
    'index.html': html(title, description),
    'package.json': `${JSON.stringify({
      name: `@datapass/${name}`,
      version: '2.0.0',
      private: true,
      type: 'module',
      scripts: {
        build: 'vite build',
        dev: 'vite',
        test: 'vitest run --environment node',
        typecheck: 'tsc --noEmit',
      },
      dependencies,
      devDependencies: {
        '@types/node': '24.10.1',
        '@types/react': '19.2.18',
        '@types/react-dom': '19.2.7',
        '@vitejs/plugin-react': '6.1.1',
        typescript: '7.0.2',
        vite: '8.2.2',
        vitest: '5.0.0',
      },
    }, null, 2)}\n`,
    'src/App.tsx': appSource(title, description, recipe),
    'src/main.tsx': mainSource(recipe),
    'src/styles.css': stylesSource(),
    'tests/app.smoke.test.tsx': appSmokeTestSource(),
    'tsconfig.json': `${JSON.stringify({
      extends: '../../tsconfig.base.json',
      compilerOptions: {
        composite: true,
        tsBuildInfoFile: `../../node_modules/.cache/${name}.tsbuildinfo`,
      },
      include: ['src', 'tests', 'vite.config.ts'],
    }, null, 2)}\n`,
    'vite.config.ts': viteSource(name),
  };

  return Object.fromEntries(Object.entries(files).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0));
}

export function validateAppName(value: string): string {
  const name = value.trim();
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name)) {
    throw new Error('App name must be a lowercase kebab-case package/directory name.');
  }
  if (name === 'studio' || name === 'legacy') throw new Error(`App name “${name}” is reserved.`);
  return name;
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function titleFromName(value: string): string {
  return value.split('-').map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`).join(' ');
}

function descriptionForPreset(preset: AppPreset): string {
  switch (preset) {
    case 'knowledge': return 'A source-aware knowledge application built from shared Datapass contracts.';
    case 'learning': return 'A course-first learning application with figures, practice and local progress.';
    case 'catalog': return 'A searchable, faceted catalog built from the canonical entity contracts.';
    case 'portfolio-hub': return 'A compact project registry and portfolio hub built from shared explorer primitives.';
  }
}

function html(title: string, description: string): string {
  return `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <meta name="description" content="${escapeHtml(description)}" />\n    <title>${escapeHtml(title)}</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>\n`;
}

function appSource(title: string, description: string, recipe: ScaffoldRecipe): string {
  const packageList = recipe.workspacePackages.map((name) => `'${name}'`).join(', ');
  return `import { Badge, Button } from '@fluentui/react-components';\nimport { AppShell, PageHeader, SideNav, TopBar } from '@datapass/ui';\n\nconst workspacePackages = [${packageList}];\n\nexport function App() {\n  return (\n    <AppShell\n      topBar={<TopBar brand="${escapeTsx(title)}" subtitle="${recipe.preset}" actions={<Badge appearance="outline">Generated recipe</Badge>} />}\n      sideNav={<SideNav title="Sections" label="Primary navigation"><Button appearance="subtle" aria-current="page">Overview</Button></SideNav>}\n      mainLabel="${escapeTsx(title)} workspace"\n      skipLinkLabel="Skip to content"\n    >\n      <div className="generated-page" data-app-preset="${recipe.preset}">\n        <PageHeader eyebrow="DATAPASS APP RECIPE" title="${escapeTsx(title)}" description="${escapeTsx(description)}" />\n        <section className="generated-surface" aria-labelledby="shared-boundary-title">\n          <h2 id="shared-boundary-title">Shared package boundary</h2>\n          <p>This app composes workspace packages. It does not copy renderer source.</p>\n          <code>{workspacePackages.join(' · ')}</code>\n        </section>\n      </div>\n    </AppShell>\n  );\n}\n`;
}

function mainSource(recipe: ScaffoldRecipe): string {
  const learningStyles = recipe.preset === 'learning' ? "import '@datapass/learning/styles.css';\n" : '';
  return `import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport { LocaleProvider } from '@datapass/ui';\nimport '@datapass/ui/styles.css';\n${learningStyles}import { App } from './App';\nimport './styles.css';\n\nconst root = document.getElementById('root');\nif (!root) throw new Error('Application root is missing.');\ncreateRoot(root).render(<React.StrictMode><LocaleProvider><App /></LocaleProvider></React.StrictMode>);\n`;
}

function appSmokeTestSource(): string {
  return `import { readFileSync } from 'node:fs';\nimport { fileURLToPath } from 'node:url';\nimport { renderToStaticMarkup } from 'react-dom/server';\nimport { describe, expect, it } from 'vitest';\n\nimport { App } from '../src/App';\n\nconst styles = readFileSync(fileURLToPath(new URL('../src/styles.css', import.meta.url)), 'utf8');\n\ndescribe('generated app baseline', () => {\n  it('renders one labelled main landmark with a working skip-link target', () => {\n    const markup = renderToStaticMarkup(<App />);\n    expect(markup.match(/<main(?:\\s|>)/g)).toHaveLength(1);\n    expect(markup).toContain('href="#datapass-main-content"');\n    expect(markup).toContain('id="datapass-main-content"');\n    expect(markup).toContain('<h1');\n    expect(markup).toContain('aria-label="Primary navigation"');\n  });\n\n  it('retains the phone-width and horizontal-overflow layout baseline', () => {\n    expect(styles).toMatch(/body\\s*\\{[^}]*min-width:\\s*320px/);\n    expect(styles).toMatch(/body\\s*\\{[^}]*overflow-x:\\s*hidden/);\n    expect(styles).toMatch(/\\*\\s*\\{[^}]*box-sizing:\\s*border-box/);\n  });\n});\n`;
}

function stylesSource(): string {
  return `:root { font-family: "Segoe UI Variable", "Segoe UI", system-ui, sans-serif; color: #162529; background: #f5f7f8; }\n* { box-sizing: border-box; }\nhtml, body, #root { min-height: 100%; margin: 0; }\nbody { min-width: 320px; overflow-x: hidden; }\n.generated-page { display: grid; gap: 18px; }\n.generated-surface { padding: 18px; border: 1px solid #d8e0e2; border-radius: 8px; background: #fff; }\n.generated-surface h2 { margin-top: 0; }\n.generated-surface code { overflow-wrap: anywhere; }\n`;
}

function viteSource(name: string): string {
  return `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nimport { fileURLToPath, URL } from 'node:url';\n\nexport default defineConfig({\n  root: fileURLToPath(new URL('.', import.meta.url)),\n  plugins: [react()],\n  base: './',\n  build: { outDir: '../../dist-${name}', emptyOutDir: true, target: 'es2022' },\n});\n`;
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function escapeTsx(value: string): string {
  // JSX quoted attributes use XML entities, not JavaScript backslash escapes.
  return escapeHtml(value).replaceAll('\n', ' ');
}
