import { JWTResponse, LoginRequest, getRegisterUserDto } from "@biosfera/types";
import { useMutation } from "react-query";

import { api } from "./shared";
import toast from "react-hot-toast";

const registerRequest = getRegisterUserDto();

export class RegisterRequest extends registerRequest {}

const register = (data: RegisterRequest) =>
  api.post<never, JWTResponse>("/users", data);

export const useRegister = () => {
  return useMutation(register, {
    onMutate: () => {
      return { toastId: toast.loading("Register in...") };
    },
    onSuccess: ({}, _variables, context) => {
      toast.success("Uspješno registrirani", { id: context?.toastId });
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    },
    onError: (error: string, _variables, context) => {
      toast.error(error, { id: context?.toastId });
    },
  });
};
