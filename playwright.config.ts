import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 8_000,
  },
  reporter: isCI
    ? [
        ['github'],
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
      ]
    : [
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
      ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    launchOptions: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: {
    command: isCI ? 'bun run preview -- --port 3000 --host 0.0.0.0' : 'bun run dev',
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
