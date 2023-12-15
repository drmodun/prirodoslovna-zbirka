import {
  IsString,
  MinLength,
  IsEnum,
  IsJSON,
  IsUUID,
  IsNumber,
} from "class-validator";
import { ExponatKind } from "../enums";
import { Json } from "../jsonObjects";
import { SortType, SortingEnum } from "../query";

export type ExponatKindType = "PROCARIOT" | "EUCARIOT" | "MINERAL";

export const getCreateExponatDto = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class CreateExponatDto {
    @IsString()
    @MinLength(5)
    @ApiProperty()
    name: string;

    @IsString()
    @MinLength(5)
    @ApiProperty()
    alternateName: string;

    @IsString()
    @MinLength(10)
    @ApiProperty()
    description: string;

    @IsString()
    @ApiProperty()
    mainImage: string;

    @IsString({ each: true })
    @ApiProperty()
    funFacts: string[];

    @IsEnum(ExponatKind)
    @ApiProperty()
    ExponatKind: ExponatKindType;

    @IsJSON()
    @ApiProperty()
    attributes: Json;

    @IsUUID()
    @ApiProperty()
    cateogorizationId: string;
  }
  return CreateExponatDto;
};

export interface CreateCategorizationRequest {
  genus: string;
  family: string;
  order: string;
  class: string;
  phylum: string;
  kingdom: string;
  domain: string;
}

export interface ExponatQuery {
  name?: string;
  authorId?: string;
  alternateName?: string;
  createdAt?: Date;
  minFavoriteCount?: number;
  maxFavoriteCount?: number;
  organisationId?: string;
}

export const getExponatQuery = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class ExponatQueryDto {
    @IsString()
    @ApiProperty({ required: false })
    name: string;

    @IsString()
    @ApiProperty({ required: false })
    alternateName: string;

    @IsString()
    @ApiProperty({ type: Date, required: false })
    createdAt: Date;

    @IsString()
    @ApiProperty({ required: false })
    minFavoriteCount: number;

    @IsString()
    @ApiProperty({ required: false })
    maxFavoriteCount: number;

    @IsString()
    @ApiProperty({ required: false })
    organisationId: string;

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
  return ExponatQueryDto;
};