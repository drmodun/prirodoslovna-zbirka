import { getCreateQuizRequest, getQuizQuery } from '@biosfera/types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

const _getCreateQuizDto = getCreateQuizRequest(ApiProperty, Type);

export class CreateQuizDto extends _getCreateQuizDto {}

const _getUpdateQuizRequest = getCreateQuizRequest(ApiProperty, Type);

export class UpdateQuizDto extends _getUpdateQuizRequest {}

const _getQuizQuery = getQuizQuery(ApiProperty);

export class QuizQuery extends _getQuizQuery {}
