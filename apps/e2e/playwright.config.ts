import { defineConfig, devices } from "@playwright/test";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  API_PORT,
  API_URL,
  DATABASE_URL,
  JWT_SECRET,
  WEB_PORT,
  WEB_URL,
  assertSafeDatabase,
} from "./support/env";

assertSafeDatabase();

const uploads = join(tmpdir(), `biosfera-e2e-uploads-${process.pid}`);

export default defineConfig({
  testDir: "./tests",
  // Every test starts from an empty database, so they cannot run in parallel.
  workers: 1,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never" }], ["github"]]
    : [["list"]],
  globalSetup: "./support/global-setup.ts",
  use: {
    baseURL: WEB_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    locale: "hr-HR",
    // Optional: drive a browser that runs elsewhere (e.g. the Playwright
    // Docker image) when the host lacks Chromium's system libraries.
    // See TESTING.md.
    ...(process.env.PW_WS_ENDPOINT && {
      connectOptions: { wsEndpoint: process.env.PW_WS_ENDPOINT },
    }),
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Never reuse a server that is already running: that could be the dev stack.
  webServer: [
    {
      name: "api",
      command: "sh -c 'npx prisma migrate deploy && node dist/main'",
      cwd: "../api",
      url: `${API_URL}/`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        PORT: String(API_PORT),
        DATABASE_URL,
        JWT_SECRET,
        WEB_URL,
        API_PUBLIC_URL: API_URL,
        UPLOAD_DIR: uploads,
        NODE_ENV: "production",
      },
    },
    {
      name: "web",
      command: `npx next start -p ${WEB_PORT}`,
      cwd: "../web",
      url: WEB_URL,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        NEXT_TELEMETRY_DISABLED: "1",
      },
    },
  ],
});
