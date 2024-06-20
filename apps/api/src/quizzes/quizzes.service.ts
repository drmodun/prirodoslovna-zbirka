import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuizDto, QuizQuery, UpdateQuizDto } from './quizzes.dto';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createQuizDto: CreateQuizDto) {
    const createdQuiz = await this.prisma.quiz.create({
      data: {
        ...createQuizDto,
        questions: {
          create: createQuizDto.questions,
        },
      },
    });

    return createdQuiz;
  }

  async findAll(query: QuizQuery) {
    const quizzes = await this.prisma.quiz.findMany({
      where: {
        ...(query.title && {
          title: {
            search: query.title.split(' ').join(' | '),
            mode: 'insensitive',
          },
        }),
        ...(query.difficulty && {
          difficulty: query.difficulty,
        }),
        ...(query.isTest && {
          category: query.isTest,
        }),
        ...(query.isRetakeable && {
          isRetakeable: query.isRetakeable,
        }),
        ...(query.isAnonymousAllowed && {
          isAnonymousAllowed: query.isAnonymousAllowed,
        }),
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
            attempts: true,
          },
        },
        organisation: {
          select: {
            mainImage: true,
            name: true,
          },
        },
      },
      skip: query.page - 1 * query.size,
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
            attempts: true,
            questions: true,
          },
        },
        organisation: {
          select: {
            mainImage: true,
            name: true,
          },
        },
        attempts: {
          where: {
            timeTaken: {
              not: null,
            },
          },
          include: {
            Answer: true,
          },
        },
      },
    });

    return quiz;
  }

  async update(id: string, updateQuizDto: UpdateQuizDto) {
    const updatedQuiz = await this.prisma.quiz.update({
      where: {
        id,
      },
      data: {
        ...updateQuizDto,
        questions: {
          create: updateQuizDto.questions,
        },
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
}
