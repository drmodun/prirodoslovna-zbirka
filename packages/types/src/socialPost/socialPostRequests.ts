import {
  IsArray,
  IsEnum,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";
import { SortType, SortingEnum } from "../query";

export const getCreateSocialPostDto = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class CreateSocialPostDto {
    @IsString()
    @MinLength(3)
    @ApiProperty()
    title: string;

    @IsString()
    @MinLength(10)
    @MaxLength(500)
    @ApiProperty()
    text: string;

    @IsString()
    @ApiProperty()
    mainImage: string;

    @IsUUID()
    @ApiProperty()
    authorshipInfoId: string;

    @IsArray()
    @IsString({ each: true })
    @ApiProperty()
    images: string[];
  }
  return CreateSocialPostDto;
};

export const getSocialPostQuery = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class SocialPostQueryDto {
    @IsString()
    @ApiProperty()
    title: string;

    @IsUUID()
    @ApiProperty()
    authorId: string;

    @IsEnum(SortType)
    @ApiProperty({ enum: SortType })
    direction: SortType;

    @IsEnum(SortingEnum)
    @ApiProperty({ enum: SortType })
    attribute: SortingEnum;
  }
  return SocialPostQueryDto;
};
