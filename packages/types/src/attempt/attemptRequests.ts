import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

export const getSubmitAnswerDto = (ApiPropertySwagger?: any) => {
  const ApiProperty = ApiPropertySwagger || function () {};

  class SubmitAnswerDto {
    @IsUUID()
    @ApiProperty()
    questionId: string;

    // The chosen options (multiple choice), "true" / "false" (true / false)
    // or the typed answer (fill in the blank).
    @IsArray()
    @ArrayMaxSize(50)
    @IsString({ each: true })
    @MaxLength(500, { each: true })
    @ApiProperty({ type: [String] })
    answer: string[];

    // Seconds spent on the question, as measured by the client.
    @IsOptional()
    @IsInt()
    @Min(0)
    @ApiProperty({ required: false })
    timeTaken?: number;
  }

  return SubmitAnswerDto;
};

export const getSubmitAttemptDto = (
  ApiPropertySwagger?: any,
  TypeTest?: any,
) => {
  const ApiProperty = ApiPropertySwagger || function () {};
  const Type = TypeTest || function () {};
  const SubmitAnswerDto = getSubmitAnswerDto(ApiProperty);

  class SubmitAttemptDto {
    // Unanswered questions may be left out; they score no points.
    @IsArray()
    @ArrayMaxSize(500)
    @ValidateNested({ each: true })
    @Type(() => SubmitAnswerDto)
    @ApiProperty({ type: [SubmitAnswerDto] })
    answers: InstanceType<typeof SubmitAnswerDto>[];
  }

  return SubmitAttemptDto;
};

export interface SubmitAnswerRequest {
  questionId: string;
  answer: string[];
  timeTaken?: number;
}

export interface SubmitAttemptRequest {
  answers: SubmitAnswerRequest[];
}
