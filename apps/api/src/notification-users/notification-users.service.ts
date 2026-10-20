import { NotificationResponse } from '@biosfera/types';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { NotificationBusService } from 'src/notification-bus/notification-bus.service';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationUsersService {
  constructor(
    private readonly bus: NotificationBusService,
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

  private readonly logger = new Logger(NotificationUsersService.name);

  public async publishNotification(
    userId: string,
    message: NotificationResponse,
  ) {
    await this.publishToBus(userId, message);
    await this.sendEmails([userId], message);
  }

  public async publishManyNotifications(
    userIds: string[],
    message: NotificationResponse,
  ) {
    const results = await Promise.all(
      userIds.map((userId) => this.publishToBus(userId, message)),
    );
    await this.sendEmails(userIds, message);

    return results;
  }

  private async publishToBus(userId: string, message: NotificationResponse) {
    console.log('Publishing notification to user', userId);
    try {
      await this.bus.publish(userId, message);
    } catch (error) {
      console.error('Error publishing notification', error);
      throw new BadRequestException(error);
    }
  }

  // Best effort: a mail failure must not fail the action that caused the
  // notification. One query finds every recipient, the mails go out together.
  private async sendEmails(userIds: string[], message: NotificationResponse) {
    if (!userIds.length) return;

    try {
      const users = await this.prisma.user.findMany({
        where: {
          id: { in: userIds },
          isActivated: true,
          isEmailNotificationsEnabled: true,
        },
        select: { id: true, email: true },
      });

      const baseUrl = process.env.WEB_URL || 'http://localhost:3000';
      const text = [message.text, message.link && `${baseUrl}${message.link}`]
        .filter(Boolean)
        .join('\n\n');

      await Promise.all(
        users.map((user) =>
          this.email
            .sendMail(user.email, message.title, text)
            .catch((error) =>
              this.logger.error(
                `Could not mail notification to ${user.id}`,
                error,
              ),
            ),
        ),
      );
    } catch (error) {
      this.logger.error('Could not mail notifications', error);
    }
  }

  public async markAsRead(notificationId: string, userId: string) {
    return await this.prisma.userNotification.updateMany({
      where: {
        notificationId,
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  public async markAllAsRead(userId: string) {
    return await this.prisma.userNotification.updateMany({
      where: {
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  public async getAllForUser(userId: string) {
    return await this.prisma.userNotification.findMany({
      where: {
        userId,
      },
      include: {
        notification: {
          include: {
            UserNotification: true,
          },
        },
      },
    });
  }
}
