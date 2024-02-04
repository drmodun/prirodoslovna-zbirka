import { useQuery } from "react-query";
import { api } from "./shared";
import { SpeciesResponse } from "@biosfera/types";

const getSpecies = async (search: string) => {
  const response = await fetch(
    `https://api.gbif.org/v1/species/suggest?rank=SPECIES&q=${search || ""}`
  );
  const data = await response.json();
  return data;
};

export const useGetSpecies = (search: string) => {
  return useQuery(["species" + search], () => getSpecies(search), {
    onSettled: () => {
      console.log("Settled");
    },
    onSuccess(data) {
      console.log(data);
    },
    onError: (error: string) => {
      console.log(error);
    },
  });
};
