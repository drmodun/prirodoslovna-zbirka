import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";
import { getUpdateAuthorshipInfoDto } from "@biosfera/types";
import { _updateOrganisationDto } from "./useUpdateOrganisation";

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
  return useMutation(updateAuthorshipInfo, {
    onError: (error) => {
      toast.error("Failed to update authorship info");
    },
    onSuccess: () => {
      toast.success("Authorship info updated successfully");
    },
  });
};
