import { ApiProperty } from '@nestjs/swagger';
import { County } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @MinLength(2)
  @ApiProperty()
  firstName: string;

  @IsString()
  @MinLength(2)
  @ApiProperty()
  lastName: string;

  @IsEnum(County)
  @ApiProperty()
  location: County;

  @IsString()
  //later make this behave differently for blob storage
  profileImage: string;

  @IsStrongPassword()
  @ApiProperty()
  password: string;

  @IsEmail()
  @ApiProperty()
  email: string;
}
