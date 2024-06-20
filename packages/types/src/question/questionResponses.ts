import { QuestionTypeEnumType } from "../enums";

export interface QuestionResponse {
  id: string;
  question: string;
  image?: string;
  questionType: QuestionTypeEnumType;
  options: string[];
  timeLimit?: number;
}

export interface AnswerDistribution {
  answer: string;
  amount: number;
}

export interface QuestionResponseExtended extends QuestionResponse {
  points: number;
  correctAnswer: string;
  correctPercentage: number;
  answerDistribution?: AnswerDistribution[];
}
