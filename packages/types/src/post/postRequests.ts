import { IsString, MaxLength, MinLength } from "class-validator";

export const getCreatePostRequest = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class CreatePostRequest {
    @ApiProperty()
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    title: String;

    @ApiProperty()
    images: String[];
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
    title: String;

    @ApiProperty()
    images: String[];
  }

  return UpdatePostRequest;
};
