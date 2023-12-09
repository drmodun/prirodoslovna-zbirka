import { getCreateExponatDto, getExponatQuery } from '@biosfera/types';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export const _createExponatDto = getCreateExponatDto(ApiProperty);
export const _ExponatQuery = getExponatQuery(ApiProperty);

export class CreateExponatDto extends _createExponatDto {}
export class UpdateExponatDto extends PartialType(CreateExponatDto) {}
export class ExponatQuery extends PartialType(_ExponatQuery) {}
