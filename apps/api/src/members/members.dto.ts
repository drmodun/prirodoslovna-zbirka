import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum MemberRoleType {
  MEMBER = 'MEMBER',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  REQUESTED = 'REQUESTED',
}

export class EditMembershipDto {
  @ApiProperty({ enum: MemberRoleType })
  @IsEnum(MemberRoleType)
  role: MemberRoleType;
}
