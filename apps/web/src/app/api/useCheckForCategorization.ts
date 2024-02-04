import { useQuery } from "react-query";
import { api } from "./shared";

export const checkForCategorization = (name: string) =>
  api.get(`/categorization/name/${name}`);

export const useCheckForCategorization = (name: string) => {
  return useQuery(
    ["categorization", name],
    () => checkForCategorization(name),
    {
      onError: (error: string) => {
        throw new Error("Not found");
      },
    }
  );
};
