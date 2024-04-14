"use client";
import ReactLenis from "@studio-freight/react-lenis";
import { SideMenuProvider } from "../context/SideMenuContext";
import { UserWrapper } from "./userWrapper";

export const SideMenuWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ReactLenis root>
      <UserWrapper>
        <SideMenuProvider>{children}</SideMenuProvider>
      </UserWrapper>
    </ReactLenis>
  );
};
