import { RevokeAllApiTokensResponse } from "@biosfera/types";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { useTranslations } from "next-intl";
import { api } from "./shared";
import { API_TOKENS_QUERY_KEY } from "./useGetApiTokens";

const revokeAllApiTokens = () =>
  api.delete<never, RevokeAllApiTokensResponse>("/auth/tokens");

export const useRevokeAllApiTokens = () => {
  const t = useTranslations("Toasts");
  const queryClient = useQueryClient();
  return useMutation(revokeAllApiTokens, {
    onSuccess: (data) => {
      toast.success(t("apiTokensRevoked", { count: data?.revoked ?? 0 }), {
        id: "api-token",
      });
      queryClient.invalidateQueries(API_TOKENS_QUERY_KEY);
    },
    onError: (error: string) => {
      toast.error(error || t("apiTokenRevokeFailed"), { id: "api-token" });
    },
  });
};
