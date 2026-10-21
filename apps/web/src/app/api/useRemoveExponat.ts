import { useMutation, useQueryClient } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const removeExponat = async (id: string) => {
  return api.delete(`/exponats/${id}`);
};

export const useRemoveExponat = () => {
  const t = useTranslations("Toasts");
  const queryClient = useQueryClient();
  return useMutation(removeExponat, {
    onSuccess: () => {
      toast.success(t("exponatRemoved"), {
        icon: "👋",
        id: "exponat_removal_success",
      });
      queryClient.invalidateQueries("exponats");
    },
    onError: (error: string) => {
      if (
        error === "Unauthorized" ||
        error.includes("Unauthorized") ||
        error.includes("You")
      ) {
        toast.error(t("mustBeAdminToRemoveExponat"), {
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
