import { IsString, MinLength, IsEnum, IsJSON, IsUUID } from "class-validator";
import { ExponatKind } from "../enums";
import { Json } from "../jsonObjects";

export type ExponatKindType = "PROCARIOT" | "EUCARIOT" | "MINERAL";

export const getCreateExponatRequest = (ApiPropertySwagger?: any) => {
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
    exponatKind: ExponatKindType;

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

export interface UpdateExponatRequest {
  name?: string;
  alternateName?: string;
  exponatKind?: ExponatKind;
  description?: string;
  funFacts?: string[];
  attributes?: Json;
  mainImage?: string;
  isApproved?: boolean;
  cateogorisationId?: string;
}
