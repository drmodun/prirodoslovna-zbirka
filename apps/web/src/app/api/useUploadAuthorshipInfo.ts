import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import {
  getCreateAuthorshipInfoDto,
  getUpdateAuthorshipInfoDto,
} from "@biosfera/types";

export const _createAuthorshipInfoDto = getCreateAuthorshipInfoDto();

export class CreateAuthorshipInfoDto extends _createAuthorshipInfoDto {}

export const uploadAuthorshipInfo = async (data: CreateAuthorshipInfoDto) =>
  await api.post("/authorship-info", data);

export const useUploadAuthorshipInfo = () => {
  return useMutation(uploadAuthorshipInfo, {
    onError: (error) => {
      toast.error("Failed to upload authorship info");
    },
    onSuccess: () => {
      toast.success("Authorship info uploaded successfully");
    },
  });
};
