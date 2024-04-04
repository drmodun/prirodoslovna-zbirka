import { JWTResponse, LoginRequest } from "@biosfera/types";
import { useMutation } from "react-query";

import { api } from "./shared";
import toast from "react-hot-toast";

const login = (data: LoginRequest) =>
  api.post<never, JWTResponse>("/auth/login", data);

export const useLogin = () => {
  return useMutation(login, {
    onMutate: () => {
      return { toastId: toast.loading("Logging in...") };
    },
    onSuccess: ({ access_token }, _variables, context) => {
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("loggedTime", new Date().toISOString());
      toast.success("Logged in successfully!", { id: context?.toastId });
      window.location.href = "/discover";
    },
    onError: (error: string, _variables, context) => {
      toast.error(error, { id: context?.toastId });
    },
  });
};
