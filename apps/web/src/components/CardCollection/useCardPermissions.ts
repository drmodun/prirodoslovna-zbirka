import useUser from "@/utility/context/UserContext";
import { isModeratorRole, isSuperRole } from "@/utility/static/roles";

export interface CardPermissions {
  isSuper: boolean;
  // Membership management: organisation admins and owner, super users.
  isOrganisationAdmin: (organisationId?: string) => boolean;
  // Content moderation: also platform moderators (ADMIN).
  canModerate: (organisationId?: string) => boolean;
  isCurrentUser: (userId?: string) => boolean;
}

export const useCardPermissions = (): CardPermissions => {
  const { memberships, user } = useUser();
  const isSuper = isSuperRole(user?.role);
  const isOrganisationAdmin = (organisationId?: string) =>
    isSuper ||
    memberships.some(
      (membership) =>
        membership.id === organisationId &&
        (membership.role === "ADMIN" || membership.role === "OWNER"),
    );

  return {
    isSuper,
    isOrganisationAdmin,
    canModerate: (organisationId) =>
      isModeratorRole(user?.role) || isOrganisationAdmin(organisationId),
    isCurrentUser: (userId) => !!user?.id && userId === user.id,
  };
};
