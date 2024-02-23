import { getExponatQuery } from "@biosfera/types";
import queryString from "query-string";
export const _exponatQuery = getExponatQuery();
export class ExponatQuery extends _exponatQuery {}

export const getExponats = async (queryDto: ExponatQuery) => {
  const query = queryString.stringify(queryDto);
  const response = await fetch(`/api/exponats?${query}`);
  return response.json();
};
