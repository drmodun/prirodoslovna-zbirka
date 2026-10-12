import toast from "react-hot-toast";
import { useMutation } from "react-query";
import { api } from "./shared";

const resetPassword = (data: {
  userActivationCode: string;
  newPassword: string;
}) =>
  api.post(`/users/reset-password/${data.userActivationCode}`, {
    newPassword: data.newPassword,
  });

export const useResetPassword = () => {
  return useMutation(resetPassword, {
    onMutate: () => {
      return { toastId: toast.loading("Resetting password...") };
    },
    onSuccess: ({}, _variables, context) => {
      toast.success(
        "Uspješno resetiranje lozinke, preusmjeravanje na prijavu",
        {
          id: context?.toastId,
        },
      );
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    },
    onError: (error: string, _variables, context) => {
      toast.error("Greška pri resetiranju šifre", { id: context?.toastId });
    },
  });
};
