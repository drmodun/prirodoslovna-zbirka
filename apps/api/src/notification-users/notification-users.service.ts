import { NotificationResponse } from '@biosfera/types';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { NotificationBusService } from 'src/notification-bus/notification-bus.service';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Language } from '@prisma/client';
import { localiseNotification } from 'src/notifications/notification-messages';

// A stored notification, as NotificationsService.create returns it.
export interface PublishedNotification {
  id: string;
  title: string;
  text?: string | null;
  link?: string | null;
  notificationImage?: string | null;
  createdAt: Date;
  type: string;
  messageKey?: string | null;
  params?: unknown;
}

interface Recipient {
  id: string;
  email: string;
  language: Language;
  isActivated: boolean;
  isEmailNotificationsEnabled: boolean;
}

const toResponse = (
  notification: PublishedNotification,
): NotificationResponse => ({
  id: notification.id,
  title: notification.title,
  text: notification.text ?? '',
  link: notification.link ?? undefined,
  notificationImage: notification.notificationImage ?? undefined,
  createdAt: notification.createdAt,
  type: notification.type as NotificationResponse['type'],
});

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
    notification: PublishedNotification,
  ) {
    await this.publishManyNotifications([userId], notification);
  }

  // Every recipient gets the notification in their own language, live and by
  // mail.
  public async publishManyNotifications(
    userIds: string[],
    notification: PublishedNotification,
  ) {
    if (!userIds.length) return [];

    // Without the recipients the notification still goes out live, in English.
    const recipients = await this.prisma.user
      .findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          email: true,
          language: true,
          isActivated: true,
          isEmailNotificationsEnabled: true,
        },
      })
      .catch((error): Recipient[] => {
        this.logger.error('Could not load notification recipients', error);
        return [];
      });
    const byId = new Map(recipients.map((user) => [user.id, user]));
    const messageFor = (userId: string) =>
      toResponse(
        localiseNotification(notification, byId.get(userId)?.language),
      );

    const results = await Promise.all(
      userIds.map((userId) => this.publishToBus(userId, messageFor(userId))),
    );
    await this.sendEmails(
      recipients.filter(
        (user) => user.isActivated && user.isEmailNotificationsEnabled,
      ),
      messageFor,
    );

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
  // notification. The mails go out together.
  private async sendEmails(
    users: { id: string; email: string }[],
    messageFor: (userId: string) => NotificationResponse,
  ) {
    const baseUrl = process.env.WEB_URL || 'http://localhost:3000';

    await Promise.all(
      users.map((user) => {
        const message = messageFor(user.id);
        const text = [message.text, message.link && `${baseUrl}${message.link}`]
          .filter(Boolean)
          .join('\n\n');

        return this.email
          .sendMail(user.email, message.title, text)
          .catch((error) =>
            this.logger.error(
              `Could not mail notification to ${user.id}`,
              error,
            ),
          );
      }),
    );
  }

  public async getLanguage(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { language: true },
    });
    return user?.language;
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
