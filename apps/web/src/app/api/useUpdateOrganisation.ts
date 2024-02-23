import { getUpdateOrganisationDto } from "@biosfera/types";
import { api } from "./shared";
import { useMutation } from "react-query";
import toast from "react-hot-toast";

export const _updateOrganisationDto = getUpdateOrganisationDto();
export class UpdateOrganisationDto extends _updateOrganisationDto {}

export const updateOrganisation = async (params: {
  organisationId: string;
  updateOrganisationDto: UpdateOrganisationDto;
}) => {
  await api.patch(
    `/organisations/${params.organisationId}`,
    params.updateOrganisationDto
  );
};

export const useUpdateOrganisation = () => {
  return useMutation(updateOrganisation, {
    onError: (error: string) => {
      toast.error(
        "Greška se dogodila tijekom mijenjanja podataka organizacije",
        { id: "update-organisation" }
      );
      console.log(error);
    },
    onSuccess: () => {
      toast.success("Promijenjeni podaci organizacije", {
        id: "update-organisation",
      });
    },
  });
};
