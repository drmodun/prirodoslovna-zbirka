import { getCreateQuizRequest, getQuizQuery } from '@biosfera/types';
import { ApiProperty } from '@nestjs/swagger';

const _getCreateQuizDto = getCreateQuizRequest(ApiProperty);

export class CreateQuizDto extends _getCreateQuizDto {}

const _getUpdateQuizRequest = getCreateQuizRequest(ApiProperty);

export class UpdateQuizDto extends _getUpdateQuizRequest {}

const _getQuizQuery = getQuizQuery(ApiProperty);

export class QuizQuery extends _getQuizQuery {}
