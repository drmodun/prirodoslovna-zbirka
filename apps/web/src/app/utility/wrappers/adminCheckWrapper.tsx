"use client";

import useUser from "../context/UserContext";

export interface RightCheckingWrapperProps {
  children: React.ReactNode;
  id: string;
}

export const AdminCheckingWrapper = ({
  children,
  id,
}: RightCheckingWrapperProps) => {
  const { user, memberships } = useUser();

  return user?.role === "SUPER" ||
    memberships.some(
      (x) =>
        x.id == id &&
        (x.role?.toLocaleLowerCase() === "admin" ||
          x.role?.toLocaleLowerCase() === "owner")
    )
    ? children
    : null;
};
