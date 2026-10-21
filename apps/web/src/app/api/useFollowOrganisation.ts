import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export const followOrganisation = async (organisationId: string) =>
  await api.patch(`/favourite-organisations/${organisationId}`);

export const useFollowOrganisation = () => {
  const t = useTranslations("Toasts");
  return useMutation(followOrganisation, {
    onSuccess: () => {
      toast.success(t("followStatusChanged"), {
        icon: "🎉",
        id: "success",
      });
    },
    onError: (error: string) => {
      if (
        error === "Unauthorized" ||
        error.includes("Unauthorized") ||
        error.includes("You")
      ) {
        toast.error(t("mustBeLoggedInToFollowOrganisation"), {
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
