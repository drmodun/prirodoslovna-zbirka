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
import { OwnStreamGuard } from './own-stream.guard';
import { NotificationResponse } from '@biosfera/types';
import { fromEvent, map, Observable } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { localiseNotification } from 'src/notifications/notification-messages';

@ApiTags('notification-users')
@Controller('notification-users')
export class NotificationUsersController {
  constructor(
    private readonly notificationUsersService: NotificationUsersService,
    private eventEmitter: EventEmitter2,
  ) {}
  // Browsers subscribe with fetch-event-source, which can send the token.
  @UseGuards(JwtAuthGuard, OwnStreamGuard)
  @ApiBearerAuth()
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
    const [notifications, language] = await Promise.all([
      this.notificationUsersService.getAllForUser(userId),
      this.notificationUsersService.getLanguage(userId),
    ]);

    return notifications.map(({ notification, isRead, notificationId }) => {
      const { title, text } = localiseNotification(notification, language);
      return {
        createdAt: notification.createdAt,
        id: notificationId,
        notificationImage: notification.notificationImage,
        title,
        link: notification.link,
        read: isRead,
        text: text ?? '',
        type: notification.type,
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
