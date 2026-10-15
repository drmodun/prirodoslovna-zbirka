import { NotificationsService } from './notifications.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';

describe('NotificationsService', () => {
  it('creates the notification with one UserNotification per recipient', async () => {
    const prisma = createPrismaMock();
    prisma.notification.create.mockResolvedValue({ id: 'n' });
    const service = new NotificationsService(prisma as any);

    const result = await service.create({ title: 'T' } as any, ['u1', 'u2']);

    expect(result).toEqual({ id: 'n' });
    const arg = prisma.notification.create.mock.calls[0][0];
    expect(arg.data.title).toBe('T');
    expect(arg.data.UserNotification.createMany.data).toEqual([
      { userId: 'u1' },
      { userId: 'u2' },
    ]);
  });
});
