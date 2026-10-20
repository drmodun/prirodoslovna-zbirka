import { getRegisterUserDto, getUpateUserDto } from '@biosfera/types';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from 'class-validator';

export const _registerUserDto = getRegisterUserDto(ApiProperty);

export class RegisterUserDto extends _registerUserDto {}

export const _updateUserDto = getUpateUserDto(ApiProperty);

export class UpdateUserDto extends _updateUserDto {}

export class ResetPasswordDto {
  @IsStrongPassword()
  @ApiProperty()
  newPassword: string;
}
