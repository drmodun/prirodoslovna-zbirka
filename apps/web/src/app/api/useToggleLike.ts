import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";

const toggleLike = (id: string) => api.post(`/likes/${id}`);

export const useToggleLike = () => {
  return useMutation(toggleLike, {
    onError: (error) => {
      if (
        error === "Unauthorized" ||
        error.includes("Unauthorized") ||
        error.includes("You")
      ) {
        toast.error("You must be logged in to like a post", {
          icon: "🔒",
          id: "unauthorized",
        });
      } else {
        toast.error("An error occurred, please try again later", {
          icon: "🚨",
          id: "error",
        });
      }
    },
  });
};
