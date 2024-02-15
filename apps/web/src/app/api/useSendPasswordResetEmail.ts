import { useMutation, useQuery } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";

const sendResetPasswordEmail = (email: string) =>
  api.post(`/forgot-password/${email}`);

export const useSendPasswordResetEmail = () => {
  return useMutation(sendResetPasswordEmail, {
    onError: (error: string) => {
      toast.error("Greška pri slanju emaila za resetiranje lozinke");
    },
    onSuccess: () => {
      toast.success("Email za resetiranje lozinke je poslan");
    },
  });
};
