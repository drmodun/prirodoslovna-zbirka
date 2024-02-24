import { getUserQuery } from "@biosfera/types";
import queryString from "query-string";
import { useQuery } from "react-query";
import { baseURL } from "./shared";
export const _userQuery = getUserQuery();
export class UserQuery extends _userQuery {}

export const getUsers = async (queryDto: UserQuery, page?: number) => {
  if (page) queryDto.page = page;
  queryDto.size = 20;
  const query = queryString.stringify(queryDto);
  const response = await fetch(`${baseURL}/users?${query}`);
  return response.json();
};
