import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
    ignoreHTTPSErrors: true,
    viewport: { width: 390, height: 844 }, // typical mobile viewport
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'Chromium', use: { browserName: 'chromium' } },
  ],
});
