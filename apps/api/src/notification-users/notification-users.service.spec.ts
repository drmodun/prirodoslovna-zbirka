import { BadRequestException } from '@nestjs/common';
import { NotificationUsersService } from './notification-users.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';

describe('NotificationUsersService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let bus: { publish: jest.Mock };
  let email: { sendMail: jest.Mock };
  let service: NotificationUsersService;
  const msg = { id: 'n' } as any;
  const recipient = (over: Record<string, unknown> = {}) => ({
    id: 'u1',
    email: 'a@b.c',
    language: 'EN',
    isActivated: true,
    isEmailNotificationsEnabled: true,
    ...over,
  });

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    prisma = createPrismaMock();
    bus = { publish: jest.fn().mockResolvedValue(undefined) };
    email = { sendMail: jest.fn().mockResolvedValue(undefined) };
    prisma.user.findMany.mockResolvedValue([recipient()]);
    service = new NotificationUsersService(
      bus as any,
      prisma as any,
      email as any,
    );
  });
  afterEach(() => jest.restoreAllMocks());

  it('publishes to the user through the bus', async () => {
    await service.publishNotification('u1', msg);
    expect(bus.publish).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({ id: 'n' }),
    );
  });

  it('mails the notification when the user has the setting on', async () => {
    await service.publishNotification('u1', { ...msg, title: 'T', text: 'x' });
    expect(email.sendMail).toHaveBeenCalledWith('a@b.c', 'T', 'x');
  });

  it.each([
    ['turned the setting off', { isEmailNotificationsEnabled: false }],
    ['are not activated', { isActivated: false }],
  ])('does not mail users who %s', async (_n, over) => {
    prisma.user.findMany.mockResolvedValue([recipient(over)]);
    await service.publishNotification('u1', msg);
    expect(email.sendMail).not.toHaveBeenCalled();
    expect(bus.publish).toHaveBeenCalled();
  });

  it("renders a keyed notification in each recipient's language", async () => {
    prisma.user.findMany.mockResolvedValue([
      recipient({ id: 'en', email: 'en@x' }),
      recipient({ id: 'hr', email: 'hr@x', language: 'HR' }),
    ]);
    await service.publishManyNotifications(['en', 'hr'], {
      ...msg,
      title: 'stored',
      messageKey: 'newFollower',
      params: { username: 'ana' },
    });

    const live = Object.fromEntries(bus.publish.mock.calls);
    expect(live.en).toMatchObject({
      title: 'New follower',
      text: 'ana is now following you',
    });
    expect(live.hr).toMatchObject({
      title: 'Novi pratitelj',
      text: 'Korisnik ana te sada prati',
    });
    expect(email.sendMail).toHaveBeenCalledWith(
      'hr@x',
      'Novi pratitelj',
      'Korisnik ana te sada prati',
    );
  });

  it('still publishes, in English, when the recipients cannot be loaded', async () => {
    prisma.user.findMany.mockRejectedValue(new Error('db down'));
    await service.publishNotification('u1', {
      ...msg,
      messageKey: 'newFollower',
      params: { username: 'ana' },
    });
    expect(bus.publish).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({ title: 'New follower' }),
    );
    expect(email.sendMail).not.toHaveBeenCalled();
  });

  it('looks up all recipients of a fan-out in one query', async () => {
    await service.publishManyNotifications(['a', 'b'], msg);
    expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.user.findMany.mock.calls[0][0].where).toEqual({
      id: { in: ['a', 'b'] },
    });
  });

  it('does not fail the notification when mailing fails', async () => {
    email.sendMail.mockRejectedValue(new Error('smtp down'));
    await expect(
      service.publishNotification('u1', msg),
    ).resolves.toBeUndefined();
  });

  it('wraps bus failures in BadRequestException', async () => {
    bus.publish.mockRejectedValue(new Error('boom'));
    await expect(service.publishNotification('u1', msg)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('publishManyNotifications fans out to every user', async () => {
    await service.publishManyNotifications(['a', 'b', 'c'], msg);
    expect(bus.publish.mock.calls.map((c) => c[0])).toEqual(['a', 'b', 'c']);
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
