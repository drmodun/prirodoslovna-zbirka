import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const toggleFollow = (id: string) => api.post(`/follows/${id}`);

export const useToggleFollow = () => {
  const t = useTranslations("Toasts");
  return useMutation(toggleFollow, {
    onError: (error: string) => {
      if (
        error === "Unauthorized" ||
        error.includes("Unauthorized") ||
        error.includes("You")
      ) {
        toast.error(t("mustBeLoggedInToFollowUser"));
      } else {
        toast.error(t("genericError"));
      }
    },
  });
};
