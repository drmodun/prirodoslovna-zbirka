import { ExponatResponseShort } from "../exponat/exponatResponses";
import { PostResponse } from "../post/postResponse";

export interface ExtendedOrganisationResponse {
  id: string;
  name: string;
  description: string;
  location: string;
  websiteUrl: string;
  mainImage: string;
  otherImages: string[];
  createdAt: Date;
  updatedAt: Date;
  followersAmount: number;
  isFollowing: boolean;

  exponats: ExponatResponseShort[];
}

export interface OrganisationResponseShort {
  id: string;
  name: string;
  description: string;
  location: string;
  websiteUrl: string;
  mainImage: string;
  updatedAt: Date;
}
