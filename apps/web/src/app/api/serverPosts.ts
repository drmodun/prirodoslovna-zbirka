import { getPostQuery } from "@biosfera/types";
import queryString from "query-string";
import { useQuery } from "react-query";
import { baseURL } from "./shared";
export const _postQuery = getPostQuery();
export class PostQuery extends _postQuery {}

export const getPosts = async (queryDto: PostQuery, page?: number) => {
  try {
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
