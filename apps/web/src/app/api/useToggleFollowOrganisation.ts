import { useMutation } from "react-query";
import { api } from "./shared";

const toggleFollowOrganisations = (id: string) => api.patch(`/favourite-organisations/${id}`);

export const useToggleFollowOrganisation = () => {
  return useMutation(toggleFollowOrganisations, {
    onError: (error) => {
      if (error === "Unauthorized") {
        alert("You must be logged in to favourite a post");
      } else {
        alert("An error occurred, please try again later");
      }
    },
  });
};
