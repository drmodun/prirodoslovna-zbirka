import { Injectable } from '@nestjs/common';
import { CreateNotificationUserDto } from './dto/create-notification-user.dto';
import { UpdateNotificationUserDto } from './dto/update-notification-user.dto';

@Injectable()
export class NotificationUsersService {
  create(createNotificationUserDto: CreateNotificationUserDto) {
    return 'This action adds a new notificationUser';
  }

  findAll() {
    return `This action returns all notificationUsers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notificationUser`;
  }

  update(id: number, updateNotificationUserDto: UpdateNotificationUserDto) {
    return `This action updates a #${id} notificationUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} notificationUser`;
  }
}
