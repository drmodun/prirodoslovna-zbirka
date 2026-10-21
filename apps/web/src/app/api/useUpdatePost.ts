import { PostResponse, getUpdatePostRequest } from "@biosfera/types";
import { api } from "./shared";
import { useMutation } from "react-query";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export const _updatePostDto = getUpdatePostRequest();
export class UpdatePostDto extends _updatePostDto {}

export const updatePost = async (params: {
  postId: string;
  updatePostDto: UpdatePostDto;
}) => {
  await api.patch<UpdatePostDto, PostResponse>(
    `/posts/${params.postId}`,
    params.updatePostDto,
  );
};

export const useUpdatePost = () => {
  const t = useTranslations("Toasts");
  return useMutation(updatePost, {
    onError: (error: string) => {
      if (
        error === "Unauthorized" ||
        error.includes("Unauthorized") ||
        error.includes("You")
      ) {
        toast.error(t("noPermission"), {
          icon: "🔒",
          id: "unauthorized",
        });
      } else {
        console.log(error);
        toast.error(t("postUpdateFailed"), {
          id: "update-post",
        });
      }
    },
    onSuccess: () => {
      toast.success(t("postUpdated"), {
        id: "update-post",
      });
    },
  });
};
