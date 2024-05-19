import { useQuery } from "react-query";
import { api } from "./shared";
import { SavedLiteratureResponse } from "@biosfera/types";

const getMySavedLiterature = async () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return Promise.reject("No token");
  }
  return await api.get<never, SavedLiteratureResponse[]>(`/literature/me`);
};

export const useGetMySavedLiterature = () =>
  useQuery(["literature"], getMySavedLiterature, {
    onError: (error: string) => {
      console.log(error);
    },
  });
