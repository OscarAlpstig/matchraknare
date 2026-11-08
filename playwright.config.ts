import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  workers: 1,
  timeout: 60_000,
  use: { viewport: { width: 390, height: 844 } },
})
