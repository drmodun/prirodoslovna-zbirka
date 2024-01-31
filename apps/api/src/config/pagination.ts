import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { PaginationRequest } from '@biosfera/types';
import { Request } from 'express';

export const PaginationParams = createParamDecorator(
  (data, ctx: ExecutionContext): PaginationRequest => {
    const req: Request = ctx.switchToHttp().getRequest();
    const page = parseInt(req.query.page as string);
    const size = parseInt(req.query.size as string);

    if (!page || !size) {
      return { page: 1, size: 10 };
    }
    // check if page and size are valid
    if (isNaN(page) || page <= 0 || isNaN(size) || size < 0) {
      throw new BadRequestException('Invalid pagination params');
    }
    // do not allow to fetch large slices of the dataset
    if (size > 100) {
      throw new BadRequestException(
        'Invalid pagination params: Max size is 100',
      );
    }

    return { page, size };
  },
);
