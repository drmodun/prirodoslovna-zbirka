import { UnauthorizedException } from '@nestjs/common';
import { OwnStreamGuard } from './own-stream.guard';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { firstValueFrom } from 'rxjs';
import { NotificationUsersController } from './notification-users.controller';

describe('NotificationUsersController', () => {
  let svc: Record<string, jest.Mock>;
  let emitter: EventEmitter2;
  let controller: NotificationUsersController;
  const req = { user: { id: 'me' } };

  beforeEach(() => {
    svc = {
      getAllForUser: jest.fn(),
      markAllAsRead: jest.fn(),
      markAsRead: jest.fn(),
    };
    emitter = new EventEmitter2();
    controller = new NotificationUsersController(svc as any, emitter);
  });

  it('sse streams events emitted on the user channel as JSON', async () => {
    const stream = await controller.sse('u1');
    const next = firstValueFrom(stream);
    emitter.emit('u1', { id: 'n1', title: 'hi' });
    await expect(next).resolves.toEqual({
      data: JSON.stringify({ id: 'n1', title: 'hi' }),
    });
  });

  it('sse does not deliver events meant for other users', async () => {
    const received: unknown[] = [];
    const sub = (await controller.sse('u1')).subscribe((m) => received.push(m));
    emitter.emit('u2', { id: 'secret' });
    sub.unsubscribe();
    expect(received).toEqual([]);
  });

  it('getNotifications maps rows and defaults missing text to an empty string', async () => {
    const createdAt = new Date();
    svc.getAllForUser.mockResolvedValue([
      {
        notificationId: 'n1',
        isRead: true,
        notification: {
          createdAt,
          notificationImage: 'img',
          title: 'T',
          link: '/x',
          text: null,
          type: 'NEW_FOLLOWER',
        },
      },
    ]);
    await expect(controller.getNotifications(req)).resolves.toEqual([
      {
        createdAt,
        id: 'n1',
        notificationImage: 'img',
        title: 'T',
        link: '/x',
        read: true,
        text: '',
        type: 'NEW_FOLLOWER',
      },
    ]);
    expect(svc.getAllForUser).toHaveBeenCalledWith('me');
  });

  it('mark as read actions are scoped to the authenticated user', async () => {
    await controller.markAllAsRead(req);
    await controller.markAsRead('n1', req);
    expect(svc.markAllAsRead).toHaveBeenCalledWith('me');
    expect(svc.markAsRead).toHaveBeenCalledWith('n1', 'me');
  });

  describe('OwnStreamGuard', () => {
    const context = (userId: string, user?: { id: string }) =>
      ({
        switchToHttp: () => ({
          getRequest: () => ({ user, params: { userId } }),
        }),
      }) as any;

    it("refuses someone else's stream", () => {
      expect(() =>
        new OwnStreamGuard().canActivate(context('u1', { id: 'other' })),
      ).toThrow(UnauthorizedException);
      expect(() => new OwnStreamGuard().canActivate(context('u1'))).toThrow(
        UnauthorizedException,
      );
    });

    it('lets users follow their own stream', () => {
      expect(
        new OwnStreamGuard().canActivate(context('u1', { id: 'u1' })),
      ).toBe(true);
    });
  });

  it('sse subscription requires authentication', () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      NotificationUsersController.prototype.sse,
    );
    expect(guards?.length).toBeGreaterThan(0);
  });
});
