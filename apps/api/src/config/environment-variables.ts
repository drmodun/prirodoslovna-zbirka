import * as Joi from 'joi';

export interface EnvironmentVariables {
  DATABASE_URL: string;
  JWT_SECRET: string;
  WEB_URL: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_S3_BUCKET?: string;
  AWS_S3_URL?: string;
  AWS_REGION?: string;
  AWS_ENDPOINT_URL_S3?: string;
  AWS_S3_FORCE_PATH_STYLE?: string;
  SMTP_URL?: string;
  MAIL_FROM?: string;
  SENDGRID_API_KEY?: string;
  API_PUBLIC_URL?: string;
  UPLOAD_DIR?: string;
}

const optional = Joi.string().allow('').optional();

export const validationSchemaForEnv = Joi.object<EnvironmentVariables, true>({
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  WEB_URL: Joi.string().uri().default('http://localhost:3000'),
  AWS_ACCESS_KEY_ID: optional,
  AWS_SECRET_ACCESS_KEY: optional,
  AWS_S3_BUCKET: optional,
  AWS_S3_URL: optional,
  AWS_REGION: optional,
  AWS_ENDPOINT_URL_S3: optional,
  AWS_S3_FORCE_PATH_STYLE: Joi.string().valid('', 'true', 'false').optional(),
  SMTP_URL: optional,
  MAIL_FROM: optional,
  SENDGRID_API_KEY: optional,
  API_PUBLIC_URL: optional,
  UPLOAD_DIR: optional,
});
