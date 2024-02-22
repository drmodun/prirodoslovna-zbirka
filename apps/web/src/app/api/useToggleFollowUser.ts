import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";

const toggleFollow = (id: string) => api.post(`/follows/${id}`);

export const useToggleFollow = () => {
  return useMutation(toggleFollow, {
    onError: (error: string) => {
      if (
        error === "Unauthorized" ||
        error.includes("Unauthorized") ||
        error.includes("You")
      ) {
        toast.error("You must be logged in to favourite a post");
      } else {
        toast.error("An error occurred, please try again later");
      }
    },
  });
};
