import { SortingEnum, getPostQuery } from "@biosfera/types";
import { getBaseUrl } from "./getUrlServer";
import { buildListQuery, fetchDiscover } from "./listQuery";
export const _postQuery = getPostQuery();
export class PostQuery extends _postQuery {}

const SORTABLE: string[] = [SortingEnum.TITLE, SortingEnum.CREATED_AT];

export const getPosts = async (queryDto: PostQuery, page?: number) => {
  try {
    if (queryDto.attribute === "name") queryDto.attribute = SortingEnum.TITLE;
    if ((queryDto as any).name) queryDto.title = (queryDto as any).name;
    const query = buildListQuery(queryDto, SORTABLE, page);
    const response = await fetch(`${getBaseUrl()}/posts?${query}`, {
      cache: "no-store",
    });
    return response.json();
  } catch (error) {
    console.log(error);
  }
};

export const discoverPosts = (params: { page: number; size: number }) =>
  fetchDiscover("posts", params);
