import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Attempt, Prisma, Question, Quiz } from '@prisma/client';
import {
  AttemptAnswerResult,
  AttemptResponse,
  AttemptResponseShort,
  AttemptStartResponse,
  QuestionResponseExtended,
  QuizResultsResponse,
} from '@biosfera/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { MembersService } from 'src/members/members.service';
import { SubmitAttemptDto } from './attempts.dto';
import { isAnswerCorrect } from './scoring';

// Allowance for network latency on timed quizzes.
export const SUBMIT_GRACE_MS = 10_000;

type QuizWithQuestions = Quiz & { questions: Question[] };

const attemptListInclude = {
  quiz: { select: { title: true } },
  user: { select: { username: true } },
} satisfies Prisma.AttemptInclude;

type AttemptListItem = Prisma.AttemptGetPayload<{
  include: typeof attemptListInclude;
}>;

@Injectable()
export class AttemptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly membersService: MembersService,
  ) {}

  // When an attempt started at `startedAt` has to be submitted, if ever.
  static deadline(quiz: QuizWithQuestions, startedAt: Date): Date | undefined {
    if (quiz.timeLimitType === 'TOTAL' && quiz.timeLimitTotal)
      return new Date(startedAt.getTime() + quiz.timeLimitTotal);

    if (quiz.timeLimitType === 'PER_QUESTION') {
      const seconds = quiz.questions.reduce(
        (sum, q) => sum + (q.timeLimit ?? 0),
        0,
      );
      if (seconds > 0) return new Date(startedAt.getTime() + seconds * 1000);
    }

    return undefined;
  }

  private static maxScore(quiz: QuizWithQuestions) {
    return quiz.questions.reduce((sum, q) => sum + q.points, 0);
  }

  private static isOverdue(quiz: QuizWithQuestions, startedAt: Date) {
    const deadline = AttemptsService.deadline(quiz, startedAt);
    return !!deadline && Date.now() > deadline.getTime() + SUBMIT_GRACE_MS;
  }

  // An attempt that ran out of time counts, with no points.
  private async closeOverdue(attempt: Attempt) {
    await this.prisma.attempt.updateMany({
      where: { id: attempt.id, submittedAt: null },
      data: {
        submittedAt: new Date(),
        timeTaken: Date.now() - attempt.startedAt.getTime(),
        score: 0,
      },
    });
  }

  private async findQuiz(quizId: string) {
    return this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });
  }

  async start(quizId: string, userId?: string): Promise<AttemptStartResponse> {
    const quiz = await this.findQuiz(quizId);
    if (!quiz || !quiz.isApproved) throw new NotFoundException();

    if (!userId && !quiz.isAnonymousAllowed)
      throw new UnauthorizedException('Log in to take this quiz');

    if (userId) {
      // Starting again resumes the running attempt, so the clock cannot be
      // reset by reloading the page.
      const running = await this.prisma.attempt.findFirst({
        where: { quizId, userId, submittedAt: null },
        orderBy: { startedAt: 'desc' },
      });
      if (running) {
        if (!AttemptsService.isOverdue(quiz, running.startedAt))
          return this.startResponse(quiz, running);
        await this.closeOverdue(running);
      }

      if (!quiz.isRetakeable) {
        const done = await this.prisma.attempt.count({
          where: { quizId, userId, submittedAt: { not: null } },
        });
        if (done > 0)
          throw new ConflictException('This quiz can only be taken once');
      }
    }

    const attempt = await this.prisma.attempt.create({
      data: {
        quizId,
        userId: userId ?? null,
        maxScore: AttemptsService.maxScore(quiz),
      },
    });

    return this.startResponse(quiz, attempt);
  }

  private startResponse(
    quiz: QuizWithQuestions,
    attempt: Attempt,
  ): AttemptStartResponse {
    return {
      id: attempt.id,
      quizId: quiz.id,
      startedAt: attempt.startedAt,
      deadline: AttemptsService.deadline(quiz, attempt.startedAt),
    };
  }

  async submit(
    attemptId: string,
    dto: SubmitAttemptDto,
    userId?: string,
  ): Promise<AttemptResponse> {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { quiz: { include: { questions: true } } },
    });
    if (!attempt) throw new NotFoundException();
    if (attempt.userId && attempt.userId !== userId)
      throw new UnauthorizedException('This attempt belongs to someone else');
    if (attempt.submittedAt)
      throw new ConflictException('This attempt was already submitted');

    const quiz = attempt.quiz;
    if (AttemptsService.isOverdue(quiz, attempt.startedAt)) {
      await this.closeOverdue(attempt);
      throw new BadRequestException('The time limit was exceeded');
    }

    const questions = new Map(quiz.questions.map((q) => [q.id, q]));
    const seen = new Set<string>();
    for (const { questionId } of dto.answers) {
      if (!questions.has(questionId))
        throw new BadRequestException(
          `Question ${questionId} is not part of this quiz`,
        );
      if (seen.has(questionId))
        throw new BadRequestException(`Question ${questionId} answered twice`);
      seen.add(questionId);
    }

    const answers = dto.answers.map(({ questionId, answer, timeTaken }) => {
      const question = questions.get(questionId);
      const late =
        quiz.timeLimitType === 'PER_QUESTION' &&
        !!question.timeLimit &&
        (timeTaken ?? 0) > question.timeLimit + SUBMIT_GRACE_MS / 1000;
      const isCorrect = !late && isAnswerCorrect(question, answer);
      return {
        attemptId,
        questionId,
        answer: JSON.stringify(answer),
        timeTaken: timeTaken ?? 0,
        isCorrect,
        points: isCorrect ? question.points : 0,
      };
    });

    const submittedAt = new Date();
    await this.prisma.$transaction(async (tx) => {
      // Guards against two submissions of the same attempt racing.
      const { count } = await tx.attempt.updateMany({
        where: { id: attemptId, submittedAt: null },
        data: {
          submittedAt,
          timeTaken: submittedAt.getTime() - attempt.startedAt.getTime(),
          score: answers.reduce((sum, a) => sum + a.points, 0),
          maxScore: AttemptsService.maxScore(quiz),
        },
      });
      if (count === 0)
        throw new ConflictException('This attempt was already submitted');
      if (answers.length) await tx.answer.createMany({ data: answers });
    });

    return this.findOne(attemptId, userId);
  }

  private async canSeeResults(userId: string | undefined, quiz: Quiz) {
    return (
      !!userId &&
      !!quiz.organisationId &&
      (await this.membersService.hasModerationRights(
        userId,
        quiz.organisationId,
      ))
    );
  }

  // Your own attempts, anonymous attempts (by their id), and every attempt of
  // a quiz you moderate.
  async findOne(attemptId: string, userId?: string): Promise<AttemptResponse> {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        ...attemptListInclude,
        quiz: { include: { questions: true } },
        Answer: true,
      },
    });
    if (!attempt) throw new NotFoundException();

    const isModerator = await this.canSeeResults(userId, attempt.quiz);
    if (attempt.userId && attempt.userId !== userId && !isModerator)
      throw new UnauthorizedException();

    const revealAnswers = !attempt.quiz.isTest || isModerator;
    const questions = new Map(attempt.quiz.questions.map((q) => [q.id, q]));
    const answers: AttemptAnswerResult[] = attempt.Answer.map((a) => ({
      questionId: a.questionId,
      answer: JSON.parse(a.answer),
      isCorrect: a.isCorrect,
      points: a.points,
      ...(revealAnswers && {
        correctAnswer: questions.get(a.questionId)?.correct ?? [],
      }),
    }));

    return {
      ...this.mapShort({
        ...attempt,
        quiz: { title: attempt.quiz.title },
      }),
      answers,
    };
  }

  private mapShort(attempt: AttemptListItem): AttemptResponseShort {
    return {
      id: attempt.id,
      quizId: attempt.quizId,
      quizTitle: attempt.quiz.title,
      userId: attempt.userId ?? undefined,
      username: attempt.user?.username,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt ?? undefined,
      timeTaken: attempt.timeTaken,
      score: attempt.score,
      maxScore: attempt.maxScore,
    };
  }

  async findMine(userId: string, quizId?: string) {
    const attempts = await this.prisma.attempt.findMany({
      where: {
        userId,
        submittedAt: { not: null },
        ...(quizId && { quizId }),
      },
      include: attemptListInclude,
      orderBy: { submittedAt: 'desc' },
    });

    return attempts.map((a) => this.mapShort(a));
  }

  async results(quizId: string, userId: string): Promise<QuizResultsResponse> {
    const quiz = await this.findQuiz(quizId);
    if (!quiz) throw new NotFoundException();
    if (!(await this.canSeeResults(userId, quiz)))
      throw new UnauthorizedException();

    const attempts = await this.prisma.attempt.findMany({
      where: { quizId, submittedAt: { not: null } },
      include: { ...attemptListInclude, Answer: true },
      orderBy: { submittedAt: 'desc' },
    });

    const questions: QuestionResponseExtended[] = quiz.questions.map((q) => {
      const answers = attempts.flatMap((a) =>
        a.Answer.filter((answer) => answer.questionId === q.id),
      );
      const distribution = new Map<string, number>();
      for (const answer of answers)
        for (const option of JSON.parse(answer.answer) as string[])
          distribution.set(option, (distribution.get(option) ?? 0) + 1);

      return {
        id: q.id,
        question: q.question,
        questionType: q.questionType,
        options: q.options,
        image: q.image ?? undefined,
        timeLimit: q.timeLimit ?? undefined,
        points: q.points,
        correctAnswer: q.correct,
        // Share of all attempts (unanswered counts as wrong).
        correctPercentage: attempts.length
          ? Math.round(
              (answers.filter((a) => a.isCorrect).length / attempts.length) *
                100,
            )
          : 0,
        answerDistribution: [...distribution.entries()].map(
          ([answer, amount]) => ({ answer, amount }),
        ),
      };
    });

    return {
      quizId,
      attemptsAmount: attempts.length,
      averageAttemptScore: attempts.length
        ? Math.round(
            (attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length) *
              100,
          ) / 100
        : 0,
      attempts: attempts.map((a) => this.mapShort(a)),
      questions,
    };
  }
}
