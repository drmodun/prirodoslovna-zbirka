import toast from "react-hot-toast";
import { api } from "./shared";
import { QueryClient, useMutation } from "react-query";
import { useTranslations } from "next-intl";

const toggleApproval = async (params: { id: string; entity: string }) =>
  api.patch(`/${params.entity}/${params.id}/approval`);

export const useToggleApproval = () => {
  const t = useTranslations("Toasts");
  return useMutation(toggleApproval, {
    onError: (error: string) => {
      if (
        error === "Unauthorized" ||
        error.includes("Unauthorized") ||
        error.includes("You")
      ) {
        toast.error(t("mustBeAdminToChangeVisibility"), {
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
