import { getCreateWorkDto, getWorkQuery } from '../../../types/src';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export const _createWorkDto = getCreateWorkDto(ApiProperty);
export class CreateWorkDto extends _createWorkDto {}
export class UpdateWorkDto extends PartialType(CreateWorkDto) {}

export const _WorkQuery = getWorkQuery(ApiProperty);
export class WorkQuery extends PartialType(_WorkQuery) {}
