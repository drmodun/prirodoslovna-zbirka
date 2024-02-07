import { getCreateOrganisationDto } from "@biosfera/types";
import { api } from "./shared";
import { useMutation } from "react-query";
import toast from "react-hot-toast";

const _createOrganisationDto = getCreateOrganisationDto();

export class CreateOrganisationDto extends _createOrganisationDto {}

const createOrganisation = (params: {
  organisation: CreateOrganisationDto;
}) => {
  return api.post(`/organisations`, params.organisation);
};

export const useCreateOrganisation = () => {
  return useMutation(createOrganisation, {
    onError: (error: string) => {
      toast.error(error, { id: "create-organsiation" });
    },
  });
};
