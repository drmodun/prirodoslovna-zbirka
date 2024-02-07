import { OrganisationResponseShort } from "@biosfera/types";
import { api } from "./shared";
import { useQuery } from "react-query";

const getFollowedOrganisations = async () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return Promise.reject("No token");
  }
  const response = await api.get<never, OrganisationResponseShort[]>(
    "/favourite-organisations/user"
  );
  return response;
};

export const useGetFollowedOrganisations = () => {
  return useQuery(["myFollowedOrganisations"], getFollowedOrganisations);
};
