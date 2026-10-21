import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const deleteOrganisation = async (id: string) => {
  await api.delete(`/organisations/${id}`);
};

export const useDeleteOrganisation = () => {
  const t = useTranslations("Toasts");
  return useMutation(deleteOrganisation, {
    onError: (error) => {
      toast.error(t("organisationDeleteFailed"), {
        id: "delete-organisation",
      });
    },
    onSuccess: () => {
      toast.success(t("organisationDeleted"), {
        id: "delete-organisation",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
  });
};
