import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export const markAllAsRead = async () => {
  await api.patch(`/notification-users/read/all`);
};

export const useMarkAllAsRead = () => {
  const t = useTranslations("Toasts");
  return useMutation(markAllAsRead, {
    onError: (error: string) => {
      console.error(error);
      toast.error(t("markAsReadFailed"));
    },
  });
};
