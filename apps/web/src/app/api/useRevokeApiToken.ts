import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { useTranslations } from "next-intl";
import { api } from "./shared";
import { API_TOKENS_QUERY_KEY } from "./useGetApiTokens";

const revokeApiToken = (id: string) => api.delete(`/auth/tokens/${id}`);

export const useRevokeApiToken = () => {
  const t = useTranslations("Toasts");
  const queryClient = useQueryClient();
  return useMutation(revokeApiToken, {
    onSuccess: () => {
      toast.success(t("apiTokenRevoked"), { id: "api-token" });
      queryClient.invalidateQueries(API_TOKENS_QUERY_KEY);
    },
    onError: (error: string) => {
      toast.error(error || t("apiTokenRevokeFailed"), { id: "api-token" });
    },
  });
};
