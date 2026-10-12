import { BadRequestException } from '@nestjs/common';
import { LiteratureController } from './literature.controller';

describe('LiteratureController', () => {
  let svc: Record<string, jest.Mock>;
  let controller: LiteratureController;
  const req = { user: { id: 'me' } };
  const createdAt = new Date();

  beforeEach(() => {
    svc = {
      findAllForUser: jest.fn(),
      findAllForLiterature: jest.fn(),
      toggle: jest.fn(),
    };
    controller = new LiteratureController(svc as any);
  });

  it('findAllForMe maps saved literature of the caller', async () => {
    svc.findAllForUser.mockResolvedValue([
      { literatureId: 'l', userId: 'me', createdAt, extra: 1 },
    ]);
    await expect(controller.findAllForMe(req)).resolves.toEqual([
      { literatureId: 'l', userId: 'me', createdAt },
    ]);
    expect(svc.findAllForUser).toHaveBeenCalledWith('me');
  });

  it('findAllForUser works for any user id', async () => {
    svc.findAllForUser.mockResolvedValue([]);
    await controller.findAllForUser('someone');
    expect(svc.findAllForUser).toHaveBeenCalledWith('someone');
  });

  it('create toggles and fails when nothing came back', async () => {
    svc.toggle.mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce(null);
    await expect(controller.create(req, 'l')).resolves.toBeUndefined();
    await expect(controller.create(req, 'l')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(svc.toggle).toHaveBeenCalledWith('me', 'l');
  });

  it('findAllForWork maps users who saved the item', async () => {
    svc.findAllForLiterature.mockResolvedValue([
      {
        userId: 'u',
        user: {
          email: 'e',
          firstName: 'A',
          lastName: 'B',
          username: 'ab',
          _count: { Posts: 1, followers: 2 },
        },
      },
    ]);
    await expect(controller.findAllForWork('l')).resolves.toEqual([
      {
        id: 'u',
        email: 'e',
        firstName: 'A',
        lastName: 'B',
        username: 'ab',
        postCount: 1,
        followerCount: 2,
      },
    ]);
  });
});
