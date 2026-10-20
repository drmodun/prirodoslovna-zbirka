"use client";

import useUser from "../context/UserContext";
import { isModeratorRole } from "../static/roles";

export interface RightCheckingWrapperProps {
  children: React.ReactNode;
  id: string;
}

export const AdminCheckingWrapper = ({
  children,
  id,
}: RightCheckingWrapperProps) => {
  const { user, memberships } = useUser();

  return isModeratorRole(user?.role) ||
    memberships.some(
      (x) =>
        x.id == id &&
        (x.role?.toLocaleLowerCase() === "admin" ||
          x.role?.toLocaleLowerCase() === "owner"),
    )
    ? children
    : null;
};
