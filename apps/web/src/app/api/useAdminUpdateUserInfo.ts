import { getUpateUserDto } from "@biosfera/types";
import { api } from "./shared";
import { useMutation } from "react-query";
import toast from "react-hot-toast";

export const _updateUserDto = getUpateUserDto();

export class UpdateUserDto extends _updateUserDto {}

const editUserInfo = async (params: {
  userId: string;
  userInfo: UpdateUserDto;
}) => await api.patch(`/users/${params.userId}`, params.userInfo);

export const useEditUserInfo = () => {
  return useMutation(editUserInfo, {
    onError: (error: string) => {
      toast.error(error, { id: "edit-user-info" });
    },
    onSuccess: () => {
      toast.success("Promijenjene informacije o korisniku", {
        id: "edit-user-info",
      });
    },
  });
};
