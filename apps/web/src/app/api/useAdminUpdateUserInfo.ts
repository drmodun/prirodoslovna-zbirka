import { getUpateUserDto } from "@biosfera/types";
import { api } from "./shared";
import { useMutation } from "react-query";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export const _updateUserDto = getUpateUserDto();

export class UpdateUserDto extends _updateUserDto {}

const editUserInfo = async (params: {
  userId: string;
  userInfo: UpdateUserDto;
}) => await api.patch(`/users/${params.userId}`, params.userInfo);

export const useAdminUpdateUserInfo = () => {
  const t = useTranslations("Toasts");
  return useMutation(editUserInfo, {
    onError: (error: string) => {
      toast.error(error, { id: "edit-user-info" });
    },
    onSuccess: () => {
      toast.success(t("userInfoUpdated"), {
        id: "edit-user-info",
      });
    },
  });
};
