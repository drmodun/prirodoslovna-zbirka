import queryString from "query-string";
import { apiUrl } from "./getUrlServer";

const PAGE_SIZE = 20;

interface ListQuery {
  attribute?: unknown;
  page?: number;
  size?: number;
}

// Shared by the server*s.ts list fetchers. Mutates queryDto on purpose:
// callers hand the same object back in when they load the next page.
export const buildListQuery = (
  queryDto: ListQuery,
  sortable: readonly string[],
  page?: number,
) => {
  if (!sortable.includes(queryDto.attribute as string))
    delete queryDto.attribute;
  if (page) queryDto.page = page;
  if (!queryDto.page) queryDto.page = 1;
  queryDto.size = PAGE_SIZE;
  return queryString.stringify(queryDto);
};

export const fetchDiscover = async (
  resource: string,
  params: { page: number; size: number },
) => {
  try {
    const size = params.size || PAGE_SIZE;
    const page = params.page || 1;
    const response = await fetch(
      apiUrl([resource, "discover"], queryString.stringify({ page, size })),
      { cache: "no-store" },
    );
    return response.json();
  } catch (error) {
    console.log(error);
  }
};
