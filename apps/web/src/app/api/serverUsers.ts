import { getUserQuery } from "@biosfera/types";
import queryString from "query-string";
export const _userQuery = getUserQuery();
export class UserQuery extends _userQuery {}

export const getUsers = async (queryDto: UserQuery) => {
  const query = queryString.stringify(queryDto);
  const response = await fetch(`/api/users?${query}`);
  return response.json();
};
