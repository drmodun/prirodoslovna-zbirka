import { useMutation, useQueryClient } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const leaveMembership = async (id: string) => {
  return api.delete(`/members/${id}/leave`);
};

export const useLeaveMembership = () => {
  const t = useTranslations("Toasts");
  const queryClient = useQueryClient();
  return useMutation(leaveMembership, {
    onSuccess: () => {
      toast.success(t("leftOrganisation"), {
        icon: "👋",
        id: "membership_removal_success",
      });
      queryClient.invalidateQueries("memberships");
    },
    onError: (error: string) => {
      if (
        error === "Unauthorized" ||
        error.includes("Unauthorized") ||
        error.includes("You")
      ) {
        toast.error(t("invalidAuthorization"), {
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
