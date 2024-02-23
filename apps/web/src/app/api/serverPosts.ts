import { getPostQuery } from "@biosfera/types";
import queryString from "query-string";
export const _postQuery = getPostQuery();
export class PostQuery extends _postQuery {}

export const getPosts = async (queryDto: PostQuery) => {
  const query = queryString.stringify(queryDto);
  const response = await fetch(`/api/posts?${query}`);
  return response.json();
};
