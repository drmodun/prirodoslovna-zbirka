import { getExponatQuery } from "@biosfera/types";
import { apiUrl } from "./getUrlServer";
import { buildListQuery, fetchDiscover } from "./listQuery";
export const _exponatQuery = getExponatQuery();
export class ExponatQuery extends _exponatQuery {}

const SORTABLE = [
  "name",
  "createdAt",
  "alternateName",
  "postAmount",
  "favourites",
];

export const getExponats = async (queryDto: ExponatQuery, number?: number) => {
  try {
    if ((queryDto as any).title) queryDto.name = (queryDto as any).title;
    const query = buildListQuery(queryDto, SORTABLE, number);
    const response = await fetch(apiUrl(["exponats"], query), {
      cache: "no-store",
    });
    return response.json();
  } catch (error) {
    console.log(error);
  }
};

export const discoverExponats = (params: { page: number; size: number }) =>
  fetchDiscover("exponats", params);
