import { Question, QuestionType } from '@prisma/client';

type ScoredQuestion = Pick<Question, 'questionType' | 'correct'>;

const normalise = (value: string) => value.trim().toLowerCase();

// Multiple choice: exactly the correct options (in any order).
// True / false: the single answer matches.
// Fill in the blank: the answer matches any accepted answer; case and
// surrounding spaces are ignored.
export function isAnswerCorrect(
  question: ScoredQuestion,
  answer: string[],
): boolean {
  const given = answer.map((a) => a.trim()).filter((a) => a.length > 0);
  const correct = question.correct.map((c) => c.trim());
  if (!given.length || !correct.length) return false;

  switch (question.questionType) {
    case QuestionType.MULTIPLE_CHOICE: {
      const chosen = new Set(given);
      return (
        chosen.size === correct.length && correct.every((c) => chosen.has(c))
      );
    }
    case QuestionType.TRUE_FALSE:
      return (
        given.length === 1 && normalise(given[0]) === normalise(correct[0])
      );
    case QuestionType.FILL_IN_THE_BLANK:
      return (
        given.length === 1 &&
        correct.some((c) => normalise(c) === normalise(given[0]))
      );
    default:
      return false;
  }
}
