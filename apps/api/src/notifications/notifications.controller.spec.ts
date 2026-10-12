import { NotificationsController } from './notifications.controller';

describe('NotificationsController', () => {
  it('creates a notification without recipients', async () => {
    const svc = { create: jest.fn().mockResolvedValue({ id: 'n' }) };
    const dto: any = { title: 'T' };
    await expect(
      new NotificationsController(svc as any).create(dto),
    ).resolves.toEqual({
      id: 'n',
    });
    expect(svc.create).toHaveBeenCalledWith(dto, []);
  });
});
