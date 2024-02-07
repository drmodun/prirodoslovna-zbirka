import { ShortUserResponse } from "@biosfera/types";
import { api } from "./shared";
import { useQuery } from "react-query";

const getFollowing = (userId?: string) =>
  userId
    ? api.get<never, ShortUserResponse[]>(`/follows/${userId}/following`)
    : Promise.reject("No user id");

export const useGetFollowing = (userId?: string) => {
  return useQuery(["following", userId], () => getFollowing(userId));
};
