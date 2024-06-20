import { QuestionTypeEnumType } from "../enums";

export interface QuestionResponse {
  id: string;
  text: string;
  questionType: QuestionTypeEnumType;
  options: string[];
  correctAnswer: string;
  createdAt: Date;
  updatedAt: Date;
}
