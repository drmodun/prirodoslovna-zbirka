import { useMutation, useQueryClient } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const toggleFavourite = (id: string) => api.patch(`/favourite-exponats/${id}`);

export const useToggleFavourite = () => {
  const t = useTranslations("Toasts");
  const queryClient = useQueryClient();
  return useMutation(toggleFavourite, {
    onSuccess: () => {
      queryClient.invalidateQueries("exponats");
    },
    onError: (error: string) => {
      if (
        error === "Unauthorized" ||
        error.includes("Unauthorized") ||
        error.includes("You")
      ) {
        toast.error(t("mustBeLoggedInToFavourite"), {
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
