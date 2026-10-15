import { JwtStrategy } from './jwt.strategy';
import { OptionalStrategy } from './optional-jwt.strategy';

describe('JwtStrategy', () => {
  it('validates that the user still exists and returns the payload', async () => {
    const users = { findOne: jest.fn().mockResolvedValue({}) };
    const strategy = new JwtStrategy(users as any);
    const payload = { id: 'u', email: 'e', role: 'admin', iat: 1 } as any;

    await expect(strategy.validate(payload)).resolves.toEqual({
      id: 'u',
      email: 'e',
      role: 'admin',
    });
    expect(users.findOne).toHaveBeenCalledWith('u');
  });

  it('propagates lookup failures (deleted users are rejected)', async () => {
    const users = { findOne: jest.fn().mockRejectedValue(new Error('gone')) };
    const strategy = new JwtStrategy(users as any);
    await expect(
      strategy.validate({ id: 'u', email: 'e', role: 'user' }),
    ).rejects.toThrow('gone');
  });
});

describe('OptionalStrategy', () => {
  it('always yields an empty user', async () => {
    await expect(new OptionalStrategy().validate()).resolves.toEqual({});
  });
});
