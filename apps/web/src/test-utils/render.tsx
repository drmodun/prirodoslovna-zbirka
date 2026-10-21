import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { render, renderHook, RenderOptions } from "@testing-library/react";

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, cacheTime: 0 },
      mutations: { retry: false },
    },
  });

export const withQueryClient = (client = createTestQueryClient()) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

export const renderWithClient = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & { client?: QueryClient },
) => {
  const client = options?.client ?? createTestQueryClient();
  return {
    client,
    ...render(ui, { wrapper: withQueryClient(client), ...options }),
  };
};

export const renderHookWithClient = <T,>(
  hook: () => T,
  client = createTestQueryClient(),
) => ({ client, ...renderHook(hook, { wrapper: withQueryClient(client) }) });
