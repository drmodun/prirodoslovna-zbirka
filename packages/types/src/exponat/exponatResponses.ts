import { Json } from "../jsonObjects";
import { PostResponse } from "../post/postResponse";

export interface ExponatExtendedResponse {
  id: string;
  title: string;
  description: string;
  mainImage: string;
  alternateName: string;
  organizationId: string;
  isApproved?: boolean;
  organizationName: string;
  funFacts: string[];
  attributes: Json;
  createdAt: Date;
  updatedAt: Date;
  categorization: CategorizationResponse;
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
  organizationId: string;
  organizationName: string;
  updatedAt: Date;
  postCount: number;
  favouriteCount: number;
  exponatKind: string;
  //"Shorts" are designed for card format
}

export interface CategorizationResponse {
  id: string;
  genus: string;
  family: string;
  order: string;
  class: string;
  phylum: string;
  kingdom: string;
  domain: string;
}
