import {
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from "class-validator";
import { QuestionTypeEnum, QuestionTypeEnumType } from "../enums";

export const getCreateQuestionDto = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class CreateQuestionDto {
    @IsString()
    @MinLength(5)
    @ApiProperty()
    question: string;

    @IsEnum(QuestionTypeEnum)
    @ApiProperty()
    questionType: QuestionTypeEnumType;

    @IsString({ each: true })
    @ApiProperty()
    options: string[];

    @IsString({ each: true })
    @ApiProperty()
    correct: string[];

    @IsOptional()
    @IsString()
    @ApiProperty()
    image?: string;

    @IsNumber()
    @ApiProperty()
    points: number;

    @IsOptional()
    @IsNumber()
    @Min(15 * 1000)
    @Max(10 * 60 * 1000)
    timeLimit?: number;

    quizId?: string;
  }
  return CreateQuestionDto;
};

export const getUpdateQuestionDto = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class UpdateQuestionDto {
    @IsString()
    @MinLength(5)
    @ApiProperty()
    question: string;

    @IsEnum(QuestionTypeEnum)
    @ApiProperty()
    questionType: QuestionTypeEnumType;

    @IsString({ each: true })
    @ApiProperty()
    options: string[];

    @IsString({ each: true })
    @ApiProperty()
    correct: string[];

    @IsOptional()
    @IsString()
    @ApiProperty()
    image?: string;

    @IsNumber()
    @ApiProperty()
    points: number;

    @IsOptional()
    @IsNumber()
    @Min(15 * 1000)
    @Max(10 * 60 * 1000)
    timeLimit?: number;

    quizId?: string;
  }
  return UpdateQuestionDto;
};

export const getQuestionQuery = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class QuestionQuery {
    @IsString()
    @ApiProperty()
    quizId: string;
  }
  return QuestionQuery;
};
