import {
  IsString,
  MinLength,
  IsEnum,
  IsJSON,
  IsUUID,
  IsNumber,
  isString,
  IsOptional,
} from "class-validator";
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

    @IsString()
    @ApiProperty()
    ExponatKind: ExponatKindType;

    @IsJSON()
    @ApiProperty()
    attributes: Json;

    @IsOptional()
    @ApiProperty({ require: false })
    categorizationId?: string;

    authorId?: string;
  }
  return CreateExponatDto;
};

export const getUpdateExponatDto = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class CreateExponatDto {
    @IsOptional()
    @IsString()
    @MinLength(5)
    @ApiProperty()
    name?: string;

    @IsOptional()
    @IsString()
    @MinLength(5)
    @ApiProperty()
    alternateName?: string;

    @IsOptional()
    @IsString()
    @MinLength(10)
    @ApiProperty()
    description?: string;

    @IsOptional()
    @IsString()
    @ApiProperty()
    mainImage?: string;

    @IsOptional()
    @IsString({ each: true })
    @ApiProperty()
    funFacts?: string[];

    @IsOptional()
    @IsString()
    @ApiProperty()
    ExponatKind?: ExponatKindType;

    @IsOptional()
    @IsJSON()
    @ApiProperty()
    attributes?: Json;

    @IsOptional()
    @IsUUID()
    @ApiProperty()
    cateogorizationId?: string;
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
  species: string;
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
    @IsOptional()
    @ApiProperty({ required: false })
    name?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    alternateName?: string;

    @IsOptional()
    @ApiProperty({ type: Date, required: false })
    createdAt?: Date;

    @IsOptional()
    @ApiProperty({ required: false })
    minFavoriteCount?: number;

    @IsOptional()
    @ApiProperty({ required: false })
    maxFavoriteCount?: number;

    @IsOptional()
    @ApiProperty({ required: false })
    organisationId?: string;

    @IsOptional()
    @ApiProperty({ enum: SortingEnum, required: false })
    attribute?: SortingEnum;

    @IsOptional()
    @ApiProperty({ enum: SortType, required: false })
    direction?: SortType;

    @IsOptional()
    @ApiProperty({ required: false })
    page?: number;

    @IsOptional()
    @ApiProperty({ required: false })
    size?: number;
  }
  return ExponatQueryDto;
};
