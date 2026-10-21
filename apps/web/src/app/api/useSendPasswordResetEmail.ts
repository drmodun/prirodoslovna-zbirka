import { useMutation, useQuery } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const sendResetPasswordEmail = (email: string) =>
  api.post(`/users/forgot-password/${email}`);

export const useSendPasswordResetEmail = () => {
  const t = useTranslations("Toasts");
  return useMutation(sendResetPasswordEmail, {
    onError: (error: string) => {
      toast.error(t("passwordResetEmailFailed"), {
        id: "send-reset-password-email",
      });
      console.error(error);
    },
    onSuccess: () => {
      toast.success(t("passwordResetEmailSent"), {
        id: "send-reset-password-email",
      });
    },
  });
};
