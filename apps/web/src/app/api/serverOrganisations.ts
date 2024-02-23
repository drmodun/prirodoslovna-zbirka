import { getOrganisationQuery } from "@biosfera/types";
import queryString from "query-string";
import { useQuery } from "react-query";
export const _organisationQuery = getOrganisationQuery();
export class OrganisationQuery extends _organisationQuery {}

export const getOrganisations = async (
  queryDto: OrganisationQuery,
  page?: number
) => {
  if (page) queryDto.page = page;
  queryDto.size = 20;
  const query = queryString.stringify(queryDto);
  const response = await fetch(`/api/organisations?${query}`);
  return response.json();
};

export const useGetOrganisations = (
  queryDto: OrganisationQuery,
  page?: number
) => {
  return useQuery("organisations", () => getOrganisations(queryDto, page));
};
