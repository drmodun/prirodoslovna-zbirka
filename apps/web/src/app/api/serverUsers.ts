import { getUserQuery } from "@biosfera/types";
import { apiFetch } from "./getUrlServer";
import { buildListQuery } from "./listQuery";
export const _userQuery = getUserQuery();
export class UserQuery extends _userQuery {}

const SORTABLE = [
  "username",
  "points",
  "county",
  "postAmount",
  "followers",
  "following",
];

export const getUsers = async (queryDto: UserQuery, page?: number) => {
  try {
    if (queryDto.attribute === "name") queryDto.attribute = "username";
    if ((queryDto as any).title) queryDto.name = (queryDto as any).title;
    const query = buildListQuery(queryDto, SORTABLE, page);
    const response = await apiFetch(["users"], {
      query,
      cache: "no-store",
    });
    return response.json();
  } catch (error) {
    console.log(error);
  }
};
