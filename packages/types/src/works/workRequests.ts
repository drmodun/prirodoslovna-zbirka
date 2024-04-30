import {
  IsString,
  MinLength,
  MaxLength,
  IsUUID,
  isUUID,
} from "class-validator";

export const getCreateWorkDto = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class CreateWorkDto {
    @IsString()
    @MinLength(3)
    @ApiProperty()
    title: string;

    @IsString()
    @MinLength(10)
    @MaxLength(1000)
    @ApiProperty()
    description: string;

    @IsString()
    @ApiProperty()
    poster: string;

    @IsString()
    @ApiProperty()
    document: string;

    @IsString()
    @ApiProperty()
    presentation: string;

    authorId: string;
    organisationId: string;
  }
  return CreateWorkDto;
};

export const getWorkQuery = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class WorkQueryDto {
    @IsString()
    @ApiProperty()
    title: string;

    @IsUUID()
    @ApiProperty()
    authorId: string;

    @IsUUID()
    @ApiProperty()
    approvedBy: string;

    @IsUUID()
    @ApiProperty()
    organisationId: string;
  }
  return WorkQueryDto;
};
