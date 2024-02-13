import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { SortType, SortingEnum } from "../query";

export const getCreatePostRequest = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class CreatePostRequest {
    @ApiProperty()
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    title: string;

    @ApiProperty()
    image: string;

    @ApiProperty()
    thumbnailImage: string;

    @ApiProperty()
    @IsString()
    @MinLength(3)
    text: string;

    authorId: string;

    exponatId: string;
  }

  return CreatePostRequest;
};

export const getUpdatePostRequest = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class UpdatePostRequest {
    @ApiProperty()
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    title: string;

    @ApiProperty()
    image: string;

    @ApiProperty()
    @IsString()
    @MinLength(3)
    text: string;

    @ApiProperty()
    thumbnailImage: string;

    authorId: string;

    exponatId: string;
  }

  return UpdatePostRequest;
};

export const getPostQuery = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class PostQuery {
    @IsOptional()
    @ApiProperty({ required: false })
    title?: string;

    @IsOptional()
    @ApiProperty({ required: false })
    userId?: string;

    @IsOptional()
    @ApiProperty({ required: false })
    userName?: string;

    @IsOptional()
    @ApiProperty({ required: false })
    exponatId?: string;

    @IsOptional()
    @ApiProperty({ required: false })
    organisationId?: string;

    @IsOptional()
    @ApiProperty({ required: false })
    exponatName?: string;

    @IsOptional()
    @IsEnum(SortingEnum)
    @ApiProperty({ required: false })
    attribute?: SortingEnum;

    @IsOptional()
    @IsEnum(SortType)
    @ApiProperty({ required: false })
    direction?: SortType;

    @IsOptional()
    @ApiProperty({ required: false })
    page?: number;

    @IsOptional()
    @ApiProperty({ required: false })
    size?: number;

    isAdmin?: boolean;
  }

  return PostQuery;
};
