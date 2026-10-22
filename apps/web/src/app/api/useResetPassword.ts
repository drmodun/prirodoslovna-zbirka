import { ResetPasswordResponse } from "@biosfera/types";
import toast from "react-hot-toast";
import { useMutation } from "react-query";
import { api } from "./shared";
import { useTranslations } from "next-intl";

const resetPassword = (data: {
  userActivationCode: string;
  newPassword: string;
}) =>
  api.post<never, ResetPasswordResponse>(
    `/users/reset-password/${data.userActivationCode}`,
    {
      newPassword: data.newPassword,
    },
  );

// Where to go once the reset is done: the API logs activated users in.
export const afterPasswordReset = (loggedIn: boolean) => {
  window.location.href = loggedIn ? "/discover" : "/login";
};

export const useResetPassword = () => {
  const t = useTranslations("Toasts");
  return useMutation(resetPassword, {
    onMutate: () => {
      return { toastId: toast.loading(t("resettingPassword")) };
    },
    onSuccess: (data, _variables, context) => {
      toast.success(t("passwordReset"), {
        id: context?.toastId,
      });
      if (data?.access_token) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("loggedTime", new Date().toISOString());
      }
      // With API tokens left the form first asks whether to revoke them.
      if (data?.activeApiTokens) return;
      setTimeout(() => afterPasswordReset(!!data?.access_token), 2000);
    },
    onError: (error: string, _variables, context) => {
      toast.error(t("passwordResetFailed"), { id: context?.toastId });
    },
  });
};
