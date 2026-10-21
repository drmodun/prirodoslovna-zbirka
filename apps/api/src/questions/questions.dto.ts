import {
  getCreateQuestionDto,
  getQuestionQuery,
  getUpdateQuestionDto,
} from '@biosfera/types';
import { ApiProperty } from '@nestjs/swagger';

export const _getCreateQuestionsDto = getCreateQuestionDto(ApiProperty);

export class CreateQuestionDto extends _getCreateQuestionsDto {}

export const _getUpdateQuestionsDto = getUpdateQuestionDto(ApiProperty);

export class UpdateQuestionDto extends _getUpdateQuestionsDto {}

export const _getQuestionQuery = getQuestionQuery(ApiProperty);

export class QuestionQuery extends _getQuestionQuery {}
