import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { translateErrorMessage } from './error-messages';
import { requestLanguage } from './request-language';

// Error messages reach users in the web app's pop-ups, so they are answered in
// the language the request asked for.
@Catch(HttpException)
export class LocalisedExceptionFilter extends BaseExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const language = requestLanguage(request?.headers?.['accept-language']);
    const body = exception.getResponse();

    if (language === 'EN' || typeof body !== 'object' || body === null)
      return super.catch(exception, host);

    const translate = (message: unknown) =>
      typeof message === 'string'
        ? translateErrorMessage(message, language)
        : message;
    const { message, error } = body as { message?: unknown; error?: unknown };

    http
      .getResponse<Response>()
      .status(exception.getStatus())
      .json({
        ...body,
        ...(message !== undefined && {
          message: Array.isArray(message)
            ? message.map(translate)
            : translate(message),
        }),
        ...(error !== undefined && { error: translate(error) }),
      });
  }
}
