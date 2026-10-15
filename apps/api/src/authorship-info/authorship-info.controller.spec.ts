import { AuthorshipInfoController } from './authorship-info.controller';

describe('AuthorshipInfoController', () => {
  let svc: Record<string, jest.Mock>;
  let controller: AuthorshipInfoController;
  const req = { user: { id: 'me' } };

  beforeEach(() => {
    svc = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    };
    controller = new AuthorshipInfoController(svc as any);
  });

  it('create forces the authenticated user as author', async () => {
    const dto: any = { authorId: 'spoofed', title: 't' };
    await controller.create(dto, req);
    expect(svc.create).toHaveBeenCalledWith({ authorId: 'me', title: 't' });
  });

  it('findAll / findOne pass results through', async () => {
    svc.findAll.mockResolvedValue([{ id: 'a' }]);
    svc.findOne.mockResolvedValue({ id: 'a' });
    await expect(controller.findAll()).resolves.toEqual([{ id: 'a' }]);
    await expect(controller.findOne('a')).resolves.toEqual({ id: 'a' });
    expect(svc.findOne).toHaveBeenCalledWith('a');
  });

  it('update passes the caller so the service can scope it to the author', async () => {
    await controller.update('a', req, { title: 'n' } as any);
    expect(svc.update).toHaveBeenCalledWith('a', { title: 'n' }, 'me');
  });
});
