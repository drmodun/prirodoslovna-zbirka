import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const toggleFollowOrganisations = (id: string) =>
  api.patch(`/favourite-organisations/${id}`);

export const useToggleFollowOrganisation = () => {
  const t = useTranslations("Toasts");
  return useMutation(toggleFollowOrganisations, {
    onError: (error: string) => {
      if (
        error === "Unauthorized" ||
        error.includes("Unauthorized") ||
        error.includes("You")
      ) {
        toast.error(t("mustBeLoggedInToFollowOrganisation"));
      } else {
        toast.error(t("genericError"));
      }
    },
  });
};
