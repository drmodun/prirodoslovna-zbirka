import { getCreateExponatDto, getExponatQuery } from '@biosfera/types';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Exponat } from '@prisma/client';

export const _createExponatDto = getCreateExponatDto(ApiProperty);
export const _ExponatQuery = getExponatQuery(ApiProperty);

export class CreateExponatDto extends _createExponatDto {}
export class UpdateExponatDto extends PartialType(CreateExponatDto) {}
export class ExponatQuery extends PartialType(_ExponatQuery) {}

export type ExponatSQL = Exponat & {
  organisationName: string;
  amountOfFavourites?: number | string;
  amountOfPosts?: number | string;
};
