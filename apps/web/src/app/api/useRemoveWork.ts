import toast from "react-hot-toast";
import { api } from "./shared";
import { useMutation } from "react-query";
import { useTranslations } from "next-intl";

const removeWork = async (id: string) => {
  await api.delete(`/works/${id}`);
};

export const useRemoveWork = () => {
  const t = useTranslations("Toasts");
  return useMutation(removeWork, {
    onMutate: () => {
      return { toastId: toast.loading(t("deletingWork")) };
    },
    onSuccess: (_data, _variables, context) => {
      toast.success(t("workDeleted"), { id: context?.toastId });
    },
    onError: (error: string, _variables, context) => {
      toast.error(t("workDeleteFailed"), { id: context?.toastId });
    },
  });
};
