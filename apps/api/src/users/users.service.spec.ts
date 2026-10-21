import * as bcrypt from 'bcrypt';
import { SortingEnum, SortType } from '@biosfera/types';
import { BadRequestException } from '@nestjs/common';
import {
  hashResetToken,
  PASSWORD_RESET_TTL_MS,
  UsersService,
} from './users.service';
import { createPrismaMock } from 'src/test-utils/prisma.mock';

describe('UsersService', () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let blob: { upload: jest.Mock };
  let email: { sendMail: jest.Mock };
  let service: UsersService;

  beforeEach(() => {
    prisma = createPrismaMock();
    blob = { upload: jest.fn() };
    email = { sendMail: jest.fn().mockResolvedValue('mail') };
    service = new UsersService(prisma as any, blob as any, email as any);
  });

  describe('create', () => {
    const dto = () =>
      ({
        email: 'ana@x.hr',
        password: 'plain-pass',
        firstName: 'Ana',
        lastName: 'Anić',
      }) as any;

    it('hashes the password before persisting it', async () => {
      prisma.user.create.mockImplementation(async ({ data }) => ({
        ...data,
        id: 'u1',
        activationCode: 'code',
      }));
      const user = await service.create(dto());

      const stored = prisma.user.create.mock.calls[0][0].data.password;
      expect(stored).not.toBe('plain-pass');
      await expect(bcrypt.compare('plain-pass', stored)).resolves.toBe(true);
      expect(user.id).toBe('u1');
    });

    it('sends a verification email containing the activation link', async () => {
      prisma.user.create.mockResolvedValue({
        id: 'u1',
        email: 'ana@x.hr',
        firstName: 'Ana',
        lastName: 'Anić',
        activationCode: 'abc123',
      });
      await service.create(dto());
      const [to, subject, text] = email.sendMail.mock.calls[0];
      expect(to).toBe('ana@x.hr');
      expect(subject).toContain('Ana');
      expect(text).toContain('http://localhost:3000/activateUser/abc123');
    });

    it('does not send email if the user could not be created', async () => {
      prisma.user.create.mockRejectedValue(new Error('unique'));
      await expect(service.create(dto())).rejects.toThrow('unique');
      expect(email.sendMail).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('applies all filters and offset pagination', async () => {
      await service.findAll(
        {
          name: 'ana maria',
          location: 'ZAGREB',
          organisation: 'org1',
          role: 'ADMIN',
        } as any,
        undefined,
        { page: 3, size: 5 },
      );
      const arg = prisma.user.findMany.mock.calls[0][0];
      expect(arg.where).toEqual({
        firstName: { search: 'ana | maria', mode: 'insensitive' },
        location: 'ZAGREB',
        OrganisationUser: { some: { organisationId: 'org1' } },
        role: 'ADMIN',
      });
      expect(arg.skip).toBe(10);
      expect(arg.take).toBe(5);
    });

    it('orders by relevance when searching by name without explicit sorting', async () => {
      await service.findAll({ name: 'ana maria' } as any);
      expect(prisma.user.findMany.mock.calls[0][0].orderBy).toEqual({
        _relevance: {
          fields: ['username'],
          search: 'ana <-> maria',
          sort: 'desc',
        },
      });
    });

    it('prefers explicit sorting over relevance', async () => {
      await service.findAll({ name: 'ana' } as any, {
        attribute: SortingEnum.USERNAME,
        direction: SortType.ASCENDING,
      });
      expect(prisma.user.findMany.mock.calls[0][0].orderBy).toEqual({
        username: 'asc',
      });
    });

    it('leaves where empty with an empty filter', async () => {
      await service.findAll({} as any);
      expect(prisma.user.findMany.mock.calls[0][0].where).toEqual({});
    });

    // KNOWN BUG (characterisation): `filter.name` is dereferenced without
    // optional chaining when no sorting is supplied, so calling findAll()
    // without a filter throws instead of returning all users.
    it('throws a TypeError when called with neither filter nor sorting', async () => {
      await expect(service.findAll()).rejects.toThrow(TypeError);
    });
  });

  describe('findOne', () => {
    it('uses findUniqueOrThrow so missing users surface as errors', async () => {
      prisma.user.findUniqueOrThrow.mockRejectedValue(new Error('nf'));
      await expect(service.findOne('x')).rejects.toThrow('nf');
      expect(prisma.user.findUniqueOrThrow.mock.calls[0][0].where).toEqual({
        id: 'x',
      });
    });

    it('restricts nested relations to approved items when approval is true', async () => {
      await service.findOne('x', true);
      const inc = prisma.user.findUniqueOrThrow.mock.calls[0][0].include;
      expect(inc.Posts.where).toEqual({ isApproved: true });
      expect(inc.Works.where).toEqual({ isApproved: true });
      expect(inc.Likes.where).toEqual({ Post: { isApproved: true } });
      expect(inc.FavouriteExponats.where).toEqual({
        Exponat: { isApproved: true },
      });
      expect(inc.SavedWorks.where).toEqual({ work: { isApproved: true } });
    });

    it.each([undefined, false])(
      'does not filter by approval when approval=%p',
      async (approval) => {
        await service.findOne('x', approval);
        const inc = prisma.user.findUniqueOrThrow.mock.calls[0][0].include;
        expect(inc.Posts.where).toEqual({});
        expect(inc.Works.where).toEqual({});
        expect(inc.Likes.where).toEqual({});
      },
    );
  });

  it('update / remove address the user by id', async () => {
    await service.update('u', { bio: 'hi' } as any);
    await service.remove('u');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u' },
      data: { bio: 'hi' },
    });
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'u' } });
  });

  it('updateLanguage stores only the language of the user', async () => {
    await service.updateLanguage('u', 'HR');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u' },
      data: { language: 'HR' },
    });
  });

  describe('mail language', () => {
    const user = (language?: string) =>
      ({
        email: 'a@b.c',
        firstName: 'Ana',
        lastName: 'Anić',
        activationCode: 'zzz',
        language,
      }) as any;

    it('writes the verification mail in English by default', async () => {
      await service.sendVefificationEmail(user('EN'));
      const [, subject, text] = email.sendMail.mock.calls[0];
      expect(subject).toBe('Ana, verify your e-mail address');
      expect(text).toContain('please verify your e-mail address');
    });

    it('writes the verification mail in Croatian for Croatian users', async () => {
      await service.sendVefificationEmail(user('HR'));
      const [, subject, text] = email.sendMail.mock.calls[0];
      expect(subject).toBe('Ana, verificirajte e-mail adresu');
      expect(text).toContain('/activateUser/zzz');
    });

    it.each([
      ['EN', 'Password reset on biosfera.trema'],
      ['HR', 'Resetiranje lozinke na biosfera.trema'],
    ])(
      'writes the reset mail for %s users in their language',
      async (language, subject) => {
        prisma.user.findUnique.mockResolvedValue({ id: 'u1', language });
        await service.sendPasswordResetEmail('a@b.c');
        expect(email.sendMail.mock.calls[0][1]).toBe(subject);
        expect(email.sendMail.mock.calls[0][2]).toMatch(
          /\/resetPassword\/[0-9a-f]{64}/,
        );
      },
    );
  });

  it('getJoinRequests only returns REQUESTED memberships', async () => {
    await service.getJoinRequests('u');
    const where = prisma.organisationUser.findMany.mock.calls[0][0].where;
    expect(where).toEqual({ userId: 'u', role: 'REQUESTED' });
  });

  it('uploadProfileImage stores the blob then flags the profile', async () => {
    prisma.user.update.mockResolvedValue({ hasProfileImage: true });
    const file = { buffer: Buffer.from('x'), mimetype: 'image/png' } as any;
    await expect(service.uploadProfileImage('u', file)).resolves.toEqual({
      hasProfileImage: true,
    });
    expect(blob.upload).toHaveBeenCalledWith(
      'user',
      'u',
      file.buffer,
      'image/png',
    );
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u' },
      data: { hasProfileImage: true },
    });
  });

  it('does not flag the profile image if the upload fails', async () => {
    blob.upload.mockRejectedValue(new Error('s3'));
    await expect(
      service.uploadProfileImage('u', { buffer: Buffer.alloc(0) } as any),
    ).rejects.toThrow('s3');
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  describe('WEB_URL handling', () => {
    const original = process.env.WEB_URL;
    afterEach(() => {
      process.env.WEB_URL = original;
    });

    it('uses WEB_URL for verification links', async () => {
      process.env.WEB_URL = 'https://biosfera.example';
      await service.sendVefificationEmail({
        email: 'a@b.c',
        firstName: 'A',
        lastName: 'B',
        activationCode: 'zzz',
      } as any);
      expect(email.sendMail.mock.calls[0][2]).toContain(
        'https://biosfera.example/activateUser/zzz',
      );
    });

    it('falls back to localhost when WEB_URL is unset', async () => {
      delete process.env.WEB_URL;
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      await service.sendPasswordResetEmail('a@b.c');
      expect(email.sendMail.mock.calls[0][2]).toMatch(
        /http:\/\/localhost:3000\/resetPassword\/[0-9a-f]{64}/,
      );
    });
  });

  it('verifyUser activates by activation code', async () => {
    await service.verifyUser('code');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { activationCode: 'code' },
      data: { isActivated: true },
    });
  });

  describe('password reset', () => {
    it('answers unknown emails silently, without sending anything', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.sendPasswordResetEmail('no@x'),
      ).resolves.toBeUndefined();
      expect(email.sendMail).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('stores only a hash of the emailed token, with an expiry', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
      const before = Date.now();
      await service.sendPasswordResetEmail('a@b.c');

      const token = email.sendMail.mock.calls[0][2].match(
        /resetPassword\/([0-9a-f]{64})/,
      )[1];
      const { where, data } = prisma.user.update.mock.calls[0][0];
      expect(where).toEqual({ id: 'u1' });
      expect(data.passwordResetToken).toBe(hashResetToken(token));
      expect(data.passwordResetToken).not.toBe(token);
      expect(data.passwordResetExpiresAt.getTime()).toBeGreaterThanOrEqual(
        before + PASSWORD_RESET_TTL_MS,
      );
    });

    it('stores a bcrypt hash and clears the token', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        passwordResetExpiresAt: new Date(Date.now() + 1000),
      });
      await service.resetPassword('tok', 'brand-new');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { passwordResetToken: hashResetToken('tok') },
      });
      const arg = prisma.user.update.mock.calls[0][0];
      expect(arg.where).toEqual({ id: 'u1' });
      expect(arg.data.passwordResetToken).toBeNull();
      expect(arg.data.passwordResetExpiresAt).toBeNull();
      expect(arg.data.password).not.toBe('brand-new');
      await expect(
        bcrypt.compare('brand-new', arg.data.password),
      ).resolves.toBe(true);
    });

    it('rejects unknown and expired tokens', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null);
      await expect(service.resetPassword('nope', 'pw')).rejects.toBeInstanceOf(
        BadRequestException,
      );

      prisma.user.findUnique.mockResolvedValueOnce({
        id: 'u1',
        passwordResetExpiresAt: new Date(Date.now() - 1000),
      });
      await expect(service.resetPassword('old', 'pw')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});
