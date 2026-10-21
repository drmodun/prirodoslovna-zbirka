import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const toggleLike = (id: string) => api.post(`/likes/${id}`);

export const useToggleLike = () => {
  const t = useTranslations("Toasts");
  return useMutation(toggleLike, {
    onError: (error: string) => {
      if (
        error === "Unauthorized" ||
        error.includes("Unauthorized") ||
        error.includes("You")
      ) {
        toast.error(t("mustBeLoggedInToLike"), {
          icon: "🔒",
          id: "unauthorized",
        });
      } else {
        toast.error(t("genericError"), {
          icon: "🚨",
          id: "error",
        });
      }
    },
  });
};
