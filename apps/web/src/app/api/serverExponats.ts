import { getExponatQuery } from "@biosfera/types";
import queryString from "query-string";
import { useQuery } from "react-query";
import { baseURL } from "./shared";
export const _exponatQuery = getExponatQuery();
export class ExponatQuery extends _exponatQuery {}

export const getExponats = async (queryDto: ExponatQuery, number?: number) => {
  try {
    if (number) queryDto.page = number;
    if (!queryDto.page) queryDto.page = 1;
    queryDto.size = 20;
    const query = queryString.stringify(queryDto);
    console.log(`${baseURL}/exponats?${query}`);
    const response = await fetch(`${baseURL}/exponats?${query}`);
    return response.json();
  } catch (error) {
    console.log(error);
  }
};
