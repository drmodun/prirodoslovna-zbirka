import {
  OrganisationResponseShort,
  getUpdateOrganisationDto,
} from "@biosfera/types";
import { api } from "./shared";
import { useMutation } from "react-query";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export const _updateOrganisationDto = getUpdateOrganisationDto();
export class UpdateOrganisationDto extends _updateOrganisationDto {}

export const updateOrganisation = async (params: {
  organisationId: string;
  updateOrganisationDto: UpdateOrganisationDto;
}) => {
  await api.patch<UpdateOrganisationDto, OrganisationResponseShort>(
    `/organisations/${params.organisationId}`,
    params.updateOrganisationDto,
  );
};

export const useUpdateOrganisation = () => {
  const t = useTranslations("Toasts");
  return useMutation(updateOrganisation, {
    onError: (error: string) => {
      toast.error(
        t("organisationUpdateFailed"),
        { id: "update-organisation" },
      );
      console.log(error);
    },
    onSuccess: () => {
      toast.success(t("organisationUpdated"), {
        id: "update-organisation",
      });
    },
  });
};
