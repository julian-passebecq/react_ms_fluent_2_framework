import { describe, expect, it } from 'vitest';
import { transformWithOxc } from 'vite';

import { APP_PRESETS, createAppRecipe, generateAppFiles, validateAppName } from '../src/index.js';

describe('Datapass app recipes', () => {
  it('exposes exactly the approved deterministic presets', () => {
    expect(APP_PRESETS).toEqual(['knowledge', 'learning', 'catalog', 'portfolio-hub']);
    expect(createAppRecipe('learning', 'dubreu-formation')).toMatchObject({
      id: 'recipe.dubreu-formation',
      name: 'dubreu-formation',
      packageName: '@datapass/dubreu-formation',
      routes: ['/', '/lesson', '/practice', '/progress'],
      includeEditor: true,
      editorPolicy: 'lazy',
      workspacePackages: expect.arrayContaining(['@datapass/code', '@datapass/content', '@datapass/figure', '@datapass/learning']),
    });
  });

  it('generates every preset deterministically by composing packages rather than renderer source', () => {
    for (const preset of APP_PRESETS) {
      const name = `generated-${preset}-proof`;
      const first = generateAppFiles({ name, preset });
      const second = generateAppFiles({ name, preset });
      expect(first).toEqual(second);
      expect(Object.keys(first)).toEqual([...Object.keys(first)].sort());
      expect(JSON.parse(first['package.json']).dependencies['@datapass/ui']).toBe('workspace:*');
      expect(first['vite.config.ts']).toContain('root: fileURLToPath');
      expect(first['src/App.tsx']).toContain("from '@datapass/ui'");
      expect(first['src/App.tsx']).not.toContain('<main');
      expect(Object.values(first).join('\n')).not.toMatch(/packages\/(?:svg|core)\/src|from ['"]@conceptmotion\/svg/);
    }
  });

  it('includes runnable accessibility/layout smoke checks and learning styles only for learning', () => {
    const learning = generateAppFiles({ name: 'learning-proof', preset: 'learning' });
    const catalog = generateAppFiles({ name: 'catalog-proof', preset: 'catalog' });
    const learningManifest = JSON.parse(learning['package.json']);

    expect(learningManifest.dependencies['@datapass/learning']).toBe('workspace:*');
    expect(learningManifest.scripts.test).toBe('vitest run --environment node');
    expect(learningManifest.devDependencies.vitest).toBe('5.0.0');
    expect(learning['src/main.tsx']).toContain("import '@datapass/learning/styles.css';");
    expect(catalog['src/main.tsx']).not.toContain('@datapass/learning');
    expect(learning['tests/app.smoke.test.tsx']).toContain('renders one labelled main landmark');
    expect(learning['tests/app.smoke.test.tsx']).toContain('horizontal-overflow layout baseline');
    expect(JSON.parse(learning['tsconfig.json']).include).toContain('tests');
  });

  it('rejects traversal, reserved directories and unstable names', () => {
    for (const name of ['../escape', 'Title Case', 'studio', '-broken']) {
      expect(() => validateAppName(name)).toThrow();
    }
  });

  it('escapes custom quoted titles as JSX entities and compiles the generated source', async () => {
    const files = generateAppFiles({
      name: 'quoted-title-proof', preset: 'catalog', title: 'Say "hello" & <learn>',
      description: 'A "quoted" description with a \\ path\nand a second line.',
    });
    expect(files['src/App.tsx']).toContain('brand="Say &quot;hello&quot; &amp; &lt;learn&gt;"');
    expect(files['index.html']).toContain('<title>Say &quot;hello&quot; &amp; &lt;learn&gt;</title>');
    await expect(transformWithOxc(files['src/App.tsx'], 'generated/App.tsx')).resolves.toHaveProperty('code');
  });
});
