import { Directories } from "@biosfera/types";
import { api, fileApi } from "./shared";
import { useMutation } from "react-query";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export interface FileUploadProps {
  file: File;
  directory: Directories;
}

const uploadFile = async (params: FileUploadProps) => {
  const data = new FormData();
  data.append("file", params.file);
  const response = await fileApi.postForm(`/blobs/${params.directory}`, data);
  return response.data;
};

export const useUploadFile = () => {
  const t = useTranslations("Toasts");
  return useMutation(uploadFile, {
    onError: (error) => {
      toast.error(t("uploadFailed"));
    },
  });
};
