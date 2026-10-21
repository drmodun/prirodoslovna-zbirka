import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export const toggleSaveLiterature = async (literatureId: string) => {
  await api.patch(`/literature/${literatureId}`);
};

export const useToggleSaveLiterature = () => {
  const t = useTranslations("Toasts");
  return useMutation(toggleSaveLiterature, {
    onMutate: (literatureId: string) => {
      toast.loading(t("saving"), { id: "saving literature" });
      return { literatureId };
    },
    onSettled: (_data, _error, context) => {
      toast.dismiss("saving literature");
    },
    onError: (error: string, _variables, context) => {
      console.log(error);
      toast.error(t("saveFailed"));
    },
    onSuccess: (_data, _error, context) => {
      console.log(context);
      toast.success(t("saved"));
    },
  });
};
