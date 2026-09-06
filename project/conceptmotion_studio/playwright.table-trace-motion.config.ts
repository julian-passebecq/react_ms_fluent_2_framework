import { defineConfig } from '@playwright/test';

/** Targeted branch gate: Table Trace Motion only needs the Studio application. */
export default defineConfig({
  testDir: './tests/browser',
  outputDir: './test-results/table-trace-motion',
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['line']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    channel: 'chrome',
    colorScheme: 'light',
    locale: 'en-US',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  webServer: {
    command: 'pnpm run dev',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: { viewport: { width: 1440, height: 1000 } },
    },
    {
      name: 'phone-chrome',
      use: { viewport: { width: 390, height: 844 }, hasTouch: true },
    },
  ],
});
