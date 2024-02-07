import { IsString, MinLength, IsEmail, IsUrl, IsEnum } from "class-validator";
import { County } from "../enums";

export const getCreateOrganisationDto = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class CreateOrganisationDto {
    @IsString()
    @MinLength(5)
    @ApiProperty()
    name: string;

    @IsString()
    @MinLength(10)
    @ApiProperty()
    description: string;

    @IsString()
    @IsEmail()
    @ApiProperty()
    email: string;

    @IsUrl()
    @ApiProperty()
    websiteUrl: string;

    @IsString()
    @ApiProperty()
    mainImage: string;

    @IsString({ each: true })
    @ApiProperty()
    otherImages: string[];

    @IsEnum(County)
    @ApiProperty()
    location: County;

    OrganisationUsers?: any;
  }
  return CreateOrganisationDto;
};

export const getOrganisationQuery = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};
  class UpdatedOrganisationQuery {
    @IsString()
    @ApiProperty()
    name: string;

    @IsString()
    @ApiProperty()
    location: County;
  }

  return UpdatedOrganisationQuery;
};

export interface OrganisationQuery {
  name?: string;
  location?: County;
}
