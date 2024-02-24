"use client";
import { SideMenuProvider } from "../context/SideMenuContext";
import { UserWrapper } from "./userWrapper";

export const SideMenuWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <UserWrapper>
      <SideMenuProvider>{children}</SideMenuProvider>
    </UserWrapper>
  );
};
