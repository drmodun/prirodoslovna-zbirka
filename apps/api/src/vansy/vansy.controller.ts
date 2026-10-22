import {
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { OptionalJwtAuthGuard } from 'src/auth/optional-jwt-auth-guard';
import { VansyService } from './vansy.service';

// Every launch answers { launchUrl, expiresAt }; the browser opens launchUrl
// within a minute and lands in Vansy with a session of its own.
@ApiTags('quiz-launch')
@Controller('quiz-launch')
export class VansyController {
  constructor(private readonly vansy: VansyService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Open the Vansy editor for the organisation' })
  @Post('author/:organisationId')
  author(@Param('organisationId') organisationId: string, @Req() req: any) {
    return this.vansy.authorLaunch(req.user.id, organisationId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('review/:organisationId')
  review(@Param('organisationId') organisationId: string, @Req() req: any) {
    return this.vansy.reviewLaunch(req.user.id, organisationId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('proctor/:organisationId/:quizId')
  proctor(
    @Param('organisationId') organisationId: string,
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Req() req: any,
  ) {
    return this.vansy.proctorLaunch(req.user.id, organisationId, quizId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @Post('take/:quizId')
  take(@Param('quizId', ParseUUIDPipe) quizId: string, @Req() req: any) {
    return this.vansy.takeLaunch(quizId, req.user?.id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: "The organisation's quizzes on Vansy" })
  @Get('organisation/:organisationId/quizzes')
  quizzes(@Param('organisationId') organisationId: string, @Req() req: any) {
    return this.vansy.organisationQuizzes(organisationId, req.user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('results/mine')
  mine(@Req() req: any) {
    return this.vansy.myResults(req.user.id);
  }
}

@Controller('integrations/vansy')
export class VansyWebhookController {
  constructor(private readonly vansy: VansyService) {}

  @ApiExcludeEndpoint()
  @HttpCode(200)
  @Post('webhook')
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('vansy-signature') signature?: string,
  ) {
    return this.vansy.receiveWebhook(req.rawBody, signature);
  }
}
