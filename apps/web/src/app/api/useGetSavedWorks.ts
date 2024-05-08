import { useQuery } from "react-query";
import { api } from "./shared";

const getSavedWorks = async (id?: string) => {
  if (!id) return;
  await api.get(`saved-works/${id}`);
};

export const useGetSavedWorks = (id?: string) =>
  useQuery(["saved-works", id], () => getSavedWorks(id), {
    enabled: false,
  });
