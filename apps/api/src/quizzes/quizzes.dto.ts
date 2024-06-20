import { getCreateQuizRequest, getQuizQuery } from '@biosfera/types';
import { ApiProperty } from '@nestjs/swagger';

const _getCreateQuizDto = getCreateQuizRequest(ApiProperty);

export class CreateQuizDto extends _getCreateQuizDto {}

const _getUpdateQuizDto = getCreateQuizRequest(ApiProperty);

export class UpdateQuizDto extends _getUpdateQuizDto {}

const _getQuizQuery = getQuizQuery(ApiProperty);

export class QuizQuery extends _getQuizQuery {}
