import { ApiProperty } from '@nestjs/swagger';
import { ApiTokenScope } from '@prisma/client';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { DEFAULT_EXPIRY_DAYS, MAX_EXPIRY_DAYS } from '../api-token';

export class CreateApiTokenDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  @ApiProperty({ example: 'MCP on my laptop', maxLength: 60 })
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(ApiTokenScope, { each: true })
  @ApiProperty({
    enum: ApiTokenScope,
    isArray: true,
    description: 'READ: GET and HEAD requests. WRITE: every method.',
  })
  scopes: ApiTokenScope[];

  // Left out: DEFAULT_EXPIRY_DAYS. Null: the token never expires.
  @ValidateIf(
    (dto) => dto.expiresInDays !== undefined && dto.expiresInDays !== null,
  )
  @IsInt()
  @Min(1)
  @Max(MAX_EXPIRY_DAYS)
  @ApiProperty({
    required: false,
    nullable: true,
    minimum: 1,
    maximum: MAX_EXPIRY_DAYS,
    default: DEFAULT_EXPIRY_DAYS,
    description:
      'Days until the token expires; null for a token that never expires.',
  })
  expiresInDays?: number | null;
}
