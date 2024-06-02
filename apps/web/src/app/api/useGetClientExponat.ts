import { useQuery } from "react-query";
import { api } from "./shared";
import { ExponatExtendedResponse } from "@biosfera/types";

export const getClientExponat = async (exponatId: string) =>
  await api.get<never, ExponatExtendedResponse>(`/exponats/${exponatId}`);

export const useGetClientExponat = (exponatId: string) => {
  return useQuery(["exponat", exponatId], () => getClientExponat(exponatId));
};
