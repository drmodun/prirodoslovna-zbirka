import { useQuery } from "react-query";
import { api } from "./shared";
import {
  ExponatResponseShort,
  OrganisationResponseShort,
} from "@biosfera/types";

const discoverExponats = async (page: number = 1, size: number = 20) =>
  await api.get<never, ExponatResponseShort[]>(
    `/exponats/discover?page=${page}&size=${size}`
  );

export const useDiscoverExponats = (page: number, size: number) => {
  return useQuery([], () => discoverExponats(page, size));
};
