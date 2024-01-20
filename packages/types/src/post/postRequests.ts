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
    images: string[];

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
    images: string[];

    authorId: string;

    exponatId: string;
  }

  return UpdatePostRequest;
};

export const getPostQuery = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class PostQuery {
    @IsOptional()
    @ApiProperty()
    title: string;

    @IsOptional()
    @ApiProperty()
    userId: string;

    @IsOptional()
    @ApiProperty()
    userName: string;

    @IsOptional()
    @ApiProperty()
    exponatId: string;

    @IsOptional()
    @ApiProperty()
    organisationId: string;

    @IsOptional()
    @ApiProperty()
    exponatName: string;

    @IsOptional()
    @IsEnum(SortingEnum)
    @ApiProperty()
    attribute: SortingEnum;

    @IsOptional()
    @IsEnum(SortType)
    @ApiProperty()
    direction: SortType;

    @IsOptional()
    @ApiProperty()
    page: number;

    @IsOptional()
    @ApiProperty()
    size: number;

    isAdmin?: boolean;
  }

  return PostQuery;
};
