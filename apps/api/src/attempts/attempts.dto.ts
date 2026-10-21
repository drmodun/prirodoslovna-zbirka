import { getSubmitAttemptDto } from '@biosfera/types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

const _submitAttemptDto = getSubmitAttemptDto(ApiProperty, Type);

export class SubmitAttemptDto extends _submitAttemptDto {}
