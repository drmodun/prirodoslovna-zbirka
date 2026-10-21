import toast from "react-hot-toast";
import { useMutation } from "react-query";
import { api } from "./shared";
import { useTranslations } from "next-intl";

const resetPassword = (data: {
  userActivationCode: string;
  newPassword: string;
}) =>
  api.post(`/users/reset-password/${data.userActivationCode}`, {
    newPassword: data.newPassword,
  });

export const useResetPassword = () => {
  const t = useTranslations("Toasts");
  return useMutation(resetPassword, {
    onMutate: () => {
      return { toastId: toast.loading(t("resettingPassword")) };
    },
    onSuccess: (_data, _variables, context) => {
      toast.success(
        t("passwordReset"),
        {
          id: context?.toastId,
        },
      );
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    },
    onError: (error: string, _variables, context) => {
      toast.error(t("passwordResetFailed"), { id: context?.toastId });
    },
  });
};
