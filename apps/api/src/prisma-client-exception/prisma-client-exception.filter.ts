//src/prisma-client-exception.filter.ts

import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { translateErrorMessage } from 'src/i18n/error-messages';
import { requestLanguage } from 'src/i18n/request-language';

// Prisma's own messages name tables, queries and code locations, so users get
// a fixed message in their language instead; the original is only logged.
const RESPONSES: Record<string, { status: HttpStatus; message: string }> = {
  P2002: { status: HttpStatus.CONFLICT, message: 'Already exists' },
  P2025: { status: HttpStatus.NOT_FOUND, message: 'Not Found' },
  P2003: {
    status: HttpStatus.BAD_REQUEST,
    message: 'A related record does not exist',
  },
  P2016: { status: HttpStatus.BAD_REQUEST, message: 'Bad Request' },
  P2017: {
    status: HttpStatus.BAD_REQUEST,
    message: 'The records are not connected',
  },
  P1008: {
    status: HttpStatus.REQUEST_TIMEOUT,
    message: 'The database did not respond in time',
  },
  P1009: {
    status: HttpStatus.REQUEST_TIMEOUT,
    message: 'The database did not respond in time',
  },
  P1011: {
    status: HttpStatus.REQUEST_TIMEOUT,
    message: 'The database did not respond in time',
  },
};

// The fields of a unique constraint, e.g. ['email'] -> "Already exists: email".
const uniqueFields = (exception: Prisma.PrismaClientKnownRequestError) => {
  const target = exception.meta?.target;
  if (Array.isArray(target)) return target.join(', ');
  return typeof target === 'string' ? target : undefined;
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    console.error(exception.message);
    const known = RESPONSES[exception.code];
    if (!known) {
      // default 500 error code
      console.error(exception);
      return super.catch(exception, host);
    }

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const language = requestLanguage(request?.headers?.['accept-language']);
    const fields = exception.code === 'P2002' && uniqueFields(exception);
    const message = fields ? `${known.message}: ${fields}` : known.message;

    ctx
      .getResponse<Response>()
      .status(known.status)
      .json({
        statusCode: known.status,
        message: translateErrorMessage(message, language),
      });
  }
}
