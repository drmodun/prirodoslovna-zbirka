import { ShortUserResponse } from "@biosfera/types";
import { api } from "./shared";
import { useQuery } from "react-query";

const getFollowers = (userId: string) =>
  api.get<never, ShortUserResponse[]>(`/follows/${userId}/followers`);

export const useGetFollowers = (userId: string) => {
  return useQuery(["followers", userId], () => getFollowers(userId));
};
