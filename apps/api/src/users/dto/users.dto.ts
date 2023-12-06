import { getRegisterUserDto } from '@biosfera/types';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export const _registerUserDto = getRegisterUserDto(ApiProperty);

export class RegisterUserDto extends _registerUserDto {}

export class UpdateUserDto extends PartialType(RegisterUserDto) {
  @Exclude()
  password: string;

  @Exclude()
  email: string;
}
