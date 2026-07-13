import { defineConfig } from "@playwright/test";

/**
 * E2E smoke tests against a production build. `npm run build` first, or let
 * the webServer command below do it (CI does exactly this).
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  use: {
    baseURL: "http://127.0.0.1:3100",
  },
  webServer: {
    command: "npm run build && npm run start -- --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
