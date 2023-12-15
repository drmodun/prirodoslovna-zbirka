import {
  getCreateCategorizationDto,
  getCategorizationQuery,
} from '@biosfera/types';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export const _createCategorizationDto = getCreateCategorizationDto(ApiProperty);
export const _CategorizationQuery = getCategorizationQuery(ApiProperty);

export class CreateCategorizationDto extends _createCategorizationDto {}
export class UpdateCategorizationDto extends PartialType(
  CreateCategorizationDto,
) {}
export class CategorizationQuery extends PartialType(_CategorizationQuery) {}
