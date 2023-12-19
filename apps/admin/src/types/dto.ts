import {
  getCategorizationQuery,
  getCreateCategorizationDto,
  getCreateExponatDto,
  getCreateOrganisationDto,
  getCreateSocialPostDto,
  getExponatQuery,
  getOrganisationQuery,
  getRegisterUserDto,
  getSocialPostQuery,
  getUserQuery,
} from '@biosfera/types';
import { PartialType } from '@nestjs/swagger';

export const _createOrganisationDto = getCreateOrganisationDto();

export class CreateOrganisationDto extends _createOrganisationDto {}
export class UpdateOrganisationDto extends PartialType(CreateOrganisationDto) {}
export const _organisationQuery = getOrganisationQuery();
export class OrganisationQuery extends PartialType(_organisationQuery) {}

//TODO: Manually make this in dto project, dont need this package in admin project

export const _createSocialPostDto = getCreateSocialPostDto();
export class CreateSocialPostDto extends _createSocialPostDto {}
export class UpdateSocialPostDto extends PartialType(CreateSocialPostDto) {}

export const _socialPostQuery = getSocialPostQuery();
export class SocialPostQuery extends PartialType(_socialPostQuery) {}

export const _createExponatDto = getCreateExponatDto();
export const _ExponatQuery = getExponatQuery();

export class CreateExponatDto extends _createExponatDto {}
export class UpdateExponatDto extends PartialType(CreateExponatDto) {}
export class ExponatQuery extends PartialType(_ExponatQuery) {}

export const _registerUserDto = getRegisterUserDto();

export class RegisterUserDto extends _registerUserDto {}
export class UpdateUserDto extends PartialType(RegisterUserDto) {}
export const _userQuery = getUserQuery();
export class UserQuery extends PartialType(_userQuery) {}

export const _createCategorizationDto = getCreateCategorizationDto();
export const _CategorizationQuery = getCategorizationQuery();

export class CreateCategorizationDto extends _createCategorizationDto {}
export class UpdateCategorizationDto extends PartialType(
  CreateCategorizationDto,
) {}
export class CategorizationQuery extends PartialType(_CategorizationQuery) {}
