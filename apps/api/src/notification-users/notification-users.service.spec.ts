import { BadRequestException } from '@nestjs/common';
import { NotificationUsersService } from './notification-users.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';

describe('NotificationUsersService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let emitter: { emitAsync: jest.Mock };
  let service: NotificationUsersService;
  const msg = { id: 'n' } as any;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    prisma = createPrismaMock();
    emitter = { emitAsync: jest.fn().mockResolvedValue([]) };
    service = new NotificationUsersService(emitter as any, prisma as any);
  });
  afterEach(() => jest.restoreAllMocks());

  it('publishes on the user-id channel', async () => {
    await service.publishNotification('u1', msg);
    expect(emitter.emitAsync).toHaveBeenCalledWith('u1', msg);
  });

  it('wraps emitter failures in BadRequestException', async () => {
    emitter.emitAsync.mockRejectedValue(new Error('boom'));
    await expect(service.publishNotification('u1', msg)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('publishManyNotifications fans out to every user', async () => {
    await service.publishManyNotifications(['a', 'b', 'c'], msg);
    expect(emitter.emitAsync.mock.calls.map((c) => c[0])).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('markAsRead only touches the given notification for the user', async () => {
    await service.markAsRead('n', 'u');
    expect(prisma.userNotification.updateMany).toHaveBeenCalledWith({
      where: { notificationId: 'n', userId: 'u' },
      data: { isRead: true },
    });
  });

  it('markAllAsRead touches every notification of the user', async () => {
    await service.markAllAsRead('u');
    expect(prisma.userNotification.updateMany).toHaveBeenCalledWith({
      where: { userId: 'u' },
      data: { isRead: true },
    });
  });

  it('getAllForUser includes the notification', async () => {
    await service.getAllForUser('u');
    const arg = prisma.userNotification.findMany.mock.calls[0][0];
    expect(arg.where).toEqual({ userId: 'u' });
    expect(arg.include.notification).toBeDefined();
  });
});
