import { QuestionResponseExtended } from "../question/questionResponses";

export interface AttemptStartResponse {
  id: string;
  quizId: string;
  startedAt: Date;
  // When the attempt must be submitted by, for timed quizzes.
  deadline?: Date;
}

export interface AttemptAnswerResult {
  questionId: string;
  answer: string[];
  isCorrect: boolean;
  points: number;
  // Left out for tests (`isTest` quizzes).
  correctAnswer?: string[];
}

export interface AttemptResponseShort {
  id: string;
  quizId: string;
  quizTitle: string;
  userId?: string;
  username?: string;
  startedAt: Date;
  submittedAt?: Date;
  // Milliseconds.
  timeTaken: number;
  score: number;
  maxScore: number;
}

export interface AttemptResponse extends AttemptResponseShort {
  answers: AttemptAnswerResult[];
}

export interface QuizResultsResponse {
  quizId: string;
  attemptsAmount: number;
  averageAttemptScore: number;
  attempts: AttemptResponseShort[];
  questions: QuestionResponseExtended[];
}
