import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { NotificationUsersService } from './notification-users.service';
import { CreateNotificationUserDto } from './dto/create-notification-user.dto';
import { UpdateNotificationUserDto } from './dto/update-notification-user.dto';

@Controller('notification-users')
export class NotificationUsersController {
  constructor(
    private readonly notificationUsersService: NotificationUsersService,
  ) {}

  @Post()
  create(@Body() createNotificationUserDto: CreateNotificationUserDto) {
    return this.notificationUsersService.create(createNotificationUserDto);
  }

  @Get()
  findAll() {
    return this.notificationUsersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationUsersService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNotificationUserDto: UpdateNotificationUserDto,
  ) {
    return this.notificationUsersService.update(+id, updateNotificationUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationUsersService.remove(+id);
  }
}
