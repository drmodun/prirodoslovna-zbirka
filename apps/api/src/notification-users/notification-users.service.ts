import { NotificationResponse } from '@biosfera/types';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationUsersService {
  private clients: Map<string, Subject<MessageEvent<NotificationResponse>>> =
    new Map();

  private readonly prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  public subscribeToNotifications(userId: string) {
    const subject = new Subject<MessageEvent<NotificationResponse>>();
    this.clients.set(userId, subject);
    return subject;
  }

  public publishNotification(userId: string, message: NotificationResponse) {
    try {
      const client = this.clients.get(userId);
      if (client) {
        client.next({ data: message } as MessageEvent<NotificationResponse>);
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  public removeClient(userId: string) {
    this.clients.delete(userId);
  }

  public markAsRead(notificationId: string, userId: string) {
    return this.prisma.userNotification.updateMany({
      where: {
        notificationId,
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  public markAllAsRead(userId: string) {
    return this.prisma.userNotification.updateMany({
      where: {
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  public getAllForUser(userId: string) {
    return this.prisma.userNotification.findMany({
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

//If performance issues are detected, move this to an external service
