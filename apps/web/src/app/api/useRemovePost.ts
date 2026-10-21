import { useMutation, useQueryClient } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const removePost = async (id: string) => {
  return api.delete(`/posts/${id}`);
};

export const useRemovePost = () => {
  const t = useTranslations("Toasts");
  const queryClient = useQueryClient();
  return useMutation(removePost, {
    onSuccess: () => {
      toast.success(t("postRemoved"), {
        icon: "👋",
        id: "post_removal_success",
      });
      queryClient.invalidateQueries("posts");
    },
    onError: (error: string) => {
      console.log(error);
      if (
        error === "Unauthorized" ||
        error.includes("Unauthorized") ||
        error.includes("You")
      ) {
        toast.error(t("mustBeAdminToRemovePost"), {
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
