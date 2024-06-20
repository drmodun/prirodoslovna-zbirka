import { QuestionResponse } from "../question/questionResponses";
import { QuizDifficultyType } from "../enums";

export interface QuizResponseShort {
  title: string;
  description: string;
  coverImage?: string;
  isRetakeable: boolean;
  questionAmount: number;
  attemptsAmount: number;
  organisationId: string;
  organisationName: string;
  organisationMainImage: string;
  isTest: boolean;
  timeLimitTotal?: number;
  difficulty: QuizDifficultyType;
  isAnonymousAllowed: boolean;
  updatedAt: Date;
}

export interface QuizResponseExtended extends QuizResponseShort {
  averageAttemptScore: number;
  questions: QuestionResponse[];
}
