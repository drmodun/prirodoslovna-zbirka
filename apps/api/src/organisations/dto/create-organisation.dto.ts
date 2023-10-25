import { ApiProperty } from '@nestjs/swagger';
import { County } from '@prisma/client';
import { IsEmail, IsString, IsUrl, MinLength } from 'class-validator';

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

  @ApiProperty()
  @IsUrl()
  website: string;

  @ApiProperty()
  mainImage: string;

  @ApiProperty()
  otherImages: string[];

  @ApiProperty()
  location: County;
}
