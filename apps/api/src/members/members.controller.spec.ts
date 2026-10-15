import { UnauthorizedException } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MemberRoleType } from './members.dto';

describe('MembersController', () => {
  let svc: Record<string, jest.Mock>;
  let controller: MembersController;
  const req = { user: { id: 'me' } };

  beforeEach(() => {
    svc = {
      makeRequest: jest.fn(),
      leaveOrganisation: jest.fn(),
      hasAdminRights: jest.fn(),
      hasOwnerRights: jest.fn(),
      editMemberRole: jest.fn(),
      ownerEditMemberRole: jest.fn(),
      transferOwnership: jest.fn(),
      addMember: jest.fn(),
      removeMember: jest.fn(),
    };
    controller = new MembersController(svc as any);
  });

  it('makeRequest / leaveOrganisation act as the authenticated user', async () => {
    await controller.makeRequest(req, 'o1');
    await controller.leaveOrganisation(req, 'o1');
    expect(svc.makeRequest).toHaveBeenCalledWith('me', 'o1');
    expect(svc.leaveOrganisation).toHaveBeenCalledWith('me', 'o1');
  });

  describe('editMembershipStatus', () => {
    it('refuses to grant OWNER without consulting permissions', async () => {
      const result = await controller.editMembershipStatus(req, 'o1', 'u2', {
        role: MemberRoleType.OWNER,
      });
      expect(result).toBeInstanceOf(UnauthorizedException);
      expect(svc.hasAdminRights).not.toHaveBeenCalled();
      expect(svc.editMemberRole).not.toHaveBeenCalled();
    });

    it('does nothing for non admins', async () => {
      svc.hasAdminRights.mockResolvedValue(false);
      const result = await controller.editMembershipStatus(req, 'o1', 'u2', {
        role: MemberRoleType.ADMIN,
      });
      expect(result).toBeInstanceOf(UnauthorizedException);
      expect(svc.editMemberRole).not.toHaveBeenCalled();
    });

    it('edits the role for admins', async () => {
      svc.hasAdminRights.mockResolvedValue(true);
      await controller.editMembershipStatus(req, 'o1', 'u2', {
        role: MemberRoleType.ADMIN,
      });
      expect(svc.hasAdminRights).toHaveBeenCalledWith('me', 'o1');
      expect(svc.editMemberRole).toHaveBeenCalledWith('u2', 'o1', 'ADMIN');
    });
  });

  describe.each([
    ['ownerEdit', 'ownerEditMemberRole', 'hasOwnerRights'],
    ['transferOwnership', 'transferOwnership', 'hasOwnerRights'],
    ['addMember', 'addMember', 'hasAdminRights'],
    ['removeMember', 'removeMember', 'hasAdminRights'],
  ] as const)('%s', (method, serviceMethod, permission) => {
    const call = () =>
      (controller as any)[method](req, 'o1', 'u2', {
        role: MemberRoleType.ADMIN,
      });

    it(`is gated by ${permission}`, async () => {
      svc[permission].mockResolvedValue(false);
      const result = await call();
      // NOTE: the controller *returns* the exception (HTTP 200), it does not throw.
      expect(result).toBeInstanceOf(UnauthorizedException);
      expect(svc[serviceMethod]).not.toHaveBeenCalled();
    });

    it('delegates when permitted', async () => {
      svc[permission].mockResolvedValue(true);
      await call();
      expect(svc[permission]).toHaveBeenCalledWith('me', 'o1');
      expect(svc[serviceMethod]).toHaveBeenCalled();
    });
  });

  it('transferOwnership passes the caller as the previous owner', async () => {
    svc.hasOwnerRights.mockResolvedValue(true);
    await controller.transferOwnership(req, 'o1', 'u2');
    expect(svc.transferOwnership).toHaveBeenCalledWith('me', 'o1', 'u2');
  });
});
