import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";

export const toggleSaveLiterature = async (literatureId: string) => {
  await api.patch(`/literature/${literatureId}`);
};

export const useToggleSaveLiterature = () =>
  useMutation(toggleSaveLiterature, {
    onMutate: (literatureId: string) => {
      toast.loading("Spremanje...", { id: "saving literature" });
      return { literatureId };
    },
    onSettled: (_data, _error, context) => {
      toast.dismiss("saving literature");
    },
    onError: (error: string, _variables, context) => {
      console.log(error);
      toast.error("Greška pri spremanju");
    },
    onSuccess: (_data, _error, context) => {
      console.log(context);
      toast.success("Uspješno spremljeno");
    },
  });
