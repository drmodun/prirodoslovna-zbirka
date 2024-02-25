import { getExponatQuery } from "@biosfera/types";
import queryString from "query-string";
import { useQuery } from "react-query";
import { baseURL } from "./shared";
export const _exponatQuery = getExponatQuery();
export class ExponatQuery extends _exponatQuery {}

export const getExponats = async (queryDto: ExponatQuery, number?: number) => {
  try {
    if (
      queryDto.attribute !== "name" &&
      queryDto.attribute !== "createdAt" &&
      queryDto.attribute !== "alternateName" &&
      queryDto.attribute !== "postAmount" &&
      queryDto.attribute !== "favourites"
    )
      delete queryDto.attribute;
    if ((queryDto as any).title) queryDto.name = (queryDto as any).title;
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

export const discoverExponats = async (params: {
  page: number;
  size: number;
}) => {
  try {
    if (!params.size) params.size = 20;
    if (!params.page) params.page = 1;
    const response = await fetch(
      `${baseURL}/exponats/discover?page=${params.page}&size=${params.size}`
    );
    console.log(response);
    return response.json();
  } catch (error) {
    console.log(error);
  }
};
