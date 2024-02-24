import { getOrganisationQuery } from "@biosfera/types";
import queryString from "query-string";
import { useQuery } from "react-query";
import { baseURL } from "./shared";
export const _organisationQuery = getOrganisationQuery();
export class OrganisationQuery extends _organisationQuery {}

export const getOrganisations = async (
  queryDto: OrganisationQuery,
  page?: number
) => {
  if (page) queryDto.page = page;
  queryDto.size = 20;
  const query = queryString.stringify(queryDto);
  const response = await fetch(`${baseURL}/organisations?${query}`);
  return response.json();
};
