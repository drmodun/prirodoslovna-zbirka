import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const ownerUpdateUserRole = async (params: {
  organisationId: string;
  userId: string;
  role: string;
}) => {
  return await api.post(
    `/members/${params.organisationId}/${params.userId}/owner`,
    {
      role: params.role,
    },
  );
};

export const useOwnerUpdateUserRole = () => {
  const t = useTranslations("Toasts");
  return useMutation(ownerUpdateUserRole, {
    onSuccess: () => {
      toast.success(t("roleUpdated"), {
        id: "update-user-role",
        icon: "👏",
      });
    },
    onError: (error) => {
      toast.error(t("roleUpdateFailed"), {
        id: "update-user-role",
        icon: "👏",
      });
    },
  });
};
