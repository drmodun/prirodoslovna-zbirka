import { IsEnum, IsString } from "class-validator";
import { SortingEnum, SortType } from "../query";

export const getCreateCategorizationDto = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class CreateCategorizationDto {
    @IsString()
    @ApiProperty()
    genus: string;

    @IsString()
    @ApiProperty()
    family: string;

    @IsString()
    @ApiProperty()
    kingdom: string;

    @IsString()
    @ApiProperty()
    domain: string;

    @IsString()
    @ApiProperty()
    phylum: string;

    @IsString()
    @ApiProperty()
    order: string;

    @IsString()
    @ApiProperty()
    class: string;
  }

  return CreateCategorizationDto;
};

export const getCategorizationQuery = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class CategorizationQuery {
    @IsString()
    @ApiProperty()
    genus: string;

    @IsString()
    @ApiProperty()
    kingdom: string;

    @IsString()
    @ApiProperty()
    domain: string;

    @IsString()
    @ApiProperty()
    phylum: string;

    @IsString()
    @ApiProperty()
    order: string;

    @IsString()
    @ApiProperty()
    class: string;

    @IsString()
    @ApiProperty()
    family: string;

    @IsEnum(SortingEnum)
    @ApiProperty({ enum: SortingEnum, required: false })
    attribute: SortingEnum;

    @IsEnum(SortType)
    @ApiProperty({ enum: SortType, required: false })
    direction: SortType;

    @ApiProperty({ required: false })
    page: number;

    @ApiProperty({ required: false })
    size: number;
  }

  return CategorizationQuery;
};
