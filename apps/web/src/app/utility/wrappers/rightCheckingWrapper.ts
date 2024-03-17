"use client";

import useUser from "../context/UserContext";

export interface RightCheckingWrapperProps {
  children: React.ReactNode;
  author: string;
}

export const RightCheckingWrapper = ({
  children,
  author,
}: RightCheckingWrapperProps) => {
  const { user, memberships } = useUser();

  return user?.role?.toLowerCase() === "super" || user?.id === author
    ? children
    : null;
};
