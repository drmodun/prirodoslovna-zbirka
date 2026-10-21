import { JWTResponse, LoginRequest } from "@biosfera/types";
import { useMutation } from "react-query";

import { api } from "./shared";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const login = (data: LoginRequest) =>
  api.post<never, JWTResponse>("/auth/login", data);

export const useLogin = () => {
  const t = useTranslations("Toasts");
  return useMutation(login, {
    onMutate: () => {
      return { toastId: toast.loading(t("loggingIn")) };
    },
    onSuccess: ({ access_token }, _variables, context) => {
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("loggedTime", new Date().toISOString());
      toast.success(t("loggedIn"), { id: context?.toastId });
      window.location.href = "/discover";
    },
    onError: (error: string, _variables, context) => {
      toast.error(error, { id: context?.toastId });
    },
  });
};
