import { ExponatKind } from "../enums";
import { Json } from "../jsonObjects";

export interface CreateExponatRequest {
  name: string;
  alternateName: string;
  exponatKind: ExponatKind;
  description: string;
  funFacts: string[];
  attributes: Json;
  mainImage: string;
  isApproved: boolean;
  cateogorizationId: string;
}

export interface CreateCategorizationRequest {
  genus: string;
  family: string;
  order: string;
  class: string;
  phylum: string;
  kingdom: string;
  domain: string;
}

export interface UpdateExponatRequest {
  name?: string;
  alternateName?: string;
  exponatKind?: ExponatKind;
  description?: string;
  funFacts?: string[];
  attributes?: Json;
  mainImage?: string;
  isApproved?: boolean;
  cateogorisationId?: string;
}
