import { defineConfig } from '@playwright/test';
import foundation from '../playwright.config';
/** Fast consumer iteration; authoritative QA still uses the complete root configuration. */
export default defineConfig({
  ...foundation,
  testDir: '../tests/browser',
  testMatch: 'v3-practice.spec.ts',
  outputDir: '../test-results/practice',
  reporter: [['line'], ['html', { outputFolder: 'test-results/practice-report', open: 'never' }]],
  webServer: Array.isArray(foundation.webServer) ? foundation.webServer.filter(server => /4176|4177/u.test(server.url ?? '')) : [],
});
