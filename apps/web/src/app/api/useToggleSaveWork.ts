import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";

export const toggleSaveWork = async (workId: string) => {
  await api.patch(`saved-works/${workId}`);
};

export const useToggleSaveWork = () =>
  useMutation(toggleSaveWork, {
    onMutate: (workId: string) => {
      toast.loading("Spremanje...", { id: "saving work" });
      return { workId };
    },
    onSettled: (_data, _error, context) => {
      toast.dismiss("saving work");
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