import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  isNotificationMessageKey,
  renderNotificationMessage,
} from './notification-messages';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createNotificationDto: CreateNotificationDto,
    userIds: string[],
  ) {
    const { messageKey, params } = createNotificationDto;
    if (!isNotificationMessageKey(messageKey))
      throw new BadRequestException('Unknown notification message');

    const notification = await this.prisma.notification.create({
      data: {
        ...createNotificationDto,
        // An English copy; readers get it rendered in their own language.
        ...renderNotificationMessage(messageKey, params),
        UserNotification: {
          createMany: {
            data: userIds.map((userId) => ({ userId })),
          },
        },
      },
      include: {
        UserNotification: {
          select: {
            userId: true,
          },
        },
      },
    });

    return notification;
  }
}
