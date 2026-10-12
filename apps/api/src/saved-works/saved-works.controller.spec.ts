import { BadRequestException } from '@nestjs/common';
import { SavedWorksController } from './saved-works.controller';

const connection = () => ({
  userId: 'u',
  work: {
    id: 'w1',
    authorId: 'a1',
    organisationId: 'o1',
    description: 'd',
    poster: 'p',
    title: 'T',
    updatedAt: new Date(),
    author: { username: 'ana' },
    organisation: { name: 'Org' },
    _count: { SavedWorks: 6 },
  },
});

describe('SavedWorksController', () => {
  let svc: Record<string, jest.Mock>;
  let controller: SavedWorksController;
  const req = { user: { id: 'me' } };

  beforeEach(() => {
    svc = {
      findAllForUser: jest.fn(),
      findAllForwork: jest.fn(),
      toggle: jest.fn(),
    };
    controller = new SavedWorksController(svc as any);
  });

  it.each([
    ['findAllForMe', (c: any) => c.findAllForMe(req), 'me'],
    ['findAllForUser', (c: any) => c.findAllForUser('other'), 'other'],
  ])('%s maps saved works', async (_n, call, expectedUser) => {
    svc.findAllForUser.mockResolvedValue([connection()]);
    const [res] = await call(controller);
    expect(svc.findAllForUser).toHaveBeenCalledWith(expectedUser);
    expect(res).toMatchObject({
      id: 'w1',
      auhtorName: 'ana',
      organisationName: 'Org',
      amountOfSaves: 6,
    });
  });

  it('create toggles and fails when nothing came back', async () => {
    svc.toggle.mockResolvedValueOnce({}).mockResolvedValueOnce(undefined);
    await expect(controller.create(req, 'w1')).resolves.toBeUndefined();
    await expect(controller.create(req, 'w1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('findAllForWork maps users who saved the work', async () => {
    svc.findAllForwork.mockResolvedValue([
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
    const [res] = await controller.findAllForWork('w1');
    expect(res).toMatchObject({ id: 'u', postCount: 1, followerCount: 2 });
  });
});
