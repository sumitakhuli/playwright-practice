import { defineConfig, devices } from '@playwright/test';
export const STORAGE_STATE = "./auth/user.json";

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'https://neeto-form-web-playwright.neetodeployapp.com',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: "login",
      use: { ...devices["Desktop Chrome"] },
      testMatch: "login.setup.ts"
    },
    {
      name: "Logged In tests",
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
      dependencies: ["login"],
      teardown: "teardown",
      testMatch: "**/*.spec.ts",
      testIgnore: ["**/login.setup.ts", "**/uploadFile.spec.ts"],
    },
    {
      name: "Common Tests",
      use: { ...devices["Desktop Chrome"] },
      testMatch: "**/uploadFile.spec.ts",
    },
    {
      name: "teardown",
      use: { ...devices["Desktop Chrome"] },
      testMatch: "**/global.teardown.ts",
    },
  ],
});
