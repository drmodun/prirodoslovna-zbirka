import {
  getCreateAuthorshipInfoDto,
  getUpdateAuthorshipInfoDto,
} from '@biosfera/types';
import { ApiProperty } from '@nestjs/swagger';

export const _createAuthorshipInfoDto = getCreateAuthorshipInfoDto(ApiProperty);
export const _UpdateAuthorshipInfoDto = getUpdateAuthorshipInfoDto(ApiProperty);

export class CreateAuthorshipInfoDto extends _createAuthorshipInfoDto {}
export class UpdateAuthorshipInfoDto extends _UpdateAuthorshipInfoDto {}
