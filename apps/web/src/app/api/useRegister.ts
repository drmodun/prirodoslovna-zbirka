import { JWTResponse, LoginRequest, getRegisterUserDto } from "@biosfera/types";
import { useMutation } from "react-query";

import { api } from "./shared";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const registerRequest = getRegisterUserDto();

export class RegisterRequest extends registerRequest {}

const register = (data: RegisterRequest) =>
  api.post<never, JWTResponse>("/users", data);

export const useRegister = () => {
  const t = useTranslations("Toasts");
  return useMutation(register, {
    onMutate: () => {
      return { toastId: toast.loading(t("registering")) };
    },
    onSuccess: (_data, _variables, context) => {
      toast.success(t("registered"), { id: context?.toastId });
    },
    onError: (error: string, _variables, context) => {
      toast.error(
        t("registerFailed"),
        { id: context?.toastId },
      );
    },
  });
};
