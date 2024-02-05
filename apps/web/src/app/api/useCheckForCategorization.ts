import { useQuery } from "react-query";
import { api } from "./shared";

export const checkForCategorization = (name: string) =>
  api.get(`/categorizations/name/${name}`);

export const useCheckForCategorization = (name: string) => {
  return useQuery(["categorization", name], () => checkForCategorization(name));
};
