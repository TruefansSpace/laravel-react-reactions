import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/Browser',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:8000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
/*
  webServer: {
    command: 'php vendor/bin/testbench serve',
    url: 'http://127.0.0.1:8000',
    reuseExistingServer: !process.env.CI,
  },
*/
});
