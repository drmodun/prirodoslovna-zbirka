import { getUpdatePostRequest } from "@biosfera/types";
import { api } from "./shared";
import { useMutation } from "react-query";
import toast from "react-hot-toast";

export const _updatePostDto = getUpdatePostRequest();
export class UpdatePostDto extends _updatePostDto {}

export const updatePost = async (params: {
  postId: string;
  updatePostDto: UpdatePostDto;
}) => {
  await api.patch(`/posts/${params.postId}`, params.updatePostDto);
};

export const useUpdatePost = () => {
  return useMutation(updatePost, {
    onError: (error: string) => {
      console.log(error);
      toast.error(
        "Greška se dogodila tijekom mijenjanja podataka organizacije",
        { id: "update-post" }
      );
    },
    onSuccess: () => {
      toast.success("Promijenjeni podaci organizacije", {
        id: "update-post",
      });
    },
  });
};
