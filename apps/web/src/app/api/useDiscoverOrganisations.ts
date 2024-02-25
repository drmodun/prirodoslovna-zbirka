import { useQuery } from "react-query";
import { api } from "./shared";
import { OrganisationResponseShort } from "@biosfera/types";

const discoverOrganisations = async (page: number = 1, size: number = 20) =>
  await api.get<never, OrganisationResponseShort[]>(
    `/organisations/discover?page=${page}&size=${size}`
  );

export const useDiscoverOrganisations = (page: number, size: number) => {
  return useQuery([], () => discoverOrganisations(page, size));
};
