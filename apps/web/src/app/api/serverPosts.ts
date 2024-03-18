import { SortingEnum, getPostQuery } from "@biosfera/types";
import queryString from "query-string";
import { useQuery } from "react-query";
export const _postQuery = getPostQuery();
export class PostQuery extends _postQuery {}

const baseURL = process.env.DOCKER === "true" ? "http://api_container:5500" : "http://localhost:5500";

export const getPosts = async (queryDto: PostQuery, page?: number) => {
  try {
    if (queryDto.attribute === "name") queryDto.attribute = SortingEnum.TITLE;
    if (
      queryDto.attribute !== SortingEnum.TITLE &&
      queryDto.attribute !== SortingEnum.CREATED_AT
    )
      delete queryDto.attribute;
    if ((queryDto as any).name) queryDto.title = (queryDto as any).name;
    if (page) queryDto.page = page;
    if (!queryDto.page) queryDto.page = 1;
    queryDto.size = 20;
    const query = queryString.stringify(queryDto);
    const response = await fetch(`${baseURL}/posts?${query}`);
    return response.json();
  } catch (error) {
    console.log(error);
  }
};

export const discoverPosts = async (params: { page: number; size: number }) => {
  try {
    if (!params.size) params.size = 20;
    if (!params.page) params.page = 1;
    const response = await fetch(
      `${baseURL}/posts/discover?page=${params.page}&size=${params.size}`
    );
    return response.json();
  } catch (error) {
    console.log(error);
  }
};
