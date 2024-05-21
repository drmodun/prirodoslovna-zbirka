import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Sse,
  Req,
} from '@nestjs/common';
import { NotificationUsersService } from './notification-users.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';

@Controller('notification-users')
export class NotificationUsersController {
  constructor(
    private readonly notificationUsersService: NotificationUsersService,
  ) {}
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Sse('notification')
  async subscribeToNotifications(@Req() req: any) {
    const userId = req.user?.id;
    const client =
      this.notificationUsersService.subscribeToNotifications(userId);

    return client.asObservable();
  }
}