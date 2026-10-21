import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { getUpdateAuthorshipInfoDto } from "@biosfera/types";
import { _updateOrganisationDto } from "./useUpdateOrganisation";
import { useTranslations } from "next-intl";

export const _updateAuthorshipInfoDto = getUpdateAuthorshipInfoDto();

export class UpdateAuthorshipInfoDto extends _updateOrganisationDto {}

export const updateAuthorshipInfo = async (data: {
  id: string;
  object: UpdateAuthorshipInfoDto;
}) => {
  const response = await api.patch(`/authorship-info/${data.id}`, data.object);
  return response.data;
};

export const useUpdateAuthorshipInfo = () => {
  const t = useTranslations("Toasts");
  return useMutation(updateAuthorshipInfo, {
    onError: (error) => {
      toast.error(t("authorshipUpdateFailed"));
    },
    onSuccess: () => {
      toast.success(t("authorshipUpdated"));
    },
  });
};
