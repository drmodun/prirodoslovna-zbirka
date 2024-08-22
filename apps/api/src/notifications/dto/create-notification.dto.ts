import { NotificationTypeEnumType } from '../../../types/src';

export interface CreateNotificationDto {
  title: string;
  text: string;
  link: string;
  notificationImage?: string;
  type: NotificationTypeEnumType;
}
