import { Role } from '@prisma/client';
import { isModerator, isModeratorRole, isSuperUser } from './roles';

describe('platform roles', () => {
  it.each([
    [undefined, false, false],
    [{}, false, false],
    [{ role: 'user' }, false, false],
    [{ role: 'admin' }, false, true],
    [{ role: 'super' }, true, true],
  ])('%j: super=%s, moderator=%s', (user, sup, mod) => {
    expect(isSuperUser(user)).toBe(sup);
    expect(isModerator(user)).toBe(mod);
  });

  it.each([
    [Role.USER, false],
    [Role.ADMIN, true],
    [Role.SUPER, true],
    [undefined, false],
  ])('isModeratorRole(%s) = %s', (role, expected) => {
    expect(isModeratorRole(role)).toBe(expected);
  });
});
