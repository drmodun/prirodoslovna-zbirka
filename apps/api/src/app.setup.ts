import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { HttpAdapterHost, Reflector } from '@nestjs/core';
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter';
import { LocalisedExceptionFilter } from './i18n/localised-exception.filter';

// Shared by main.ts and the integration tests.
export const configureApp = (app: INestApplication) => {
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new LocalisedExceptionFilter(httpAdapter),
    new PrismaClientExceptionFilter(httpAdapter),
  );
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
};
