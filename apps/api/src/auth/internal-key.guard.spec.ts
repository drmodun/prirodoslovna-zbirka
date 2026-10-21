import { ExecutionContext } from '@nestjs/common';
import { InternalKeyGuard } from './internal-key.guard';

const context = (headers: Record<string, unknown>) =>
  ({
    switchToHttp: () => ({ getRequest: () => ({ headers }) }),
  }) as unknown as ExecutionContext;

describe('InternalKeyGuard', () => {
  const guard = new InternalKeyGuard();
  const original = process.env.INTERNAL_API_KEY;
  afterEach(() => {
    process.env.INTERNAL_API_KEY = original;
  });

  it('lets the configured key through', () => {
    process.env.INTERNAL_API_KEY = 'secret';
    expect(guard.canActivate(context({ 'x-internal-key': 'secret' }))).toBe(
      true,
    );
  });

  it.each([
    ['no key', {}],
    ['a wrong key', { 'x-internal-key': 'guess' }],
    ['a longer key', { 'x-internal-key': 'secret-and-more' }],
    ['a repeated header', { 'x-internal-key': ['secret', 'secret'] }],
  ])('refuses %s', (_, headers) => {
    process.env.INTERNAL_API_KEY = 'secret';
    expect(() => guard.canActivate(context(headers))).toThrow(
      expect.objectContaining({ status: 401 }),
    );
  });

  it.each([undefined, ''])(
    'refuses everything when the key is %p',
    (configured) => {
      if (configured === undefined) delete process.env.INTERNAL_API_KEY;
      else process.env.INTERNAL_API_KEY = configured;
      expect(() =>
        guard.canActivate(context({ 'x-internal-key': '' })),
      ).toThrow(expect.objectContaining({ status: 401 }));
    },
  );
});
