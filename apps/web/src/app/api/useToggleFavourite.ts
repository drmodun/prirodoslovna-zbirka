import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";

const toggleFavourite = (id: string) => api.patch(`/favourite-exponats/${id}`);

export const useToggleFavourite = () => {
  return useMutation(toggleFavourite, {
    onError: (error) => {
      if (error === "Unauthorized") {
        toast.error("You must be logged in to favourite a post");
      } else {
        toast.error("An error occurred, please try again later");
      }
    },
  });
};
