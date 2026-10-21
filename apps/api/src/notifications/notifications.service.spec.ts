import { BadRequestException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';

describe('NotificationsService', () => {
  it('creates the notification with one UserNotification per recipient', async () => {
    const prisma = createPrismaMock();
    prisma.notification.create.mockResolvedValue({ id: 'n' });
    const service = new NotificationsService(prisma as any);

    const result = await service.create(
      {
        messageKey: 'newFollower',
        params: { username: 'ana' },
        type: 'NEW_FOLLOWER',
        link: '/user/a',
      },
      ['u1', 'u2'],
    );

    expect(result).toEqual({ id: 'n' });
    const arg = prisma.notification.create.mock.calls[0][0];
    // stores the key and parameters, plus an English copy of the text
    expect(arg.data).toMatchObject({
      messageKey: 'newFollower',
      params: { username: 'ana' },
      title: 'New follower',
      text: 'ana is now following you',
    });
    expect(arg.data.UserNotification.createMany.data).toEqual([
      { userId: 'u1' },
      { userId: 'u2' },
    ]);
  });

  it('rejects unknown message keys', async () => {
    const service = new NotificationsService(createPrismaMock() as any);
    await expect(
      service.create({ messageKey: 'nope' } as any, []),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
