import { JWTResponse, LoginRequest } from "../../../../../packages/types/auth";
import { useMutation } from "react-query";

import { api } from "./shared";
import toast from "react-hot-toast";

const login = (data: LoginRequest) =>
  api.post<never, JWTResponse>("/auth/login", data);

export const useLogin = (navigate: () => void) => {
  return useMutation(login, {
    onMutate: () => {
      return { toastId: toast.loading("Logging in...") };
    },
    onSuccess: ({ access_token }, _variables, context) => {
      localStorage.setItem("access_token", access_token);
      toast.success("Logged in successfully!", { id: context?.toastId });

      navigate();
    },
    onError: (error: string, _variables, context) => {
      toast.error(error, { id: context?.toastId });
    },
  });
};
