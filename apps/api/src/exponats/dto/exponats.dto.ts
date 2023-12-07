import { getCreateExponatDto } from '@biosfera/types';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export const _createExponatDto = getCreateExponatDto(ApiProperty);

export class CreateExponatDto extends _createExponatDto {}
export class UpdateExponatDto extends PartialType(CreateExponatDto) {}
