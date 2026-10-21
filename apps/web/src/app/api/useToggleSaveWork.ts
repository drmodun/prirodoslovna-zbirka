import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export const toggleSaveWork = async (workId: string) => {
  await api.patch(`saved-works/${workId}`);
};

export const useToggleSaveWork = () => {
  const t = useTranslations("Toasts");
  return useMutation(toggleSaveWork, {
    onMutate: (workId: string) => {
      toast.loading(t("saving"), { id: "saving work" });
      return { workId };
    },
    onSettled: (_data, _error, context) => {
      toast.dismiss("saving work");
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
