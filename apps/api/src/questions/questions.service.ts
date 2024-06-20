import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateQuestionDto,
  QuestionQuery,
  UpdateQuestionDto,
} from './questions.dto';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async hasEditPermission(questionId: string, userId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      select: {
        quiz: {
          select: {
            organisationId: true,
          },
        },
      },
    });

    if (!question) return false;

    const member = await this.prisma.organisationUser.findFirst({
      where: {
        userId,
        organisationId: question.quiz.organisationId,
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
