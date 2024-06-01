import { AuthorshipInfo } from "../authorshipInfo/responses";
import { Json } from "../jsonObjects";
import { PostResponse } from "../post/postResponse";

export interface ExponatExtendedResponse {
  id: string;
  title: string;
  description: string;
  exponatKind: string;
  mainImage: string;
  alternateName: string;
  organizationId: string;
  isApproved?: boolean;
  organizationName: string;
  funFacts: string[];
  attributes: Json;
  createdAt: Date;
  authorshipInfo: AuthorshipInfo;
  authorshipInfoId: string;
  updatedAt: Date;
  categorization?: CategorizationResponse;
  posts: PostResponse[];
  favouriteCount: number;
}

export interface ExponatResponseShort {
  id: string;
  name: string;
  description: string;
  mainImage: string;
  alternateName: string;
  isApproved?: boolean;
  updatedAt: Date;
  organizationId: string;
  organizationName: string;
  // postCount: number; not sure if this is needed
  favouriteCount: number;
  exponatKind: string;
  //"Shorts" are designed for card format
}

export interface CategorizationResponse {
  id: string;
  domain: string;
  kingdom: string;
  phylum: string;
  class: string;
  speciesKey: number;
  order: string;
  family: string;
  genus: string;
  species: string;
}
