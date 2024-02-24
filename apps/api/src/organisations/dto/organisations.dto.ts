import { getCreateOrganisationDto } from '@biosfera/types';
import { ApiProperty } from '@nestjs/swagger';

export const _createOrganisationDto = getCreateOrganisationDto(ApiProperty);
export const _updateOrganisationDto = getCreateOrganisationDto(ApiProperty);

export class CreateOrganisationDto extends _createOrganisationDto {}
export class UpdateOrganisationDto extends _updateOrganisationDto {}
