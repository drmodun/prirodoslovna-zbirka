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
  NotFoundException,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import {
  CreateQuestionDto,
  QuestionQuery,
  UpdateQuestionDto,
} from './questions.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { QuestionResponse, QuestionResponseExtended } from '@biosfera/types';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':quizId')
  async create(
    @Body() createQuestionDto: CreateQuestionDto,
    @Param('quizId') quizId: string,
    @Req() req: any,
  ) {
    const isAllowed = await this.questionsService.hasQuizEditPermission(
      quizId,
      req.user.id,
    );
    if (!isAllowed) throw new UnauthorizedException();
    createQuestionDto.quizId = quizId;
    return await this.questionsService.create(createQuestionDto);
  }

  // Public: the correct answers stay hidden until a quiz is taken. Admins
  // read them through the quiz review endpoints.
  @Get()
  async findAll(@Query() query: QuestionQuery) {
    const questions = await this.questionsService.findAll(query);
    const mapped: QuestionResponse[] = questions.map((question) => {
      return {
        id: question.id,
        question: question.question,
        questionType: question.questionType,
        options: question.options,
        image: question.image,
        points: question.points,
        timeLimit: question.timeLimit,
      } as QuestionResponse;
    });

    return mapped;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const question = await this.questionsService.findOne(id);
    if (!question) throw new NotFoundException();
    const mapped = {
      id: question.id,
      question: question.question,
      questionType: question.questionType,
      options: question.options,
      image: question.image,
      points: question.points,
      timeLimit: question.timeLimit,
      correctPercentage: 0,
      answerDistribution: [], //TODO: implement after quiz answer functionality
    } as QuestionResponseExtended;
    return mapped;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':quizId/:id')
  async update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
    @Req() req: any,
    @Param('quizId') quizId: string,
  ) {
    const isAllowed = await this.questionsService.hasEditPermission(
      id,
      req.user.id,
      quizId,
    );
    if (!isAllowed) throw new UnauthorizedException();
    return await this.questionsService.update(id, updateQuestionDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':quizId/:id')
  async remove(
    @Param('id') id: string,
    @Req() req: any,
    @Param('quizId') quizId: string,
  ) {
    const isAllowed = await this.questionsService.hasEditPermission(
      id,
      req.user.id,
      quizId,
    );
    if (!isAllowed) throw new UnauthorizedException();
    return this.questionsService.remove(id);
  }
}
