import { getOrganisationQuery } from "@biosfera/types";
import { apiUrl } from "./getUrlServer";
import { buildListQuery, fetchDiscover } from "./listQuery";
export const _organisationQuery = getOrganisationQuery();
export class OrganisationQuery extends _organisationQuery {}

const SORTABLE = ["name", "createdAt", "alternateName", "postAmount", "points"];

export const getOrganisations = async (
  queryDto: OrganisationQuery,
  page?: number,
) => {
  try {
    if ((queryDto as any).title) queryDto.name = (queryDto as any).title;
    const query = buildListQuery(queryDto, SORTABLE, page);
    const response = await fetch(apiUrl(["organisations"], query), {
      cache: "no-store",
    });
    return response.json();
  } catch (error) {
    console.log(error);
  }
};

export const discoverOrganisations = (params: { page: number; size: number }) =>
  fetchDiscover("organisations", params);
