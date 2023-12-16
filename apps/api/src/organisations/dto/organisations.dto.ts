import { getCreateOrganisationDto, getSocialPostQuery } from '@biosfera/types';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export const _createOrganisationDto = getCreateOrganisationDto(ApiProperty);

export class CreateOrganisationDto extends _createOrganisationDto {}
export class UpdateOrganisationDto extends PartialType(CreateOrganisationDto) {}

export const _socialPostQuery = getSocialPostQuery(ApiProperty);
export class SocialPostQuery extends _socialPostQuery {}
