import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { OptionalJwtAuthGuard } from 'src/auth/optional-jwt-auth-guard';
import { AttemptsService } from './attempts.service';
import { SubmitAttemptDto } from './attempts.dto';

@ApiTags('attempts')
@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  // Starts (or resumes) an attempt. Anonymous visitors may take quizzes that
  // allow it.
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @Post('quiz/:quizId')
  async start(@Param('quizId') quizId: string, @Req() req: any) {
    return await this.attemptsService.start(quizId, req.user?.id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/submit')
  async submit(
    @Param('id') id: string,
    @Body() submitAttemptDto: SubmitAttemptDto,
    @Req() req: any,
  ) {
    return await this.attemptsService.submit(
      id,
      submitAttemptDto,
      req.user?.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'quizId', required: false })
  @Get('mine')
  async findMine(@Req() req: any, @Query('quizId') quizId?: string) {
    return await this.attemptsService.findMine(req.user.id, quizId);
  }

  // Every submitted attempt and per-question statistics, for the quiz's
  // organisation admins and platform moderators.
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('quiz/:quizId/results')
  async results(@Param('quizId') quizId: string, @Req() req: any) {
    return await this.attemptsService.results(quizId, req.user.id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return await this.attemptsService.findOne(id, req.user?.id);
  }
}
