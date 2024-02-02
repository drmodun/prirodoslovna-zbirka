"use client";
import {
  QueryClient,
  QueryClientProvider,
  QueryClientProviderProps,
} from "react-query";
import { UserProvider } from "../context/UserContext";
import { QueryClientWrapper } from "./queryWrapper";

const queryClient = new QueryClient();

export const UserWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <QueryClientWrapper>
      <UserProvider>{children}</UserProvider>
    </QueryClientWrapper>
  );
};
