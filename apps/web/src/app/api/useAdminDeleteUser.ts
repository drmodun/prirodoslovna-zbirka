import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const deleteUser = async (id: string) => {
  await api.delete(`/users/${id}`);
};

export const useAdminDeleteUser = () => {
  const t = useTranslations("Toasts");
  return useMutation(deleteUser, {
    onError: (error) => {
      toast.error(t("userDeleteFailed"), { id: "delete-user" });
    },
    onSuccess: () => {
      toast.success(t("userDeleted"), {
        id: "delete-user",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
  });
};
