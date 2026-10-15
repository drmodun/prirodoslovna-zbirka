import { NotFoundException } from '@nestjs/common';
import { SocialPostsController } from './social-posts.controller';

const date = new Date('2024-06-06T00:00:00Z');
const post = (over: any = {}) => ({
  id: 's1',
  title: 'Najava',
  text: 'txt',
  images: ['i'],
  type: 'NEWS',
  organisationId: 'o1',
  authorshipInfoId: 'ai',
  AuthorshipInfo: { id: 'ai' },
  organisation: { name: 'Org', mainImage: 'm' },
  isApproved: true,
  createdAt: date,
  updatedAt: date,
  ...over,
});

describe('SocialPostsController', () => {
  let svc: Record<string, jest.Mock>;
  let controller: SocialPostsController;
  const req = { user: { id: 'me' } };

  beforeEach(() => {
    svc = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      changeApprovalStatus: jest.fn(),
      checkForExistingValidity: jest.fn(),
    };
    controller = new SocialPostsController(svc as any);
  });

  it('create maps the response using the URL organisation', async () => {
    svc.create.mockResolvedValue(post());
    const res = await controller.create('o1', {} as any, req);
    expect(svc.create).toHaveBeenCalledWith({}, 'o1', 'me');
    expect(res).toMatchObject({
      id: 's1',
      organisationId: 'o1',
      organisationName: 'Org',
      organisationMainImage: 'm',
    });
  });

  it('findAll maps posts', async () => {
    svc.findAll.mockResolvedValue([post()]);
    const [res] = await controller.findAll(
      { page: 1, size: 10 },
      undefined,
      {} as any,
    );
    expect(res).toMatchObject({
      id: 's1',
      organisationName: 'Org',
      isApproved: true,
    });
  });

  // Anyone (including anonymous users) can call GET /social-posts, but the
  // controller never passes `approval`, so unapproved posts leak publicly.
  it.failing('findAll only lists approved posts to the public', async () => {
    svc.findAll.mockResolvedValue([]);
    await controller.findAll(undefined, undefined, {} as any);
    expect(svc.findAll.mock.calls[0][3]).toBe(true);
  });

  describe('findOne', () => {
    it('anonymous visitors only get approved posts', async () => {
      svc.findOne.mockResolvedValue(post());
      await controller.findOne('s1', {});
      expect(svc.checkForExistingValidity).not.toHaveBeenCalled();
      expect(svc.findOne).toHaveBeenCalledWith('s1', true);
    });

    it('organisation admins can see unapproved posts', async () => {
      svc.checkForExistingValidity.mockResolvedValue(true);
      svc.findOne.mockResolvedValue(post());
      await controller.findOne('s1', req);
      expect(svc.checkForExistingValidity).toHaveBeenCalledWith('me', 's1');
      expect(svc.findOne).toHaveBeenCalledWith('s1', false);
    });

    it('404s when nothing is found', async () => {
      svc.findOne.mockResolvedValue(null);
      await expect(controller.findOne('s1', {})).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  it('update returns whether the update produced a record', async () => {
    svc.update.mockResolvedValue({});
    await expect(
      controller.update('o1', 's1', { title: 'n' } as any, req),
    ).resolves.toBe(true);
    expect(svc.update).toHaveBeenCalledWith({ title: 'n' }, 's1', 'me', 'o1');
  });

  it('changeApprovalStatus passes (id, user, organisation)', async () => {
    svc.changeApprovalStatus.mockResolvedValue({});
    await controller.changeApprovalStatus('o1', 's1', req);
    expect(svc.changeApprovalStatus).toHaveBeenCalledWith('s1', 'me', 'o1');
  });

  // BUG: the controller calls `remove(id, userId, organisationId)` but the
  // service signature is `remove(id, organisationId, userId)`, so the
  // permission check runs with the arguments swapped.
  it.failing(
    'remove passes organisationId and userId in the order the service expects',
    async () => {
      svc.remove.mockResolvedValue({});
      await controller.remove('o1', 's1', req);
      expect(svc.remove).toHaveBeenCalledWith('s1', 'o1', 'me');
    },
  );

  // BUG: DELETE has no JwtAuthGuard, so `req.user` is undefined and the call
  // crashes with a TypeError (500) instead of returning 401.
  it.failing('delete is protected by an auth guard', () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      SocialPostsController.prototype.remove,
    );
    expect(guards?.length).toBeGreaterThan(0);
  });
});
