import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, QuizQuery, UpdateQuizDto } from './quizzes.dto';
import { OrganisationsService } from 'src/organisations/organisations.service';
import { AuthController } from 'src/auth/auth.controller';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ExponatsService } from 'src/exponats/exponats.service';
import { MembersService } from 'src/members/members.service';
import {
  QuestionResponse,
  QuestionResponseExtended,
  QuizResponseExtended,
  QuizResponseShort,
} from '@biosfera/types';
@Controller('quizzes')
export class QuizzesController {
  constructor(
    private readonly quizzesService: QuizzesService,
    private readonly membersService: MembersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':organisationId')
  async create(
    @Body() createQuizDto: CreateQuizDto,
    @Param('organisationId') organisation: string,
    @Req() req: any,
  ) {
    const isValid = await this.membersService.hasAdminRights(
      req.user.id,
      organisation,
    );

    if (!isValid) throw new UnauthorizedException();
    await this.quizzesService.create(createQuizDto);
  }

  @Get()
  async findAll(@Query() query: QuizQuery) {
    const quizzes = await this.quizzesService.findAll(query);

    const mapped: QuizResponseShort[] = quizzes.map((quiz) => {
      return {
        id: quiz.id,
        title: quiz.title,
        difficulty: quiz.difficulty,
        isTest: quiz.isTest,
        attemptsAmount: quiz._count.attempts,
        description: quiz.description,
        organisationMainImage: quiz.organisation.mainImage,
        organisationName: quiz.organisation.mainImage,
        questionAmount: quiz._count.questions,
        timeLimitTotal: quiz.timeLimitTotal,
        isRetakeable: quiz.isRetakeable,
        isAnonymousAllowed: quiz.isAnonymousAllowed,
        coverImage: quiz.coverImage,
        organisationId: quiz.organisationId,
        updatedAt: quiz.updatedAt,
      } as QuizResponseShort;
    });

    return mapped;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const quiz = await this.quizzesService.findOne(id);

    const questionsMapped: QuestionResponse[] = quiz.questions.map(
      (question) => {
        return {
          id: question.id,
          questionType: question.questionType,
          timeLimit: question.timeLimit,
          options: question.options,
          question: question.question,
          image: question.image,
        } as QuestionResponse;
      },
    );

    const mapped: QuizResponseExtended = {
      attemptsAmount: quiz._count.attempts,
      averageAttemptScore: 0, //TODO: implement fast calculation function here
      description: quiz.description,
      difficulty: quiz.difficulty,
      isAnonymousAllowed: quiz.isAnonymousAllowed,
      isRetakeable: quiz.isRetakeable,
      id: quiz.id,
      isTest: quiz.isTest,
      organisationId: quiz.organisationId,
      organisationMainImage: quiz.organisation.mainImage,
      organisationName: quiz.organisation.name,
      questions: questionsMapped,
      questionAmount: quiz._count.questions,
      title: quiz.title,
      updatedAt: quiz.updatedAt,
      timeLimitTotal: quiz.timeLimitTotal,
      coverImage: quiz.coverImage,
    };

    return mapped;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':organisationId/:id')
  async update(
    @Param('id') id: string,
    @Body() updateQuizDto: UpdateQuizDto,
    @Req() req: any,
    @Param('organisationId') organisation: string,
  ) {
    const isValid = await this.membersService.hasAdminRights(
      req.user.id,
      organisation,
    );

    if (!isValid) throw new UnauthorizedException();

    return await this.quizzesService.update(id, updateQuizDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':orgnisationId/:id')
  async remove(
    @Param('id') id: string,
    @Req() req: any,
    @Param('organisationId') organisation: string,
  ) {
    const isValid = await this.membersService.hasAdminRights(
      req.user.id,
      organisation,
    );

    if (!isValid) throw new UnauthorizedException();
    return await this.quizzesService.remove(id);
  }
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':organisationId/:id/approval')
  async toggleApproval(
    @Param('id') id: string,
    @Req() req: any,
    @Param('organisationId') organisation: string,
  ) {
    const isValid = await this.membersService.hasAdminRights(
      req.user.id,
      organisation,
    );

    if (!isValid) throw new UnauthorizedException();

    return await this.quizzesService.toggleApprovalStatus(id);
  }
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':organisationId/non-approved')
  async getQuizzesWaitingForApproval(
    @Param('organisationId') organisation: string,
    @Req() req: any,
  ) {
    const isValid = await this.membersService.hasAdminRights(
      req.user.id,
      organisation,
    );
    if (!isValid) throw new UnauthorizedException();
    const quiz = await this.quizzesService.getWaitingForApproval();
    const mapped = quiz.map((quiz) => {
      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        coverImage: quiz.coverImage,
        isRetakeable: quiz.isRetakeable,
        questionAmount: quiz._count.questions,
        attemptsAmount: quiz._count.attempts,
        organisationId: quiz.organisationId,
        organisationName: quiz.organisation.name,
        organisationMainImage: quiz.organisation.mainImage,
        isTest: quiz.isTest,
        timeLimitTotal: quiz.timeLimitTotal,
        difficulty: quiz.difficulty,
        isAnonymousAllowed: quiz.isAnonymousAllowed,
        updatedAt: quiz.updatedAt,
      } as QuizResponseShort;
    });
    return mapped;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':organisationId/non-approved/:id')
  async getQuizWaitingForApproval(
    @Param('organisationId') organisation: string,
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const isValid = await this.membersService.hasAdminRights(
      req.user.id,
      organisation,
    );
    if (!isValid) throw new UnauthorizedException();
    const quiz = await this.quizzesService.getSingleWaitingForApproval(id);
    const questions = quiz.questions.map((question) => {
      return {
        id: question.id,
        question: question.question,
        questionType: question.questionType,
        correct: question.correct,
        options: question.options,
        image: question.image,
        points: question.points,
        timeLimit: question.timeLimit,
      } as QuestionResponse;
    });
    const mapped = {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      coverImage: quiz.coverImage,
      isRetakeable: quiz.isRetakeable,
      questionAmount: quiz._count.questions,
      attemptsAmount: quiz._count.attempts,
      organisationId: quiz.organisationId,
      organisationName: quiz.organisation.name,
      organisationMainImage: quiz.organisation.mainImage,
      isTest: quiz.isTest,
      timeLimitTotal: quiz.timeLimitTotal,
      difficulty: quiz.difficulty,
      isAnonymousAllowed: quiz.isAnonymousAllowed,
      updatedAt: quiz.updatedAt,
      averageAttemptScore: 0,
      questions,
    } as QuizResponseExtended;

    return mapped;
  }
}
