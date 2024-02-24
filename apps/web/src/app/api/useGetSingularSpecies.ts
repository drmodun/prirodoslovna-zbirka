import { useQuery } from "react-query";

const getSingularSpecies = (species: string) =>
  fetch(`https://api.gbif.org/v1/species/${species}`);

export const useGetSingularSpecies = (species: string) => {
  return useQuery([`species-${species}`], () => getSingularSpecies(species), {
    onError: (error: string) => {
      console.log(error);
    },
  });
};
