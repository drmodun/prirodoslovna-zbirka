import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import {
  QuizDifficulty,
  QuizDifficultyType,
  TimeLimitTypeEnum,
  TimeLimitTypeEnumType,
} from "../enums";
import { getCreateQuestionDto } from "src/question/questionRequests";

const _createQuestionDto = getCreateQuestionDto();

class CreateQuestionDto extends _createQuestionDto {}

export const getQuizRequests = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class CreateQuizDto {
    @IsString()
    @MinLength(5)
    @ApiProperty()
    title: string;

    @IsString()
    @MinLength(5)
    @ApiProperty()
    description: string;

    @IsString()
    @ApiProperty()
    coverImage: string;

    @IsEnum(TimeLimitTypeEnum)
    @ApiProperty()
    quizType: TimeLimitTypeEnumType;

    @IsBoolean()
    @ApiProperty()
    isTest: boolean;

    @IsOptional()
    @IsNumber()
    @MinLength(1000 * 60 * 5)
    @Max(24 * 60 * 60 * 1000)
    @ApiProperty()
    timeLimitTotal?: number;

    @IsEnum(QuizDifficulty)
    @ApiProperty()
    difficulty: QuizDifficultyType;

    @IsOptional()
    @ApiProperty()
    isRetakeable?: boolean;

    @IsOptional()
    @ApiProperty()
    isAnonymousAllowed?: boolean;

    @ValidateNested({ each: true })
    @Type(() => CreateQuestionDto)
    @MinLength(1)
    @ApiProperty()
    questions: CreateQuestionDto[]; //TODO: Test this later
  }

  return CreateQuizDto;
};

export const getUpdateQuizDto = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class UpdateQuizDto {
    @IsOptional()
    @IsString()
    @MinLength(5)
    @ApiProperty()
    title?: string;

    @IsOptional()
    @IsString()
    @MinLength(5)
    @ApiProperty()
    description?: string;

    @IsOptional()
    @IsString()
    @ApiProperty()
    coverImage?: string;

    @IsOptional()
    @IsEnum(TimeLimitTypeEnum)
    @ApiProperty()
    quizType?: TimeLimitTypeEnumType;

    @IsOptional()
    @IsBoolean()
    @ApiProperty()
    isTest?: boolean;

    @IsOptional()
    @IsNumber()
    @MinLength(1000 * 60 * 5)
    @Max(24 * 60 * 60 * 1000)
    @ApiProperty()
    timeLimitTotal?: number;

    @IsOptional()
    @IsEnum(QuizDifficulty)
    @ApiProperty()
    difficulty?: QuizDifficultyType;

    @IsOptional()
    @ApiProperty()
    isRetakeable?: boolean;

    @IsOptional()
    @ApiProperty()
    isAnonymousAllowed?: boolean;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateQuestionDto)
    @ApiProperty()
    questions?: CreateQuestionDto[]; //TODO: Test this later
  }

  return UpdateQuizDto;
};
