import { useQuery } from "react-query";
import { api } from "./shared";
import { OrganisationResponseShort, PostResponse } from "@biosfera/types";

const discoverPosts = async (page: number = 1, size: number = 20) =>
  await api.get<never, PostResponse[]>(
    `/posts/discover?page=${page}&size=${size}`,
  );

export const useDiscoverPosts = (page: number, size: number) => {
  return useQuery(["discoverPosts", page, size], () =>
    discoverPosts(page, size),
  );
};
