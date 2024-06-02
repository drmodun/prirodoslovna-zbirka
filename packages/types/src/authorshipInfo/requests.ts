import { IsOptional, IsString, IsUUID } from "class-validator";

export const getCreateAuthorshipInfoDto = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class CreateAuthorshipInfoDto {
    @IsOptional()
    @IsString()
    @ApiProperty()
    locationOfOccurrence?: string;

    dateOfOccurrence?: Date;

    @IsOptional()
    @IsUUID()
    authorId?: string;

    @IsOptional()
    @IsString()
    nonPlatformAuthor?: string;

    @IsOptional()
    @IsString()
    identifiedBy?: string;

    @IsOptional()
    @IsString()
    photographer?: string;

    @IsOptional()
    @IsString({ each: true })
    literature?: string[];

    @IsOptional()
    @IsString()
    deviceName?: string;
  }
  return CreateAuthorshipInfoDto;
};

export const getUpdateAuthorshipInfoDto = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class UpdateAuthorshipInfoDto {
    @IsOptional()
    @IsString()
    locationOfOccurrence?: string;

    @IsOptional()
    dateOfOccurrence?: Date;

    @IsOptional()
    @IsUUID()
    authorId?: string;

    @IsOptional()
    @IsString()
    nonPlatformAuthor?: string;

    @IsOptional()
    @IsString()
    identifiedBy?: string;

    @IsOptional()
    @IsString()
    photographer?: string;

    @IsOptional()
    @IsString({ each: true })
    literature: string[];

    @IsOptional()
    @IsString()
    deviceName?: string;
  }
  return UpdateAuthorshipInfoDto;
};
