import { TaxonomyGbifType, TaxonomyRankGbif } from "@biosfera/types";
import toast from "react-hot-toast";
import { useQuery } from "react-query";

const getTaxonomyEntities = async (
  search: string,
  rank: TaxonomyGbifType = "SPECIES",
  higherTaxonId?: number
) => {
  try {
    const response = await fetch(
      `https://api.gbif.org/v1/species/suggest?rank=${rank}${
        higherTaxonId ? `&higherTaxonKey=${higherTaxonId}` : ""
      }&q=${search || ""}`
    );
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const useGetTaxonomyEntities = (
  search: string,
  rank: TaxonomyGbifType,
  higherTaxonKey?: number
) => {
  return useQuery(
    ["species" + rank + search + higherTaxonKey],
    () => getTaxonomyEntities(search, rank, higherTaxonKey),
    {
      onError: (error) => {
        console.log(error);
        toast.error("Došlo je do greške prilikom dohvaćanja podataka");
      },
    }
  );
};
