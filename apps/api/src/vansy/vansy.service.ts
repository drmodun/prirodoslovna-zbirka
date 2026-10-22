import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JWTVerifyGetKey } from 'jose';
import { MembersService } from 'src/members/members.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { VansyClient } from './vansy.client';
import { VANSY_CONFIG, VansyConfig } from './vansy.config';
import {
  VansyLaunchRequest,
  VansyQuizSummary,
  VansyWebhookEvent,
} from './vansy.types';
import {
  InvalidWebhookError,
  vansyKeys,
  verifyVansyWebhook,
} from './webhook-verifier';

// Quizzes belong to an organisation
export const ownerRefOf = (organisationId: string) => `org:${organisationId}`;
const organisationOf = (ownerRef: string) =>
  ownerRef.startsWith('org:') ? ownerRef.slice('org:'.length) : null;

/**
 * Biosfera's side of Vansy. The rights stay here (MembersService); a launch
 * tells Vansy what the person may do there, and Vansy reports results back.
 */
@Injectable()
export class VansyService {
  private keys: JWTVerifyGetKey | null = null;

  constructor(
    private readonly client: VansyClient,
    private readonly members: MembersService,
    private readonly prisma: PrismaService,
    @Inject(VANSY_CONFIG) private readonly config: VansyConfig | null,
  ) {}

  private settings() {
    if (!this.config)
      throw new ServiceUnavailableException('Vansy is not configured');
    return this.config;
  }

  private async subject(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return {
      externalUserId: user.id,
      displayName: `${user.firstName} ${user.lastName}`.trim(),
    };
  }

  private async language(userId?: string) {
    if (!userId) return 'hr';
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return user?.language === 'EN' ? 'en' : 'hr';
  }

  private returnUrl(organisationId: string) {
    return `${this.settings().frontendUrl}/organisation/${organisationId}`;
  }

  private launch(body: object) {
    return this.client.launch(body as VansyLaunchRequest);
  }

  /** Organisation admins author; moderators may also approve (zbirka's approval flow) */
  async authorLaunch(userId: string, organisationId: string) {
    if (!(await this.members.hasAdminRights(userId, organisationId)))
      throw new ForbiddenException(
        "You don't have admin rights for this organisation",
      );
    const moderate = await this.members.hasModerationRights(
      userId,
      organisationId,
    );

    return this.launch({
      action: 'author',
      subject: await this.subject(userId),
      capabilities: moderate ? ['author', 'moderate'] : ['author'],
      scope: { ownerRef: ownerRefOf(organisationId) },
      returnUrl: this.returnUrl(organisationId),
      locale: await this.language(userId),
    });
  }

  /** The approval queue and integrity reviews of an organisation's quizzes */
  async reviewLaunch(userId: string, organisationId: string) {
    if (!(await this.members.hasModerationRights(userId, organisationId)))
      throw new ForbiddenException('You cannot moderate this organisation');

    return this.launch({
      action: 'review',
      subject: await this.subject(userId),
      capabilities: ['moderate'],
      scope: { ownerRef: ownerRefOf(organisationId) },
      returnUrl: this.returnUrl(organisationId),
      locale: await this.language(userId),
    });
  }

  private async quizOf(organisationId: string, quizId: string) {
    const quiz = await this.client.getQuiz(quizId);
    if (quiz.ownerRef !== ownerRefOf(organisationId))
      throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async proctorLaunch(userId: string, organisationId: string, quizId: string) {
    if (!(await this.members.hasModerationRights(userId, organisationId)))
      throw new ForbiddenException('You cannot moderate this organisation');
    await this.quizOf(organisationId, quizId);

    return this.launch({
      action: 'proctor',
      subject: await this.subject(userId),
      capabilities: ['proctor'],
      scope: { quizId },
      returnUrl: this.returnUrl(organisationId),
      locale: await this.language(userId),
    });
  }

  /**
   * Anyone may take a published quiz; without a login only when the quiz
   * allows anonymous takers (Vansy enforces that too).
   */
  async takeLaunch(quizId: string, userId?: string) {
    const quiz = await this.client.getQuiz(quizId);
    const organisationId = organisationOf(quiz.ownerRef);
    if (quiz.publishState !== 'PUBLISHED' || !organisationId)
      throw new NotFoundException('Quiz not found');
    if (!userId && !quiz.isAnonymousAllowed)
      throw new UnauthorizedException('This quiz needs a sign-in');

    return this.launch({
      action: 'take',
      ...(userId && { subject: await this.subject(userId) }),
      scope: { quizId },
      returnUrl: this.returnUrl(organisationId),
      locale: await this.language(userId),
    });
  }

  /**
   * An organisation's quizzes: published ones for everyone; all of them for
   * its admins and moderators, who also see the ones waiting for approval.
   */
  async organisationQuizzes(organisationId: string, userId?: string) {
    const staff =
      !!userId &&
      (await this.members.hasModerationRights(userId, organisationId));
    const { results } = await this.client.listQuizzes({
      ownerRef: ownerRefOf(organisationId),
      ...(!staff && { publishState: 'PUBLISHED' }),
    });
    return results.map((quiz: VansyQuizSummary) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      coverImage: quiz.coverImage,
      difficulty: quiz.difficulty,
      publishState: quiz.publishState,
      questionCount: quiz.questionCount,
      maxScore: quiz.maxScore,
      timeLimitTotalSec: quiz.timeLimitTotalSec,
      isAnonymousAllowed: quiz.isAnonymousAllowed,
    }));
  }

  myResults(userId: string) {
    return this.prisma.vansyAttemptResult.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      take: 100,
    });
  }

  async receiveWebhook(rawBody: Buffer | undefined, signature?: string) {
    const config = this.settings();
    if (!rawBody) throw new UnauthorizedException('Invalid Vansy-Signature');

    let event: VansyWebhookEvent;
    try {
      this.keys ??= vansyKeys(config);
      event = await verifyVansyWebhook(
        this.keys,
        config.tenantId,
        rawBody,
        signature,
      );
    } catch (error) {
      if (error instanceof InvalidWebhookError)
        throw new UnauthorizedException(error.message);
      throw error;
    }

    // Vansy delivers at least once; an event is applied once
    const claimed = await this.prisma.vansyWebhookEvent.createMany({
      data: [{ eventId: event.eventId, type: event.type }],
      skipDuplicates: true,
    });
    if (claimed.count === 0) return { received: true, duplicate: true };

    if (
      event.type === 'attempt.completed' ||
      event.type === 'attempt.reviewed'
    ) {
      const a = event.attempt;
      const userId = a.subject?.externalUserId ?? null;
      const user = userId
        ? await this.prisma.user.findUnique({ where: { id: userId } })
        : null;
      const quiz = await this.client.getQuiz(a.quizId).catch(() => null);
      const data = {
        vansyQuizId: a.quizId,
        organisationId: quiz ? organisationOf(quiz.ownerRef) : null,
        userId: user?.id ?? null,
        status: a.status,
        score: a.score,
        maxScore: a.maxScore,
        percent: a.percent,
        passed: a.passed,
        durationMs: a.durationMs,
        reviewStatus: a.integrity.reviewStatus,
        submittedAt: a.submittedAt ? new Date(a.submittedAt) : null,
      };
      await this.prisma.vansyAttemptResult.upsert({
        where: { attemptId: a.id },
        create: { attemptId: a.id, ...data },
        update: data,
      });
    }
    return { received: true, duplicate: false };
  }
}
