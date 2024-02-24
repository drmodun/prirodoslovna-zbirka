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
  try {
    if (page) queryDto.page = page;
    queryDto.size = 20;
    if (!queryDto.page) queryDto.page = 1;
    if (
      queryDto.attribute !== "name" &&
      queryDto.attribute !== "createdAt" &&
      queryDto.attribute !== "alternateName" &&
      queryDto.attribute !== "postAmount" &&
      queryDto.attribute !== "points"
    )
      delete queryDto.attribute;
    if ((queryDto as any).title) queryDto.name = (queryDto as any).title;
    const query = queryString.stringify(queryDto);
    const response = await fetch(`${baseURL}/organisations?${query}`);
    return response.json();
  } catch (error) {
    console.log(error);
  }
};
