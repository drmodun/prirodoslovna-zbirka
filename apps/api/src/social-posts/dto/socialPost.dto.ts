import { getCreateSocialPostDto } from '@biosfera/types';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export const _createSocialPostDto = getCreateSocialPostDto(ApiProperty);
export class CreateSocialPostDto extends _createSocialPostDto {}
export class UpdateSocialPostDto extends PartialType(CreateSocialPostDto) {}
