import { useMutation, useQueryClient } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const removeMembership = async (params: {
  organisationId: string;
  userId: string;
}) => {
  return api.delete(
    `/members/${params.organisationId}/${params.userId}/remove`,
  );
};

export const useRemoveMembership = () => {
  const t = useTranslations("Toasts");
  const queryClient = useQueryClient();
  return useMutation(removeMembership, {
    onSuccess: () => {
      toast.success(t("membershipRemoved"), {
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
        toast.error(t("mustBeAdminToRemoveMembership"), {
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
