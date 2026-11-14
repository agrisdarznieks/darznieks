import { defineConfig, devices } from "@playwright/test";

const token = "local-e2e-token-not-for-vercel-01";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:3000",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "npm run start -- --port 3000",
    url: "http://127.0.0.1:3000/admin/login",
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...process.env,
      VERCEL: "",
      VERCEL_ENV: "",
      ADMIN_E2E: "1",
      ADMIN_E2E_TOKEN: token,
      ADMIN_E2E_FIXTURES: "1",
      ADMIN_GITHUB_LOGIN: "agrisdarznieks",
      AUTH_SECRET: "test-secret-for-local-e2e-only-32",
      AUTH_GITHUB_ID: "local-e2e-client",
      AUTH_GITHUB_SECRET: "local-e2e-secret",
    },
  },
});
