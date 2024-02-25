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

export const discoverOrganisations = async (params: {
  page: number;
  size: number;
}) => {
  try {
    if (!params.size) params.size = 20;
    if (!params.page) params.page = 1;

    const auth =
      typeof window !== "undefined" && localStorage.getItem("access_token");
    const response = await fetch(
      `${baseURL}/organisations/discover?page=${params.page}&size=${params.size}`,
      {
        ...(auth && {
          headers: {
            Authorization: `Bearer ${auth}`,
          },
        }),
      }
    );
    return response.json();
  } catch (error) {
    console.log(error);
  }
};
