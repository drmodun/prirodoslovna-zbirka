import { PartialType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { RegisterUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(RegisterUserDto) {
  @Exclude()
  password: string;

  @Exclude()
  email: string;
}
