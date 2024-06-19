import { useMutation } from "react-query";
import { fileApi } from "./shared";
import { FileUploadProps } from "./useUploadFile";
import toast from "react-hot-toast";

const uploadVideo = async (params: FileUploadProps) => {
  const data = new FormData();
  data.append("file", params.file);
  const response = await fileApi.postForm(
    `/blobs/video/${params.directory}`,
    data
  );
  return response.data;
};

export const useUploadVideo = () => {
  return useMutation(uploadVideo, {
    onError: (error) => {
      toast.error("Greška prilikom uploada");
    },
  });
};
