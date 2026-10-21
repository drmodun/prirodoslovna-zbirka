import { ExponatResponseShort, getCreateExponatDto } from "@biosfera/types";
import { api } from "./shared";
import { useMutation } from "react-query";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

const _createExponatDto = getCreateExponatDto();

export class CreateExponatDto extends _createExponatDto {}

const createExponat = (params: {
  exponat: CreateExponatDto;
  organisationId: string;
}) => {
  return api.post<CreateExponatDto, ExponatResponseShort>(
    `/exponats/${params.organisationId}`,
    params.exponat,
  );
};

export const useCreateExponat = () => {
  const t = useTranslations("Toasts");
  return useMutation(createExponat, {
    onError: (error: string) => {
      toast.error(error, { id: "create-exponat" });
    },
    onSuccess: () => {
      toast.success(t("exponatCreated"), {
        id: "create-exponat",
      });
    },
  });
};
