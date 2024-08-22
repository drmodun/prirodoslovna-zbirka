import { NotificationTypeEnumType } from '../../../../../packages/types';

export interface CreateNotificationDto {
  title: string;
  text: string;
  link: string;
  notificationImage?: string;
  type: NotificationTypeEnumType;
}
