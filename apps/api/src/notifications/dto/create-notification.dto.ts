import { NotificationTypeEnumType } from '@biosfera/types';

export interface CreateNotificationDto {
  title: string;
  text: string;
  link: string;
  notificationImage: string;
  type: NotificationTypeEnumType;
}
