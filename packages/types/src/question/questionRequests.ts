import {
  IsString,
  MinLength,
  IsOptional,
  IsIn,
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

    @IsIn(Object.keys(QuestionTypeEnum))
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
    @IsOptional()
    @IsString()
    @MinLength(5)
    @ApiProperty({ required: false })
    question?: string;

    @IsOptional()
    @IsIn(Object.keys(QuestionTypeEnum))
    @ApiProperty({ required: false })
    questionType?: QuestionTypeEnumType;

    @IsOptional()
    @IsString({ each: true })
    @ApiProperty({ required: false })
    options?: string[];

    @IsOptional()
    @IsString({ each: true })
    @ApiProperty({ required: false })
    correct?: string[];

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    image?: string;

    @IsOptional()
    @IsNumber()
    @ApiProperty({ required: false })
    points?: number;

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
    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    quizId?: string;
  }
  return QuestionQuery;
};
