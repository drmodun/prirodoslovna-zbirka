import {
  IsString,
  MinLength,
  IsEnum,
  IsStrongPassword,
  IsEmail,
  IsBoolean,
} from "class-validator";
import { LoginRequest } from "../auth";
import { County } from "../enums";

export const getRegisterUserDto = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class RegisterUserDto {
    @IsString()
    @MinLength(2)
    @ApiProperty()
    firstName: string;

    @IsString()
    @MinLength(2)
    @ApiProperty()
    lastName: string;

    @IsString()
    @ApiProperty()
    username: string;

    @IsString()
    @ApiProperty({ required: false })
    bio?: string;

    @IsEnum(County)
    @ApiProperty()
    location: County;

    @IsStrongPassword()
    @ApiProperty()
    password: string;

    @IsEmail()
    @ApiProperty()
    email: string;
  }

  return RegisterUserDto;
};

export const getUpateUserDto = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class UpdateUserDto {
    @IsString()
    @MinLength(2)
    @ApiProperty()
    firstName: string;

    @IsString()
    @MinLength(2)
    @ApiProperty()
    lastName: string;

    @IsString()
    @ApiProperty()
    username: string;

    @IsString()
    @ApiProperty({ required: false })
    bio?: string;

    @IsEnum(County)
    @ApiProperty()
    location: County;

    @IsBoolean()
    @ApiProperty()
    hasProfileImage: boolean;
  }

  return UpdateUserDto;
};

export interface UpdateUserInfoRequest {
  firstName?: string;
  lastName?: string;
  location?: County;
  profilePicture?: string;
  bio?: string;
}

export interface UserQuery {
  name?: string;
  location?: County;
  organisation?: string;
  role?: number;
}

export const getUserQuery = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class UserQueryDto {
    @IsString()
    @ApiProperty()
    name?: string;

    @IsEnum(County)
    @ApiProperty()
    location?: County;

    @IsString()
    @ApiProperty()
    username?: string;
  }

  return UserQueryDto;
};
