import { useMutation, useQueryClient } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";

const toggleFavourite = (id: string) => api.patch(`/favourite-exponats/${id}`);

export const useToggleFavourite = () => {
  const queryClient = useQueryClient();
  return useMutation(toggleFavourite, {
    onSuccess: () => {
      queryClient.invalidateQueries("exponats");
    },
    onError: (error: string) => {
      if (
        error === "Unauthorized" ||
        error.includes("Unauthorized") ||
        error.includes("You")
      ) {
        toast.error("You must be logged in to favourite a post", {
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
