import { execSync } from 'child_process';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

/**
 * Applies the real migrations to the test database once per run.
 *
 * Safety: the suite truncates every table between tests, so it refuses to run
 * against anything whose database name does not end in `_test`.
 */
export default async function globalSetup() {
  const url =
    process.env.TEST_DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:55432/biosfera_test';

  const database = new URL(url).pathname.replace(/^\//, '');
  if (!database.endsWith('_test')) {
    throw new Error(
      `Refusing to run integration tests against "${database}": the database name must end with "_test".`,
    );
  }

  try {
    execSync('npx prisma migrate deploy', {
      cwd: join(__dirname, '..'),
      env: { ...process.env, DATABASE_URL: url },
      stdio: 'pipe',
    });
  } catch (error) {
    const out = String((error as { stderr?: Buffer }).stderr ?? error);
    throw new Error(
      `Could not migrate the test database at ${url}.\n` +
        `Start it with "yarn test:integration:db" (needs Docker) or set TEST_DATABASE_URL.\n${out}`,
    );
  }

  // Uploaded files go to a throw-away directory that is removed afterwards.
  const uploads = mkdtempSync(join(tmpdir(), 'biosfera-int-'));
  process.env.UPLOAD_DIR = uploads;
}
