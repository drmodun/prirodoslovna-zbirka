import { getCreateOrganisationDto } from '@biosfera/types';
import { ApiProperty } from '@nestjs/swagger';
import { Organisation } from '@prisma/client';

export const _createOrganisationDto = getCreateOrganisationDto(ApiProperty);
export const _updateOrganisationDto = getCreateOrganisationDto(ApiProperty);

export class CreateOrganisationDto extends _createOrganisationDto {}
export class UpdateOrganisationDto extends _updateOrganisationDto {}

export type OrganisationSQL = Organisation & {
  totalPosts?: number;
  amountOfExponats?: number;
  amountOfMembers?: number;
  totalFavourites?: any;
  amountOfFollowers?: number;
};
