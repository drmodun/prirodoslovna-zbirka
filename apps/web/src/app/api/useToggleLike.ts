import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";

const toggleLike = (id: string) => api.post(`/likes/${id}`);

export const useToggleLike = () => {
  return useMutation(toggleLike, {
    onError: (error) => {
      if (error === "Unauthorized") {
        toast.error("You must be logged in to like a post");
      } else {
        toast.error("An error occurred, please try again later");
      }
    },
  });
};
