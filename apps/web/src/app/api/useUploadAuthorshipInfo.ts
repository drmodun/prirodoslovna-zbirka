import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import {
  getCreateAuthorshipInfoDto,
  getUpdateAuthorshipInfoDto,
} from "@biosfera/types";
import { useTranslations } from "next-intl";

export const _createAuthorshipInfoDto = getCreateAuthorshipInfoDto();

export class CreateAuthorshipInfoDto extends _createAuthorshipInfoDto {}

export const uploadAuthorshipInfo = async (data: CreateAuthorshipInfoDto) =>
  await api.post("/authorship-info", data);

export const useUploadAuthorshipInfo = () => {
  const t = useTranslations("Toasts");
  return useMutation(uploadAuthorshipInfo, {
    onError: (error) => {
      toast.error(t("authorshipUploadFailed"));
    },
    onSuccess: () => {
      toast.success(t("authorshipUploaded"));
    },
  });
};
