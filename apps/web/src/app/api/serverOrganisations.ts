import { getOrganisationQuery } from "@biosfera/types";
import queryString from "query-string";
export const _organisationQuery = getOrganisationQuery();
export class OrganisationQuery extends _organisationQuery {}

export const getOrganisations = async (queryDto: OrganisationQuery) => {
  const query = queryString.stringify(queryDto);
  const response = await fetch(`/api/organisations?${query}`);
  return response.json();
};
