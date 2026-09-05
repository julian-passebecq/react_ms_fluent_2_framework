import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['packages/**/*.test.ts', 'packages/**/*.test.tsx', 'apps/**/*.test.ts', 'apps/**/*.test.tsx', 'content/**/*.test.ts', 'scripts/check-*.test.mjs', 'tests/visuals/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      // Report pure runtime packages. UI confidence remains in component and
      // browser tests, not an aggregate inflated by render-only lines.
      include: ['core', 'knowledge', 'content', 'notebook-import', 'progress', 'scaffold']
        .map((name) => `packages/${name}/src/**/*.ts`),
      exclude: ['**/*.test.ts', '**/*.test.tsx']
    }
  }
});
