import { useMutation } from "react-query";
import { api } from "./shared";

const toggleFollow = (id: string) => api.post(`/follows/${id}`);

export const useToggleFollow = () => {
  return useMutation(toggleFollow, {
    onError: (error) => {
      if (error === "Unauthorized") {
        alert("You must be logged in to favourite a post");
      } else {
        alert("An error occurred, please try again later");
      }
    },
  });
};
