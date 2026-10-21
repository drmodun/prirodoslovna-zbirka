import { validationSchemaForEnv } from './environment-variables';

describe('validationSchemaForEnv', () => {
  const base = { DATABASE_URL: 'postgres://x', JWT_SECRET: 's' };

  it('accepts the minimal required env and defaults WEB_URL', () => {
    const { error, value } = validationSchemaForEnv.validate(base);
    expect(error).toBeUndefined();
    expect(value.WEB_URL).toBe('http://localhost:3000');
  });

  it.each(['DATABASE_URL', 'JWT_SECRET'])('requires %s', (key) => {
    const env = { ...base };
    delete env[key];
    expect(validationSchemaForEnv.validate(env).error?.message).toContain(key);
  });

  it('requires WEB_URL to be a URI when given', () => {
    expect(
      validationSchemaForEnv.validate({ ...base, WEB_URL: 'nope' }).error,
    ).toBeDefined();
  });

  it('accepts empty strings for optional provider settings', () => {
    const { error } = validationSchemaForEnv.validate({
      ...base,
      SMTP_URL: '',
      SENDGRID_API_KEY: '',
      AWS_S3_BUCKET: '',
    });
    expect(error).toBeUndefined();
  });

  it('only allows true/false/empty for AWS_S3_FORCE_PATH_STYLE', () => {
    for (const v of ['', 'true', 'false'])
      expect(
        validationSchemaForEnv.validate({ ...base, AWS_S3_FORCE_PATH_STYLE: v })
          .error,
      ).toBeUndefined();
    expect(
      validationSchemaForEnv.validate({
        ...base,
        AWS_S3_FORCE_PATH_STYLE: 'yes',
      }).error,
    ).toBeDefined();
  });
});
