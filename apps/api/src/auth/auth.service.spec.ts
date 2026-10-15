import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';

describe('AuthService.userPasswordLogin', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let jwt: { sign: jest.Mock };
  let service: AuthService;
  let hash: string;

  beforeAll(async () => {
    hash = await bcrypt.hash('secret1', 4);
  });

  beforeEach(() => {
    prisma = createPrismaMock();
    jwt = { sign: jest.fn().mockReturnValue('signed.jwt') };
    service = new AuthService(prisma as any, jwt as any);
  });

  const user = (role = 'USER') => ({
    id: 'u1',
    email: 'a@b.c',
    password: hash,
    role,
  });

  it('requires an email', async () => {
    await expect(service.userPasswordLogin('', 'x')).rejects.toThrow(
      'Email is required',
    );
  });

  it('requires a password', async () => {
    await expect(service.userPasswordLogin('a@b.c', '')).rejects.toThrow(
      'Password is required',
    );
  });

  it('only looks up activated users', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.userPasswordLogin('a@b.c', 'secret1')).rejects.toThrow(
      'User not found',
    );
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'a@b.c', isActivated: true },
    });
  });

  it('rejects a wrong password', async () => {
    prisma.user.findUnique.mockResolvedValue(user());
    await expect(
      service.userPasswordLogin('a@b.c', 'wrong-pass'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it.each([
    ['USER', 'user'],
    ['ADMIN', 'admin'],
    ['SUPER', 'super'],
  ])('signs a token carrying role %s as "%s"', async (dbRole, tokenRole) => {
    prisma.user.findUnique.mockResolvedValue(user(dbRole));
    await expect(service.userPasswordLogin('a@b.c', 'secret1')).resolves.toBe(
      'signed.jwt',
    );
    expect(jwt.sign).toHaveBeenCalledWith({
      id: 'u1',
      email: 'a@b.c',
      role: tokenRole,
    });
  });
});
