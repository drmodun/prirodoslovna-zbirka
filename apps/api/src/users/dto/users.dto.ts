import {
  getRegisterUserDto,
  getUpateUserDto,
  getUpdateLanguageDto,
} from '@biosfera/types';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from 'class-validator';

export const _registerUserDto = getRegisterUserDto(ApiProperty);

export class RegisterUserDto extends _registerUserDto {}

export const _updateUserDto = getUpateUserDto(ApiProperty);

export class UpdateUserDto extends _updateUserDto {}

export const _updateLanguageDto = getUpdateLanguageDto(ApiProperty);

export class UpdateLanguageDto extends _updateLanguageDto {}

export class ResetPasswordDto {
  @IsStrongPassword()
  @ApiProperty()
  newPassword: string;
}
