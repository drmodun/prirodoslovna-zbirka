import {
  CreateApiTokenRequest,
  CreatedApiTokenResponse,
} from "@biosfera/types";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { useTranslations } from "next-intl";
import { api } from "./shared";
import { API_TOKENS_QUERY_KEY } from "./useGetApiTokens";

const createApiToken = (data: CreateApiTokenRequest) =>
  api.post<never, CreatedApiTokenResponse>("/auth/tokens", data);

export const useCreateApiToken = () => {
  const t = useTranslations("Toasts");
  const queryClient = useQueryClient();
  return useMutation(createApiToken, {
    onSuccess: () => {
      toast.success(t("apiTokenCreated"), { id: "api-token" });
      queryClient.invalidateQueries(API_TOKENS_QUERY_KEY);
    },
    onError: (error: string) => {
      toast.error(error || t("apiTokenCreateFailed"), { id: "api-token" });
    },
  });
};
