import toast from "react-hot-toast";
import { useMutation } from "react-query";
import { api } from "./shared";

const verifyUser = (userActivationCode: string) =>
  api.post(`/users/verify/${userActivationCode}`);

export const useVerifyUser = () => {
  return useMutation(verifyUser, {
    onMutate: () => {
      return { toastId: toast.loading("Verifying user...") };
    },
    onSuccess: ({}, _variables, context) => {
      toast.success("Uspješna verifikacija, preusmjeravanje na prijavu", {
        id: context?.toastId,
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    },
    onError: (error: string, _variables, context) => {
      toast.error("Greška pri verifikaciji", { id: context?.toastId });
    },
  });
};
