import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateQuestionDto,
  QuestionQuery,
  UpdateQuestionDto,
} from './questions.dto';
import { isModeratorRole } from 'src/auth/roles';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  // Admins and owners of the quiz's organisation, and platform moderators.
  async hasQuizEditPermission(quizId: string, userId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: { organisationId: true },
    });

    if (!quiz) return false;

    const user = await this.prisma.user.findFirst({ where: { id: userId } });
    if (isModeratorRole(user?.role)) return true;

    const member = await this.prisma.organisationUser.findFirst({
      where: {
        userId,
        organisationId: quiz.organisationId,
        OR: [
          {
            role: 'ADMIN',
          },
          {
            role: 'OWNER',
          },
        ],
      },
    });

    return member !== null;
  }

  // As above, for a question that must belong to the given quiz.
  async hasEditPermission(questionId: string, userId: string, quizId?: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      select: { quizId: true },
    });

    if (!question || (quizId && question.quizId !== quizId)) return false;

    return await this.hasQuizEditPermission(question.quizId, userId);
  }

  async create(createQuestionDto: CreateQuestionDto) {
    await this.prisma.question.create({
      data: {
        quiz: {
          connect: {
            id: createQuestionDto.quizId,
          },
        },
        question: createQuestionDto.question,
        questionType: createQuestionDto.questionType,
        correct: createQuestionDto.correct,
        options: createQuestionDto.options,
        image: createQuestionDto.image,
        points: createQuestionDto.points,
        timeLimit: createQuestionDto.timeLimit,
      },
    });
  }

  async findAll(query: QuestionQuery) {
    return await this.prisma.question.findMany({
      where: {
        ...(query.quizId && {
          quizId: query.quizId,
        }),
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.question.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto) {
    await this.prisma.question.update({
      where: { id },
      data: {
        question: updateQuestionDto.question,
        questionType: updateQuestionDto.questionType,
        correct: updateQuestionDto.correct,
        options: updateQuestionDto.options,
        image: updateQuestionDto.image,
        points: updateQuestionDto.points,
        timeLimit: updateQuestionDto.timeLimit,
      },
    });
  }

  async remove(id: string) {
    await this.prisma.question.delete({
      where: { id },
    });
  }
}
