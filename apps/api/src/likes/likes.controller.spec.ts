import { LikesController } from './likes.controller';

describe('LikesController', () => {
  it('toggles the like of the authenticated user', async () => {
    const svc = { toggleLike: jest.fn() };
    await new LikesController(svc as any).toggleLike(
      { user: { id: 'me' } },
      'p1',
    );
    expect(svc.toggleLike).toHaveBeenCalledWith('me', 'p1');
  });
});
