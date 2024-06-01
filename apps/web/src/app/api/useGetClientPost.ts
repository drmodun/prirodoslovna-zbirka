import { useQuery } from "react-query";
import { api } from "./shared";
import { PostResponseExtended } from "@biosfera/types";

export const getClientPost = async (postId: string) =>
  await api.get<never, PostResponseExtended>(`/posts/${postId}`);

export const useGetClientPost = (postId: string) => {
  return useQuery(["post", postId], () => getClientPost(postId));
};
