import { NotificationTypeEnumType } from '@biosfera/types';
import {
  NotificationMessageKey,
  NotificationParams,
} from '../notification-messages';

export interface CreateNotificationDto {
  messageKey: NotificationMessageKey;
  params: NotificationParams;
  link: string;
  notificationImage?: string;
  type: NotificationTypeEnumType;
}
