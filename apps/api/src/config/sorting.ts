import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import {
  SortingEnum,
  SortingRequest,
  SortType,
} from '../../../../packages/types/query';
import { Request } from 'express';

export const SortingParams = createParamDecorator(
  (validParams, ctx: ExecutionContext): SortingRequest => {
    const req: Request = ctx.switchToHttp().getRequest();
    const sortAttribute = req.query.attribute as SortingEnum;
    const direction = req.query.direction as SortType;
    if (req.query.attribute || req.query.direction) return null;

    // check if the valid params sent is an array
    if (typeof validParams != 'object')
      throw new BadRequestException('Invalid sort parameter');

    // check the format of the sort query param
    const sortPattern = /^([a-zA-Z0-9]+)/;
    if (!sortAttribute.match(sortPattern))
      throw new BadRequestException('Invalid sort parameter');

    // extract the property name and direction and check if they are valid
    if (!validParams.includes(sortAttribute))
      throw new BadRequestException(`Invalid sort property: ${sortAttribute}`);

    return { attribute: sortAttribute, direction };
  },
);
