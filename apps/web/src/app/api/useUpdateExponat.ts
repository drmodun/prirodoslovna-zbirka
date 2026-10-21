import { getUpdateExponatDto } from "@biosfera/types";
import { api } from "./shared";
import { useMutation } from "react-query";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export const _updateExponatDto = getUpdateExponatDto();
export class UpdateExponatDto extends _updateExponatDto {}

export const updateExponat = async (params: {
  exponatId: string;
  updateExponatDto: UpdateExponatDto;
}) => {
  await api.patch(`/exponats/${params.exponatId}`, params.updateExponatDto);
};

export const useUpdateExponat = () => {
  const t = useTranslations("Toasts");
  return useMutation(updateExponat, {
    onError: (error: string) => {
      console.log(error);
      toast.error(t("exponatUpdateFailed"), {
        id: "update-exponat",
      });
    },
    onSuccess: () => {
      toast.success(t("exponatUpdated"), {
        id: "update-exponat",
      });
    },
  });
};
