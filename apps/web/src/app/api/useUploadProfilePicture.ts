import toast from "react-hot-toast";
import { api } from "./shared";
import { useMutation } from "react-query";
import { useTranslations } from "next-intl";

export const uploadProfilePicture = async (file: File) => {
  const data = new FormData();
  data.append("file", file);
  const response = await api.patchForm(`/users/pfp`, data);
  return response.data;
};

export const useUploadProfilePicture = () => {
  const t = useTranslations("Toasts");
  return useMutation(uploadProfilePicture, {
    onError: (error) => {
      toast.error(t("uploadFailed"), { id: "upload-profile-picture" });
    },
    onSuccess: () => {
      toast.success(t("profilePictureUpdated"), {
        id: "upload-profile-picture",
      });
    },
  });
};
