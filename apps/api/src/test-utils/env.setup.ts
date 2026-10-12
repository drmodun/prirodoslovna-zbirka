// Runs before every test file: deterministic environment for modules that read
// process.env at import time (auth.module's jwtSecret, EmailService, ...).
process.env.JWT_SECRET = 'unit-test-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.WEB_URL = 'http://localhost:3000';
delete process.env.SMTP_URL;
delete process.env.SENDGRID_API_KEY;
