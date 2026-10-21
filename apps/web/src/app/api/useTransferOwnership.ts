import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const transferOwnership = async (params: {
  organisationId: string;
  userId: string;
  role: string;
}) => {
  return await api.put(
    `/members/${params.organisationId}/${params.userId}/transfer`,
  );
};

export const useTransferOwnership = () => {
  const t = useTranslations("Toasts");
  return useMutation(transferOwnership, {
    onSuccess: () => {
      toast.success(t("ownershipTransferred"), {
        id: "update-user-role",
        icon: "👏",
      });
    },
    onError: (error) => {
      toast.error(t("ownershipTransferFailed"), {
        id: "update-user-role",
        icon: "👏",
      });
    },
  });
};
