import { getCreateOrganisationDto } from "@biosfera/types";
import { api } from "./shared";
import { useMutation } from "react-query";
import toast from "react-hot-toast";

const _createOrganisationDto = getCreateOrganisationDto();

export class CreateOrganisationDto extends _createOrganisationDto {}

const createOrganisation = (data: CreateOrganisationDto) => {
  return api.post(`/organisations`, data);
};

export const useCreateOrganisation = () => {
  return useMutation(createOrganisation, {
    onError: (error: string) => {
      toast.error(error, { id: "create-organsiation" });
    },
  });
};
