import { NotificationResponse } from '@biosfera/types';
import { BadRequestException, Injectable } from '@nestjs/common';
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
    try {
      const client = this.clients.get(userId);
      if (client) {
        client.next({ data: message } as MessageEvent<NotificationResponse>);
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  public removeClient(userId: string) {
    this.clients.delete(userId);
  }
}

//If performance issues are detected, move this to an external service
