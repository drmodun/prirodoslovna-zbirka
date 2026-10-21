import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';

export interface Filtering {
  property: string;
  rule: string;
  value: string;
}

// valid filter rules
export enum FilterRule {
  EQUALS = 'equals',
  SEARCH = 'search',
  CONTAINS = 'contains',
  NOT_EQUALS = 'not',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUALS = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUALS = 'lte',
  IN = 'in',
  NOT_IN = 'notIn',
  IS_NULL = 'isnull',
  STARTS_WITH = 'startsWith',
  HAS_EVERY = 'hasEvery',
}

export const FilteringParams = createParamDecorator(
  (data, ctx: ExecutionContext): Filtering => {
    const req: Request = ctx.switchToHttp().getRequest();
    const filter = req.query.filter as string;
    if (!filter) return null;

    // check if the valid params sent is an array
    if (typeof data != 'object')
      throw new BadRequestException('Invalid filter parameter');

    // property:rule:value, where `isnull` takes no value
    const match = filter.match(
      /^([a-zA-Z0-9_]+):([a-zA-Z]+)(?::([a-zA-Z0-9_,.-]+))?$/,
    );
    if (!match) throw new BadRequestException('Invalid filter parameter');

    const [, property, rule, value] = match;
    if (!data.includes(property))
      throw new BadRequestException(`Invalid filter property: ${property}`);
    if (!Object.values(FilterRule).includes(rule as FilterRule))
      throw new BadRequestException(`Invalid filter rule: ${rule}`);
    if ((rule === FilterRule.IS_NULL) === (value !== undefined))
      throw new BadRequestException('Invalid filter parameter');

    return { property, rule, value };
  },
);
