import { useMutation } from "react-query";
import { api } from "./shared";

const toggleFavourite = (id: string) => api.patch(`/favourite-exponats/${id}`);

export const useToggleFavourite = () => {
  return useMutation(toggleFavourite, {
    onError: (error) => {
      if (error === "Unauthorized") {
        alert("You must be logged in to favourite a post");
      } else {
        alert("An error occurred, please try again later");
      }
    },
  });
};
