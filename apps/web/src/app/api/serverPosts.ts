import { getPostQuery } from "@biosfera/types";
import queryString from "query-string";
import { useQuery } from "react-query";
import { baseURL } from "./shared";
export const _postQuery = getPostQuery();
export class PostQuery extends _postQuery {}

export const getPosts = async (queryDto: PostQuery, page?: number) => {
  if (page) queryDto.page = page;
  queryDto.size = 20;
  const query = queryString.stringify(queryDto);
  const response = await fetch(`${baseURL}/posts?${query}`);
  return response.json();
};
