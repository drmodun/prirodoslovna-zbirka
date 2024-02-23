import { useMutation, useQuery } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";

const sendResetPasswordEmail = (email: string) =>
  api.post(`/users/forgot-password/${email}`);

export const useSendPasswordResetEmail = () => {
  return useMutation(sendResetPasswordEmail, {
    onError: (error: string) => {
      toast.error("Greška pri slanju emaila za resetiranje lozinke", {
        id: "send-reset-password-email",
      });
      console.error(error);
    },
    onSuccess: () => {
      toast.success("Email za resetiranje lozinke je poslan", {
        id: "send-reset-password-email",
      });
    },
  });
};
