import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const requestMembership = async (id: string) => {
  return await api.post(`/members/${id}`);
};

export const useRequestMembership = () => {
  const t = useTranslations("Toasts");
  return useMutation(requestMembership, {
    onSuccess: () => {
      toast.success(t("membershipRequested"), {
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
        toast.error(
          t("mustBeLoggedInToRequestMembership"),
          {
            icon: "🔒",
            id: "unauthorized",
          },
        );
      } else {
        toast.error(t("genericError"), {
          icon: "🚨",
          id: "error",
        });
      }
    },
  });
};
