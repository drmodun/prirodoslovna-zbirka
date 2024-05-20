import { NotificationTypeEnumType } from '@biosfera/types';

export interface CreateNotificationDto {
  title: string;
  text: string;
  link: string;
  type: NotificationTypeEnumType;
}
