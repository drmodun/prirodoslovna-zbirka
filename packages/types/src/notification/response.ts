export interface NotificationResponse {
  title: string;
  text?: string;
  link?: string;
  id: string;
  notificationImage: string;
  createdAt: Date;
  read?: boolean;
}
