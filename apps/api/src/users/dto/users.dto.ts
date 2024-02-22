import { getRegisterUserDto, getUpateUserDto } from '@biosfera/types';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export const _registerUserDto = getRegisterUserDto(ApiProperty);

export class RegisterUserDto extends _registerUserDto {}

export const _updateUserDto = getUpateUserDto(ApiProperty);

export class UpdateUserDto extends _updateUserDto {}
