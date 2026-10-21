import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const updateUserRole = async (params: {
  organisationId: string;
  userId: string;
  role: string;
}) => {
  return await api.patch(`/members/${params.organisationId}/${params.userId}`, {
    role: params.role,
  });
};

export const useUpdateUserRole = () => {
  const t = useTranslations("Toasts");
  return useMutation(updateUserRole, {
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
