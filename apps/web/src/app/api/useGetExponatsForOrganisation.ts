import { useQuery } from "react-query";
import { api } from "./shared";
import { ExponatResponseShort } from "@biosfera/types";

export const getExponatsForOrganisation = async (organisationId?: string) => {
  if (!organisationId) {
    return Promise.reject("No organisationId");
  }

  const response = await api.get<never, ExponatResponseShort[]>(`/exponats`, {
    params: {
      organisationId,
    },
  });

  return response;
};

export const useGetExponatsForOrganisation = (organisationId?: string) => {
  return useQuery(["exponats", organisationId], () =>
    getExponatsForOrganisation(organisationId)
  );
};
