"use client";
import { DiscoverProvider } from "../context/DiscoverContext";
import { UserWrapper } from "./userWrapper";

export interface DiscoverWrapperProps {
  children: React.ReactNode;
}

export const DiscoverWrapper = (props: DiscoverWrapperProps) => {
  return (
    <UserWrapper>
      <DiscoverProvider>{props.children}</DiscoverProvider>
    </UserWrapper>
  );
};
