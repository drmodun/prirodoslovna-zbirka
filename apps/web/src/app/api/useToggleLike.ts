import { useMutation } from "react-query";
import { api } from "./shared";

const toggleLike = (id: string) => api.post(`/likes/${id}`);

export const useToggleLike = () => {
  return useMutation(toggleLike, {
    onError: (error) => {
      if (error === "Unauthorized") {
        alert("You must be logged in to like a post");
      } else {
        alert("An error occurred, please try again later");
      }
    },
  });
};
