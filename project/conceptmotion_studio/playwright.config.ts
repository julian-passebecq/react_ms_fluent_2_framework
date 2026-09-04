import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  outputDir: './test-results/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['line'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    channel: 'chrome',
    colorScheme: 'light',
    locale: 'en-US',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  webServer: [
    {
      command: 'pnpm run dev',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'pnpm run dev:consumer',
      url: 'http://127.0.0.1:4175',
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: 'desktop-chrome',
      use: { viewport: { width: 1440, height: 1000 } },
    },
    {
      name: 'phone-chrome',
      // Exercise the real 390 CSS-pixel breakpoint in desktop Chrome. Enabling
      // mobile-device emulation with a desktop Chrome channel can expose a
      // wider layout viewport despite the configured screenshot dimensions.
      use: { viewport: { width: 390, height: 844 }, hasTouch: true },
    },
  ],
});
