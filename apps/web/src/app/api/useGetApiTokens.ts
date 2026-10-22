import { ApiTokenResponse } from "@biosfera/types";
import { useQuery } from "react-query";
import { api } from "./shared";

export const API_TOKENS_QUERY_KEY = "apiTokens";

const getApiTokens = () => api.get<never, ApiTokenResponse[]>("/auth/tokens");

export const useGetApiTokens = () =>
  useQuery(API_TOKENS_QUERY_KEY, getApiTokens);
