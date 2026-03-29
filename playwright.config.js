import { defineConfig, devices } from '@playwright/test'

const E2E_HOST = '127.0.0.1'
const E2E_PORT = 4173

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://${E2E_HOST}:${E2E_PORT}`,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run build && npm run preview:e2e',
    url: `http://${E2E_HOST}:${E2E_PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
