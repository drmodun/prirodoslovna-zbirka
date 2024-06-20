import { QuizDifficulty } from "../enums";

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
  timeLimitTotal: number;
  difficulty: QuizDifficulty;
}
