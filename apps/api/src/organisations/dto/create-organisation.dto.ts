import { ApiProperty } from '@nestjs/swagger';
import { County } from '@prisma/client';
import { IsEmail, IsEnum, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateOrganisationDto {
  @IsString()
  @MinLength(5)
  @ApiProperty()
  name: string;

  @IsString()
  @MinLength(10)
  @ApiProperty()
  description: string;

  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsUrl()
  @ApiProperty()
  websiteUrl: string;

  @IsString()
  @ApiProperty()
  mainImage: string;

  @IsString({ each: true })
  @ApiProperty()
  otherImages: string[];

  @IsEnum(County)
  @ApiProperty()
  location: County;
}
