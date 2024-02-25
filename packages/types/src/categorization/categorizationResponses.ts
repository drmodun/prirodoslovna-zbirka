import { ExponatResponseShort } from "../exponat/exponatResponses";

export interface CategorizationResponseShort {
  id: string;
  species: string;
  family: string;
  numberOfExponats?: number;
}
export interface CategorizationExtendedResponse {
  family: string;
  genus: string;
  domain: string;
  order: string;
  id: string;
  class: string;
  phylum: string;
  numberOfExponats: number;
  kingom: string;
  species: string;
  exponats: ExponatResponseShort[];
}

export interface SpeciesResponse {
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  species: string;
  scientificName: string;
  canonicalName: string;
  rank: string;
}
