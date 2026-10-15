import useUser from "@/utility/context/UserContext";

export interface CardPermissions {
  isSuper: boolean;
  isOrganisationAdmin: (organisationId?: string) => boolean;
  isCurrentUser: (userId?: string) => boolean;
}

export const useCardPermissions = (): CardPermissions => {
  const { memberships, user } = useUser();
  const isSuper = user?.role?.toLowerCase() === "super";

  return {
    isSuper,
    isOrganisationAdmin: (organisationId) =>
      isSuper ||
      memberships.some(
        (membership) =>
          membership.id === organisationId &&
          (membership.role === "ADMIN" || membership.role === "OWNER"),
      ),
    isCurrentUser: (userId) => userId === user?.id,
  };
};
