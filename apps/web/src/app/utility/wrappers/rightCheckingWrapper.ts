"use client";

import useUser from "../context/UserContext";
import { isModeratorRole } from "../static/roles";

export interface RightCheckingWrapperProps {
  children: React.ReactNode;
  author: string;
}

export const RightCheckingWrapper = ({
  children,
  author,
}: RightCheckingWrapperProps) => {
  const { user, memberships } = useUser();

  return isModeratorRole(user?.role) || user?.id === author ? children : null;
};
