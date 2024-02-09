import { useMutation } from "react-query";
import { api } from "./shared";
import toast from "react-hot-toast";

const toggleFollowOrganisations = (id: string) => api.patch(`/favourite-organisations/${id}`);

export const useToggleFollowOrganisation = () => {
  return useMutation(toggleFollowOrganisations, {
    onError: (error) => {
      if (error === "Unauthorized") {
        toast.error("You must be logged in to favourite a post");
      } else {
        toast.error("An error occurred, please try again later");
      }
    },
  });
};
