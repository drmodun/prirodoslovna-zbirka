"use client";
import {
  QueryClient,
  QueryClientProvider,
  QueryClientProviderProps,
} from "react-query";

const queryClient = new QueryClient();

export const QueryClientWrapper = ({ children }: { children: any }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
