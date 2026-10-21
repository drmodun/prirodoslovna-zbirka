import toast from "react-hot-toast";
import { useMutation } from "react-query";
import { api } from "./shared";
import { useTranslations } from "next-intl";

const verifyUser = (userActivationCode: string) =>
  api.post(`/users/verify/${userActivationCode}`);

export const useVerifyUser = () => {
  const t = useTranslations("Toasts");
  return useMutation(verifyUser, {
    onMutate: () => {
      return { toastId: toast.loading(t("verifying")) };
    },
    onSuccess: (_data, _variables, context) => {
      toast.success(t("verified"), {
        id: context?.toastId,
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    },
    onError: (error: string, _variables, context) => {
      toast.error(t("verifyFailed"), { id: context?.toastId });
    },
  });
};
