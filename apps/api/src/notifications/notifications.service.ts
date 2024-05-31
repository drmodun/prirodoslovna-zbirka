import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createNotificationDto: CreateNotificationDto,
    userIds: string[],
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        ...createNotificationDto,
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
