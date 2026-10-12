// Runs in every test worker before any application module is imported
// (auth.module reads JWT_SECRET at import time).
export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:55432/biosfera_test';

process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.JWT_SECRET = 'integration-test-secret';
process.env.WEB_URL = 'http://web.test';
delete process.env.SMTP_URL;
delete process.env.SENDGRID_API_KEY;
for (const key of [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_S3_BUCKET',
  'AWS_ENDPOINT_URL_S3',
  'AWS_S3_URL',
])
  delete process.env[key];

import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// Files uploaded by the tests go to a throw-away directory, never to S3.
process.env.UPLOAD_DIR ??= mkdtempSync(join(tmpdir(), 'biosfera-int-'));
process.env.API_PUBLIC_URL = 'http://api.test';
