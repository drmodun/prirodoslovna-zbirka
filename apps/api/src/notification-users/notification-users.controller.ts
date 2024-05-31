import {
  Controller,
  UseGuards,
  Sse,
  Req,
  Delete,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import { NotificationUsersService } from './notification-users.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { NotificationResponse } from '@biosfera/types';

@Controller('notification-users')
export class NotificationUsersController {
  constructor(
    private readonly notificationUsersService: NotificationUsersService,
  ) {}
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Sse('subscribe')
  async subscribeToNotifications(@Req() req: any) {
    const userId = req.user?.id;
    const client =
      this.notificationUsersService.subscribeToNotifications(userId);

    return client.asObservable();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('unsubscribe')
  async unsubscribe(@Req() req: any) {
    const userId = req.user?.id;
    this.notificationUsersService.removeClient(userId);

    return;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  async getNotifications(@Req() req: any): Promise<NotificationResponse[]> {
    const userId = req.user?.id;
    const notifications = await this.notificationUsersService.getAllForUser(
      userId,
    );

    return notifications.map((notification) => notification.notification);
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
