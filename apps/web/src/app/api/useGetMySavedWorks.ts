import { useQuery } from "react-query";
import { api } from "./shared";
import { WorkResponseShort } from "@biosfera/types";

const getMySavedWorks = async () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return Promise.reject("No token");
  }
  return await api.get<never, WorkResponseShort[]>(`/saved-works/me`);
};

export const useGetMySavedWorks = () =>
  useQuery(["saved-works"], getMySavedWorks, {
    onError: (error: string) => {
      console.log(error);
    },
  });
