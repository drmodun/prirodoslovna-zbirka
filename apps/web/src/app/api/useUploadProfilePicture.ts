import toast from "react-hot-toast";
import { api } from "./shared";
import { useMutation } from "react-query";

export const uploadProfilePicture = async (file: File) => {
  const data = new FormData();
  data.append("file", file);
  const response = await api.patchForm(`/users/pfp`, data);
  return response.data;
};

export const useUploadProfilePicture = () => {
  return useMutation(uploadProfilePicture, {
    onError: (error) => {
      toast.error("Greška prilikom uploada", { id: "upload-profile-picture" });
    },
    onSuccess: () => {
      toast.success("Promijenjena slika profila", {
        id: "upload-profile-picture",
      });
    },
  });
};
