import { ExponatResponseShort } from "src/exponat/exponatResponses";

export interface CategorizationResponseShort {
  id: string;
  family: string;
  numberOfExponats: number;
}
//TODO: possibly add normal names as alternative to latin ones
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
  exponats: ExponatResponseShort[];
}
