import { getExponatQuery } from "@biosfera/types";
import queryString from "query-string";
import { useQuery } from "react-query";
import { baseURL } from "./shared";
export const _exponatQuery = getExponatQuery();
export class ExponatQuery extends _exponatQuery {}

export const getExponats = async (queryDto: ExponatQuery, number?: number) => {
  if (number) queryDto.page = number;
  queryDto.size = 20;
  const query = queryString.stringify(queryDto);
  const response = await fetch(`${baseURL}/exponats?${query}`);
  return response.json();
};
