import { NotificationResponse } from '@biosfera/types';
import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class NotificationUsersService {
  private clients: Map<string, Subject<MessageEvent<NotificationResponse>>> =
    new Map();

  public subscribeToNotifications(userId: string) {
    const subject = new Subject<MessageEvent<NotificationResponse>>();
    this.clients.set(userId, subject);
    return subject;
  }

  public publishNotification(userId: string, message: NotificationResponse) {
    const client = this.clients.get(userId);
    if (client) {
      client.next({ data: message } as MessageEvent<NotificationResponse>);
    }
  }

  public removeClient(userId: string) {
    this.clients.delete(userId);
  }
}
