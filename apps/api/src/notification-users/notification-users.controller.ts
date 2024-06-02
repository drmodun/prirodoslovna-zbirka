import {
  Controller,
  UseGuards,
  Sse,
  Req,
  Get,
  Patch,
  Param,
  MessageEvent,
} from '@nestjs/common';
import { NotificationUsersService } from './notification-users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { NotificationResponse } from '@biosfera/types';
import { fromEvent, map, Observable } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';

@ApiTags('notification-users')
@Controller('notification-users')
export class NotificationUsersController {
  constructor(
    private readonly notificationUsersService: NotificationUsersService,
    private eventEmitter: EventEmitter2,
  ) {}
  @Sse('/subscribe/:userId')
  async sse(
    @Param('userId') userId: string,
  ): Promise<Observable<MessageEvent>> {
    return fromEvent(this.eventEmitter, userId).pipe(
      map((payload: MessageEvent) => ({
        data: JSON.stringify(payload),
      })),
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  async getNotifications(@Req() req: any): Promise<NotificationResponse[]> {
    const userId = req.user?.id;
    const notifications =
      await this.notificationUsersService.getAllForUser(userId);

    return notifications.map((notification) => {
      return {
        createdAt: notification.notification.createdAt,
        id: notification.notificationId,
        notificationImage: notification.notification.notificationImage,
        title: notification.notification.title,
        link: notification.notification.link,
        read: notification.isRead,
        text: notification.notification.text ?? '',
        type: notification.notification.type,
      } as NotificationResponse;
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('read/all')
  async markAllAsRead(@Req() req: any) {
    const userId = req.user?.id;
    return await this.notificationUsersService.markAllAsRead(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('read/:id')
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return await this.notificationUsersService.markAsRead(id, userId);
  }
}
