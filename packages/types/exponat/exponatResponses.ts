import { Json } from "../jsonObjects";
import { PostResponse } from "../post/postResponse";

export interface ExponatExtendedResponse {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  mainImage: string;
  alternateName: string;
  organizationId: string;
  organizationName: string;
  funFacts: string[];
  attributes: Json;
  createdAt: Date;
  updatedAt: Date;
  categorizationId: string;
  cateforization: CategorizationResponse;
  posts: PostResponse[];

  isFavorite?: boolean;
  favouriteCount: number;
}

export interface ExponatResponseShort {
  id: string;
  title: string;
  description: string;
  mainImage: string;
  alternateName: string;
  organizationId: string;
  organizationName: string;
  updatedAt: Date;
  isFavorite?: boolean;
  favouriteCount: number;
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
