import { NotificationResponse } from '@biosfera/types';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationUsersService {
  constructor(
    private eventEmitter: EventEmitter2,
    private readonly prisma: PrismaService,
  ) {}

  public async publishNotification(
    userId: string,
    message: NotificationResponse,
  ) {
    console.log('Publishing notification to user', userId);
    try {
      await this.eventEmitter.emitAsync(userId, message);
    } catch (error) {
      console.error('Error publishing notification', error);
      throw new BadRequestException(error);
    }
  }

  public async publishManyNotifications(
    userIds: string[],
    message: NotificationResponse,
  ) {
    const promises = userIds.map((userId) =>
      this.publishNotification(userId, message),
    );

    return await Promise.all(promises);
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

//If performance issues are detected, move this to an external service
