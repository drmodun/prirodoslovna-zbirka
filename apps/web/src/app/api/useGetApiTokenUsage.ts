import { ApiTokenUsageResponse } from "@biosfera/types";
import { useQuery } from "react-query";
import { api } from "./shared";
import { API_TOKENS_QUERY_KEY } from "./useGetApiTokens";

const getApiTokenUsage = (id: string) =>
  api.get<never, ApiTokenUsageResponse[]>(`/auth/tokens/${id}/usage`);

export const useGetApiTokenUsage = (id: string, enabled = true) =>
  useQuery([API_TOKENS_QUERY_KEY, id, "usage"], () => getApiTokenUsage(id), {
    enabled,
  });
