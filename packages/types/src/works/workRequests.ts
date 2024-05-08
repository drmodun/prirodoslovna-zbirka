import {
  IsString,
  MinLength,
  MaxLength,
  IsUUID,
  IsArray,
  IsEnum,
  IsOptional,
} from "class-validator";
import { WorkType } from "../enums";
import { SortType, SortingEnum } from "../query";

export type WorkTypeEnumType =
  | "JOURNAL"
  | "BOOK"
  | "GENERIC"
  | "WEB_PAGE"
  | "THESIS"
  | "STATUTE"
  | "CASE"
  | "BOOK_SECTION"
  | "MAGAZINE_ARTICLE"
  | "ENCYCLOPEDIA_ARTICLE";

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

    @IsArray()
    @IsString({ each: true })
    @ApiProperty()
    tags: string[];

    @IsString()
    @ApiProperty()
    type: WorkTypeEnumType;

    authorId: string;
    organisationId: string;
  }
  return CreateWorkDto;
};

export const getUpdateWorkDto = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class UpdateWorkDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    @ApiProperty()
    title?: string;

    @IsOptional()
    @IsString()
    @MinLength(10)
    @MaxLength(1000)
    @ApiProperty()
    description: string;

    @IsOptional()
    @IsString()
    @ApiProperty()
    poster: string;

    @IsOptional()
    @IsString()
    @ApiProperty()
    document: string;

    @IsOptional()
    @IsString()
    @ApiProperty()
    presentation: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ApiProperty()
    tags: string[];

    @IsOptional()
    @IsString()
    @ApiProperty()
    type: WorkType;

    authorId: string;
    organisationId: string;
  }
  return UpdateWorkDto;
};

export const getWorkQuery = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class WorkQueryDto {
    @IsOptional()
    @IsString()
    @ApiProperty()
    title: string;

    @IsOptional()
    @IsUUID()
    @ApiProperty()
    authorId: string;

    @IsOptional()
    @IsUUID()
    @ApiProperty()
    approvedBy: string;

    @IsOptional()
    @IsUUID()
    @ApiProperty()
    organisationId: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ApiProperty()
    tags: string[];

    @IsEnum(SortType)
    @ApiProperty({ enum: SortType })
    direction: SortType;

    @IsOptional()
    @IsEnum(SortingEnum)
    @ApiProperty({ enum: SortType })
    attribute: SortingEnum;

    @IsOptional()
    @ApiProperty({ required: false })
    page?: number;

    @IsOptional()
    @ApiProperty({ required: false })
    size?: number;

    @IsOptional()
    @ApiProperty({ required: false })
    type?: WorkTypeEnumType;
  }
  return WorkQueryDto;
};

export interface GbifQuery {
  q: string;
  literatureType: WorkType;
  publisher: string;
  limit: number;
  offset: number;
  topics: string[];
}
