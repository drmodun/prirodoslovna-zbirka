import toast from "react-hot-toast";
import { api } from "./shared";
import { useMutation } from "react-query";

const removeWork = async (id: string) => {
  await api.delete(`/works/${id}`);
};

export const useRemoveWork = () => {
  return useMutation(removeWork, {
    onMutate: () => {
      return { toastId: toast.loading("Brisanje projekta") };
    },
    onSuccess: ({}, _variables, context) => {
      toast.success("Projekt uspješno obrisan", { id: context?.toastId });
    },
    onError: (error: string, _variables, context) => {
      toast.error("Greška pri brisanju projekta", { id: context?.toastId });
    },
  });
};
