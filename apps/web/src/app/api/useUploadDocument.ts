import { Directories } from "@biosfera/types";
import { fileApi } from "./shared";
import { useMutation } from "react-query";
import toast from "react-hot-toast";

export interface DocumentUploadProps {
  file: File;
  directory: Directories;
}

const uploadDocument = async (params: DocumentUploadProps) => {
  const data = new FormData();
  data.append("file", params.file);
  const response = await fileApi.postForm(
    `/blobs/${params.directory}/pdf`,
    data
  );
  return response.data;
};

export const useUploadDocument = () => {
  return useMutation(uploadDocument, {
    onError: (error) => {
      toast.error("Greška prilikom uploada dokumenta");
    },
  });
};