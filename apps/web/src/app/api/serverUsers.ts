import { getUserQuery } from "@biosfera/types";
import queryString from "query-string";
import { useQuery } from "react-query";
import { baseURL } from "./shared";
export const _userQuery = getUserQuery();
export class UserQuery extends _userQuery {}

export const getUsers = async (queryDto: UserQuery, page?: number) => {
  try {
    if (queryDto.attribute === "name") queryDto.attribute = "username";
    if (
      queryDto.attribute !== "username" &&
      queryDto.attribute !== "points" &&
      queryDto.attribute !== "county" &&
      queryDto.attribute !== "postAmount" &&
      queryDto.attribute !== "followers" &&
      queryDto.attribute !== "following"
    )
      delete queryDto.attribute;
    if (page) queryDto.page = page;
    if (!queryDto.page) queryDto.page = 1;
    queryDto.size = 20;
    const query = queryString.stringify(queryDto);
    const response = await fetch(`${baseURL}/users?${query}`);
    return response.json();
  } catch (error) {
    console.log(error);
  }
};
