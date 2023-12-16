import { getCreateSocialPostDto, getSocialPostQuery } from '@biosfera/types';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export const _createSocialPostDto = getCreateSocialPostDto(ApiProperty);
export class CreateSocialPostDto extends _createSocialPostDto {}
export class UpdateSocialPostDto extends PartialType(CreateSocialPostDto) {}

export const _socialPostQuery = getSocialPostQuery(ApiProperty);
export class SocialPostQuery extends _socialPostQuery {}
