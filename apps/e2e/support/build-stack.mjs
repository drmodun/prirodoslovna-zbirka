// Builds the API and the web app the way the end-to-end suite runs them.
// The web build bakes in the API and files addresses, so it has to happen with
// the e2e ports.
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const apiPort = process.env.E2E_API_PORT ?? 5610;
const webPort = process.env.E2E_WEB_PORT ?? 3110;

execSync("npx turbo run build --filter=api --filter=web", {
  cwd: root,
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_PUBLIC_API_URL: `http://localhost:${apiPort}`,
    NEXT_PUBLIC_FILES_URL: `http://localhost:${apiPort}/blobs/file`,
    WEB_URL: `http://localhost:${webPort}`,
    FILES_FALLBACK: "local",
    NEXT_TELEMETRY_DISABLED: "1",
  },
});
