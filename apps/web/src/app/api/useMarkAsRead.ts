import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export const markAsRead = async (id: string) => {
  await api.patch(`/notification-users/read/${id}`);
};

export const useMarkAsRead = () => {
  const t = useTranslations("Toasts");
  return useMutation(markAsRead, {
    onMutate: (id: string) => {
      return { id };
    },
    onError: (error: string, variables, context) => {
      console.error(error);
      toast.error(t("markAsReadFailed"));
    },
  });
};
