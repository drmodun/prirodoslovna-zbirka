// Runs in every test worker before any application module is imported
// (auth.module reads JWT_SECRET at import time).
export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:55432/biosfera_test';

// The application registers PrismaService in ~20 modules, i.e. ~20 separate
// PrismaClient instances with their own pools. Keep each pool tiny so a whole
// test application stays far below Postgres' connection limit.
process.env.DATABASE_URL = `${TEST_DATABASE_URL}${
  TEST_DATABASE_URL.includes('?') ? '&' : '?'
}connection_limit=2`;
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

// UPLOAD_DIR is created (and removed) by global-setup.ts.
process.env.API_PUBLIC_URL = 'http://api.test';
