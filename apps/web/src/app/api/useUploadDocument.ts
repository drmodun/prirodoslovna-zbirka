import { Directories } from "@biosfera/types";
import { fileApi } from "./shared";
import { useMutation } from "react-query";
import toast from "react-hot-toast";
import { time } from "console";
import { useTranslations } from "next-intl";

export interface DocumentUploadProps {
  file: File;
  directory: Directories;
}

const uploadDocument = async (params: DocumentUploadProps) => {
  const data = new FormData();
  data.append("file", params.file);
  const response = await fileApi.postForm(
    `/blobs/pdf/${params.directory}`,
    data,
    {
      timeout: 15000, //bigger files take more time to upload
    },
  );
  return response.data;
};

export const useUploadDocument = () => {
  const t = useTranslations("Toasts");
  return useMutation(uploadDocument, {
    onMutate: () => {
      toast.loading(t("uploadingDocument"));
    },
    onError: (error) => {
      toast.error(t("documentUploadFailed"));
    },
  });
};
