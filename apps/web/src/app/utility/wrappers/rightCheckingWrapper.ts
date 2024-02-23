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
  const { user } = useUser();

  return user?.role === "SUPER" || user?.id === author ? children : null;
};
