import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuizDto, QuizQuery, UpdateQuizDto } from './quizzes.dto';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createQuizDto: CreateQuizDto, organisationId?: string) {
    const { questions, ...quiz } = createQuizDto;
    const createdQuiz = await this.prisma.quiz.create({
      data: {
        ...quiz,
        ...(organisationId && { organisationId }),
        questions: {
          create: questions,
        },
      },
    });

    return createdQuiz;
  }

  // Query strings arrive as text: "true" / "false" and numbers.
  private static flag(value: unknown) {
    return value === undefined ? undefined : String(value) === 'true';
  }

  async findAll(query: QuizQuery, approval = true) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const size =
      Number(query.size) > 0 ? Math.min(Number(query.size), 100) : 10;
    const isTest = QuizzesService.flag(query.isTest);
    const isRetakeable = QuizzesService.flag(query.isRetakeable);
    const isAnonymousAllowed = QuizzesService.flag(query.isAnonymousAllowed);

    const quizzes = await this.prisma.quiz.findMany({
      where: {
        ...(approval && { isApproved: true }),
        ...(query.title && {
          title: {
            search: query.title.split(' ').join(' | '),
            mode: 'insensitive',
          },
        }),
        ...(query.difficulty && {
          difficulty: query.difficulty,
        }),
        ...(isTest !== undefined && { isTest }),
        ...(isRetakeable !== undefined && { isRetakeable }),
        ...(isAnonymousAllowed !== undefined && { isAnonymousAllowed }),
        ...(query.organisationId && {
          organisationId: query.organisationId,
        }),
      },
      orderBy: {
        ...(query.attribute && {
          [query.attribute]: query.direction || 'asc',
        }),
      },
      include: {
        _count: {
          select: {
            questions: true,
            // Only finished attempts count.
            attempts: { where: { submittedAt: { not: null } } },
          },
        },
        organisation: {
          select: {
            mainImage: true,
            name: true,
          },
        },
      },
      skip: (page - 1) * size,
      take: size,
    });

    return quizzes;
  }

  async findOne(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: {
        id,
      },
      include: {
        questions: true,
        _count: {
          select: {
            // Only finished attempts count.
            attempts: { where: { submittedAt: { not: null } } },
            questions: true,
          },
        },
        organisation: {
          select: {
            mainImage: true,
            name: true,
          },
        },
      },
    });

    return quiz;
  }

  // Average points of the finished attempts.
  async averageScore(quizId: string) {
    const { _avg } = await this.prisma.attempt.aggregate({
      where: { quizId, submittedAt: { not: null } },
      _avg: { score: true },
    });
    return Math.round((_avg.score ?? 0) * 100) / 100;
  }

  // Quizzes are only changed through the organisation they belong to.
  async belongsTo(id: string, organisationId: string) {
    const quiz = await this.prisma.quiz.findFirst({
      where: { id, organisationId },
      select: { id: true },
    });
    return !!quiz;
  }

  async update(id: string, updateQuizDto: UpdateQuizDto) {
    const { questions, ...quiz } = updateQuizDto;
    const updatedQuiz = await this.prisma.quiz.update({
      where: {
        id,
      },
      data: {
        ...quiz,
        ...(questions?.length && {
          questions: {
            create: questions,
          },
        }),
      },
    });

    return updatedQuiz;
  }

  async toggleApprovalStatus(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: {
        id,
      },
    });

    const updatedQuiz = await this.prisma.quiz.update({
      where: {
        id,
      },
      data: {
        isApproved: !quiz.isApproved,
      },
    });

    return updatedQuiz;
  }

  async remove(id: string) {
    await this.prisma.quiz.delete({
      where: {
        id,
      },
    });
  }

  async getWaitingForApproval(organisationId?: string) {
    const quizzes = await this.prisma.quiz.findMany({
      where: {
        isApproved: false,
        ...(organisationId && { organisationId }),
      },
      include: {
        organisation: true,
        _count: {
          select: {
            questions: true,
            // Only finished attempts count.
            attempts: { where: { submittedAt: { not: null } } },
          },
        },
      },
    });

    return quizzes;
  }

  async getSingleWaitingForApproval(id: string, organisationId?: string) {
    const quiz = await this.prisma.quiz.findFirst({
      where: {
        id,
        ...(organisationId && { organisationId }),
      },
      include: {
        organisation: true,
        _count: {
          select: {
            questions: true,
            // Only finished attempts count.
            attempts: { where: { submittedAt: { not: null } } },
          },
        },
        questions: true,
      },
    });

    return quiz;
  }
}
