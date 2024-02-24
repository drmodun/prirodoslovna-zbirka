import {
  IsString,
  MinLength,
  IsOptional,
  IsEmail,
  IsUrl,
  IsEnum,
} from "class-validator";
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

    @IsEnum(County)
    @ApiProperty()
    location: County;

    OrganisationUsers?: any;
  }
  return CreateOrganisationDto;
};

export const getUpdateOrganisationDto = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class UpdateOrganisationDto {
    @IsOptional()
    @IsString()
    @MinLength(5)
    @ApiProperty({ required: false })
    name?: string;

    @IsOptional()
    @IsString()
    @MinLength(10)
    @ApiProperty({ required: false })
    description?: string;

    @IsOptional()
    @IsString()
    @IsEmail()
    @ApiProperty({ required: false })
    email?: string;

    @IsOptional()
    @IsUrl()
    @ApiProperty({ required: false })
    websiteUrl?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    mainImage?: string;

    @IsOptional()
    @IsEnum(County)
    @ApiProperty({ required: false })
    location?: County;
  }
  return UpdateOrganisationDto;
};

export const getOrganisationQuery = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};
  class UpdatedOrganisationQuery {
    @IsOptional()
    @ApiProperty()
    name?: string;

    @IsOptional()
    @ApiProperty()
    location?: County;

    @IsOptional()
    @ApiProperty()
    size?: number;

    @IsOptional()
    @ApiProperty()
    page?: number;
  }

  return UpdatedOrganisationQuery;
};

export interface OrganisationQuery {
  name?: string;
  location?: County;
}
