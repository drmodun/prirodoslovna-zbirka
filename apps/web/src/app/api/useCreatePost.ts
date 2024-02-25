import { PostResponse, getCreatePostRequest } from "@biosfera/types";
import { api } from "./shared";
import { useMutation } from "react-query";
import toast from "react-hot-toast";

const _createPostDto = getCreatePostRequest();

export class CreatePostDto extends _createPostDto {}

const createPost = (params: { post: CreatePostDto; exponatId: string }) => {
  return api.post<CreatePostDto, PostResponse>(
    `/posts/${params.exponatId}`,
    params.post
  );
};

export const useCreatePost = () => {
  return useMutation(createPost, {
    onError: (error: string) => {
      toast.error(error, { id: "create-post" });
    },
  });
};
