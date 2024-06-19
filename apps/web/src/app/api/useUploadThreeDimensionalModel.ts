import { useMutation } from "react-query";
import { api, fileApi } from "./shared";
import { FileUploadProps } from "./useUploadFile";
import toast from "react-hot-toast";

const uploadModel = async (params: FileUploadProps) => {
  const data = new FormData();
  data.append("file", params.file);
  const response = await fileApi.postForm(
    `/blobs/model/${params.directory}`,
    data
  );
  return response.data;
};

export const useUploadThreeDimensionalModel = () => {
  return useMutation(uploadModel, {
    onError: (error) => {
      toast.error("Greška prilikom uploada");
    },
  });
};
