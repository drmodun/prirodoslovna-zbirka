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
import {
  QuizDifficulty,
  QuizDifficultyType,
  TimeLimitTypeEnum,
  TimeLimitTypeEnumType,
} from "../enums";
import { getCreateQuestionDto } from "../question/questionRequests";
import { SortingEnum, SortType } from "../query";

const _createQuestionDto = getCreateQuestionDto();

class CreateQuestionDto extends _createQuestionDto {}

export const getCreateQuizRequest = (ApiPropertySwagger?: any, Type?: any) => {
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
    timeLimitType: TimeLimitTypeEnumType;

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

export const getUpdateQuizRequest = (ApiPropertySwagger?: any, Type?: any) => {
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

export const getQuizQuery = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class QuizQueryDto {
    @IsOptional()
    @ApiProperty()
    title?: string;

    @IsOptional()
    @ApiProperty()
    difficulty?: QuizDifficultyType;

    @IsOptional()
    @ApiProperty()
    isTest?: boolean;

    @IsOptional()
    @ApiProperty()
    isRetakeable?: boolean;

    @IsOptional()
    @ApiProperty()
    isAnonymousAllowed?: boolean;

    @IsOptional()
    @ApiProperty()
    organisationId?: string;

    @IsOptional()
    @ApiProperty({ enum: SortingEnum, required: false })
    attribute?: SortingEnum;

    @IsOptional()
    @ApiProperty({ enum: SortType, required: false })
    direction?: SortType;

    @IsOptional()
    @ApiProperty({ required: false })
    page?: number;

    @IsOptional()
    @ApiProperty({ required: false })
    size?: number;
  }

  return QuizQueryDto;
};
